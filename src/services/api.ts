import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// Create the base axios instance
const api: AxiosInstance = axios.create({
  baseURL: (() => {
    let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    // Ensure HTTPS for production deployments (except for hf.space which handles redirects differently)
    if (baseUrl.includes('hf.space')) {
      // For Hugging Face spaces, we'll use HTTP to avoid redirect issues
      if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
        baseUrl = `https://${baseUrl}`;
      }
      // If it's already https://, leave as is - let the service handle its own redirects
    } else if (!baseUrl.startsWith('https://') && !baseUrl.startsWith('http://')) {
      baseUrl = `https://${baseUrl}`;
    }

    // Remove trailing slash if present to prevent double slashes
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/api`;
  })(), // Replace with your backend URL
  timeout: 30000, // 30 seconds timeout (increased for deployed services)
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to attach the JWT token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // If the error is 401 and not a refresh request, try to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')

        if (refreshToken) {
          let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

          // Ensure HTTPS for production deployments (except for hf.space which handles redirects differently)
          if (baseUrl.includes('hf.space')) {
            // For Hugging Face spaces, we'll use HTTP to avoid redirect issues
            if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
              baseUrl = `https://${baseUrl}`;
            }
            // If it's already https://, leave as is - let the service handle its own redirects
          } else if (!baseUrl.startsWith('https://') && !baseUrl.startsWith('http://')) {
            baseUrl = `https://${baseUrl}`;
          }

          const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
          const response = await axios.post(`${cleanBaseUrl}/api/auth/refresh`, {
            refresh_token: refreshToken
          })

          const newAccessToken = response.data.access_token
          localStorage.setItem('access_token', newAccessToken)

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        } else {
          // No refresh token, redirect to login
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api