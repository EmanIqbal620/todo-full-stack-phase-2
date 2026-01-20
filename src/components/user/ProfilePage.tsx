// frontend/src/components/user/ProfilePage.tsx
// User profile page component

import React, { useState, useEffect } from 'react';

interface UserProfile {
  user_id: string;
  email: string;
  name?: string;
  created_at?: string;
}

interface ProfilePageProps {
  userId?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userId }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // In a real application, this would call the user profile API
      // For now, we'll simulate the API call
      const response = await fetch(`/api/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Authorization header would be added by our API client with JWT
        },
      });

      if (response.ok) {
        const data: UserProfile = await response.json();
        setUserProfile(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to fetch user profile');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!userProfile) {
    return <div>No user profile found</div>;
  }

  return (
    <div className="profile-page">
      <h1>User Profile</h1>
      <div className="profile-info">
        <div className="info-item">
          <strong>ID:</strong> {userProfile.user_id}
        </div>
        <div className="info-item">
          <strong>Email:</strong> {userProfile.email}
        </div>
        {userProfile.name && (
          <div className="info-item">
            <strong>Name:</strong> {userProfile.name}
          </div>
        )}
        {userProfile.created_at && (
          <div className="info-item">
            <strong>Member Since:</strong> {new Date(userProfile.created_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;