import { AxiosError, AxiosResponse } from 'axios'
import axios from 'axios'



export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    // ❌ Do NOT retry refresh endpoint itself
    if (originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    // ❌ Already retried once
    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      // ✅ Attempt refresh ONLY ONCE
      await apiClient.post('/auth/refresh')

      return apiClient(originalRequest)
    } catch {
      // ✅ Refresh failed → user is not logged in
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  }
)
