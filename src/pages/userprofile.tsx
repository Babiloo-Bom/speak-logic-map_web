import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useUserStore } from '@/providers/RootStoreProvider';
import withAuth from '@/components/Auth/withAuth';
import HeaderAuth from '@/components/Auth/Header';
import FooterAuth from '@/components/Auth/Footer';
import Image from "next/image";
import IMG_MAPEXAMPLE from "@/assets/images/MapExample.png";
import LocationMiniMap from '@/components/Profile/LocationMiniMap';
import IMG_ICONUSEREXAMPLE from "@/assets/images/IconUserExample.jpg";

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
  avatar_url?: string;
  pen_name?: string;
  location?: string;
}

interface ApiResponse {
  user: User;
  profile: Profile | null;
}

const ProfilePage: React.FC = () => {

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    title: '',
    function: '',
    penName: '',
    location: '',
  });

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [isEditingFunction, setIsEditingFunction] = useState(false);
  const [functionValue, setFunctionValue] = useState(formData.function || "");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(formData.title || "");

  const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | null>(
    null
  );

  const dfCountryCode = localStorage.getItem('dfCountryCode');

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
            location: data.profile.location || 'USA',
          });

          if (data.profile.avatar_url) {
            setExistingAvatarUrl(data.profile.avatar_url);
          }
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

  const handleUpdateProfile = async (field: string, newValue: string) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const form = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        title: formData.title,
        function: formData.function, // đổi tên
      };

      if (field === 'title') {
        form.title = newValue;
      } else if (field === 'function') {
        form.function = newValue;
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const updatedProfile = { ...profile, [field]: newValue } as Profile;
        setProfile(updatedProfile);
        setFormData((prev) => ({ ...prev, [field]: newValue }));
        setSuccess(`Update ${field} successfully!`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update profile!');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  const handleSaveTitle = async () => {
    setIsEditingTitle(false);
    if (titleValue !== formData.title) {
      await handleUpdateProfile("title", titleValue);
    }
  };

  const handleKeyDownTitle = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveTitle();
    } else if (e.key === "Escape") {
      setTitleValue(formData.title || "");
      setIsEditingTitle(false);
    }
  };

  const handleSaveFunction = async () => {
    setIsEditingFunction(false);
    if (functionValue !== formData.function) {
      await handleUpdateProfile("function", functionValue);
    }
  };

  const handleKeyDownFunction = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSaveFunction();
    } else if (e.key === "Escape") {
      setFunctionValue(formData.function || "");
      setIsEditingFunction(false);
    }
  };

  const resolvedAvatarUrl = existingAvatarUrl
    ? existingAvatarUrl.startsWith("http")
      ? existingAvatarUrl
      : typeof window !== "undefined"
        ? `${window.location.origin}${existingAvatarUrl}`
        : existingAvatarUrl
    : null;

  return (
    <>
      <Head>
        <title>Profile - Function Provider</title>
        <meta name="description" content="Manage your Function Provider profile" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <HeaderAuth />
      <section className="bg-[#FCFCFC] py-16">
        <div className="container max-w-5xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl font-semibold mb-6">User Profile</h2>
          <div className="flex flex-col items-center">
            {resolvedAvatarUrl ? (
              <img
                src={resolvedAvatarUrl}
                alt="Current avatar"
                className="w-32 h-32 rounded-full border-4 border-solid border-[#324899] mb-6"
              />
            ) : (
              <Image
                src={IMG_ICONUSEREXAMPLE}
                alt="User avatar"
                className="w-32 h-32 rounded-full border-4 border-solid border-[#324899] mb-6"
              />
            )}
            <h3 className="text-2xl font-bold text-[#324899] mb-6">{formData.firstName + ' ' + formData.lastName}</h3>
          </div>
          <div className="w-full border border-solid border-[#D0DAEE] rounded-lg px-48 py-6 bg-white">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="font-bold">Title:</p>
                {isEditingTitle ? (
                  <input
                    type="text"
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={handleKeyDownTitle}
                    autoFocus
                    className="border-2 border-black px-2 py-1 rounded w-full"
                  />
                ) : (
                  <p>
                    {formData.title}
                    <button
                      type="button"
                      onClick={() => setIsEditingTitle(true)}
                      className="ml-2 hover:text-blue-700"
                    >
                      ✎
                    </button>
                  </p>
                )}
              </div>
              <div>
                <p className="font-bold">Default Location:</p>
                <p>{formData.location}</p>
              </div>
              <div>
                <p className="font-bold">Function:</p>
                {isEditingFunction ? (
                  <input
                    type="text"
                    value={functionValue}
                    onChange={(e) => setFunctionValue(e.target.value)}
                    onBlur={handleSaveFunction}
                    onKeyDown={handleKeyDownFunction}
                    autoFocus
                    className="border-2 border-black px-2 py-1 rounded w-full"
                  />
                ) : (
                  <p>
                    {formData.function}
                    <button
                      type="button"
                      onClick={() => setIsEditingFunction(true)}
                      className="ml-2 hover:text-blue-700"
                    >
                      ✎
                    </button>
                  </p>
                )}
              </div>
              <div className="">
                {formData.location ? (
                  <LocationMiniMap locationName={formData.location} height={220} />
                ) : (
                  <Image src={IMG_MAPEXAMPLE} alt="World map" className="rounded-lg" />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <FooterAuth />
    </>
  );
};

// Protect the profile page - require authentication and email verification
export default withAuth(ProfilePage, {
  requireEmailVerification: true
});


function elseif(arg0: boolean) {
  throw new Error('Function not implemented.');
}

