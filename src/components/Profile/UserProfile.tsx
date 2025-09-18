import React, { useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useUserStore } from '@/providers/RootStoreProvider';
import styles from './_Profile.module.scss';

interface User {
  id: number;
  email: string;
  role: string;
  status: string;
  created_at: string;
}

interface Profile {
  user_id: number;
  first_name?: string;
  last_name?: string;
  title?: string;
  function?: string;
  geo_id?: number;
  avatar_id?: number;
  pen_name?: string;
}

interface ApiResponse {
  user: User;
  profile: Profile | null;
}

const UserProfile: React.FC = () => {
  const userStore = useUserStore();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    title: '',
    function: '',
    penName: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('accessToken');
  };

  const fetchProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: ApiResponse = await response.json();
        setUser(data.user);
        setProfile(data.profile);
        
        // Update form data
        if (data.profile) {
          setFormData({
            firstName: data.profile.first_name || '',
            lastName: data.profile.last_name || '',
            title: data.profile.title || '',
            function: data.profile.function || '',
            penName: data.profile.pen_name || '',
          });
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch profile');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = getAuthToken();
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeRole = async (newRole: string) => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/user/change-role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        // Update user data
        if (user) {
          setUser({ ...user, role: newRole });
          // Update localStorage
          const updatedUser = { ...user, role: newRole };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        setSuccess(`Role changed to ${newRole} successfully!`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to change role');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const testProtectedAPI = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/protected/demo', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`API Test Success!\n\nMessage: ${data.message}\nServer Message: ${data.serverMessage}\nTimestamp: ${data.timestamp}`);
      } else {
        const errorData = await response.json();
        alert(`API Test Failed: ${errorData.error}`);
      }
    } catch (error) {
      alert('Network error during API test');
    }
  };

  const testAdminAPI = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('/api/protected/admin', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Admin API Test Success!\n\nMessage: ${data.message}\nAdmin Data: ${JSON.stringify(data.adminData, null, 2)}`);
      } else {
        const errorData = await response.json();
        alert(`Admin API Test Failed: ${errorData.error}`);
      }
    } catch (error) {
      alert('Network error during admin API test');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.error}>
        <p>Failed to load user profile</p>
        {error && <p className={styles.errorMessage}>{error}</p>}
      </div>
    );
  }

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <h1>User Profile</h1>
        <div className={styles.actions}>
          <button
            onClick={testProtectedAPI}
            className={styles.testButton}
          >
            Test Protected API
          </button>
          {user.role === 'admin' && (
            <button
              onClick={testAdminAPI}
              className={styles.testButton}
            >
              Test Admin API
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          {error}
        </div>
      )}

      {success && (
        <div className={styles.successBanner}>
          {success}
        </div>
      )}

      <div className={styles.profileCard}>
        <div className={styles.section}>
          <h2>Account Information</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Email:</label>
              <span>{user.email}</span>
            </div>
            <div className={styles.infoItem}>
              <label>Role:</label>
              <span className={`${styles.badge} ${styles[user.role]}`}>
                {user.role}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label>Status:</label>
              <span className={`${styles.badge} ${styles[user.status]}`}>
                {user.status}
              </span>
            </div>
            <div className={styles.infoItem}>
              <label>Member Since:</label>
              <span>{new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Profile Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={styles.editButton}
              disabled={isSaving}
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          <div className={styles.profileForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="firstName">First Name:</label>
                {isEditing ? (
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                ) : (
                  <span>{formData.firstName || 'Not set'}</span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="lastName">Last Name:</label>
                {isEditing ? (
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                ) : (
                  <span>{formData.lastName || 'Not set'}</span>
                )}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="title">Title:</label>
                {isEditing ? (
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                ) : (
                  <span>{formData.title || 'Not set'}</span>
                )}
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="function">Function:</label>
                {isEditing ? (
                  <input
                    type="text"
                    id="function"
                    name="function"
                    value={formData.function}
                    onChange={handleInputChange}
                    className={styles.input}
                  />
                ) : (
                  <span>{formData.function || 'Not set'}</span>
                )}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="penName">Pen Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  id="penName"
                  name="penName"
                  value={formData.penName}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              ) : (
                <span>{formData.penName || 'Not set'}</span>
              )}
            </div>

            {isEditing && (
              <div className={styles.formActions}>
                <button
                  onClick={handleSave}
                  className={styles.saveButton}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2>Demo Actions</h2>
          <div className={styles.demoActions}>
            <div className={styles.roleChanger}>
              <label>Change Role (Demo):</label>
              <div className={styles.roleButtons}>
                <button
                  onClick={() => handleChangeRole('user')}
                  className={`${styles.roleButton} ${user.role === 'user' ? styles.active : ''}`}
                >
                  User
                </button>
                <button
                  onClick={() => handleChangeRole('admin')}
                  className={`${styles.roleButton} ${user.role === 'admin' ? styles.active : ''}`}
                >
                  Admin
                </button>
                <button
                  onClick={() => handleChangeRole('moderator')}
                  className={`${styles.roleButton} ${user.role === 'moderator' ? styles.active : ''}`}
                >
                  Moderator
                </button>
                <button
                  onClick={() => handleChangeRole('premium')}
                  className={`${styles.roleButton} ${user.role === 'premium' ? styles.active : ''}`}
                >
                  Premium
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default observer(UserProfile);


