import React from 'react';
import Head from 'next/head';
import ResetPasswordForm from '@/components/Auth/ResetPasswordForm';

const ResetPasswordPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Reset Password - Function Provider</title>
        <meta name="description" content="Create a new password for your account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ResetPasswordForm />
    </>
  );
};

export default ResetPasswordPage;


