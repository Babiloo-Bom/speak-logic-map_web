import React from 'react';
import Head from 'next/head';
import UserProfile from '@/components/Profile/UserProfile';
import withAuth from '@/components/Auth/withAuth';

const ProfilePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Profile - Function Provider</title>
        <meta name="description" content="Manage your Function Provider profile" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <UserProfile />
    </>
  );
};

// Protect the profile page - require authentication and email verification
export default withAuth(ProfilePage, {
  requireEmailVerification: true
});


