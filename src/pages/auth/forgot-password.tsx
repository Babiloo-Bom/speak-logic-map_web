import React from 'react';
import Head from 'next/head';
import ForgotPasswordForm from '@/components/Auth/ForgotPasswordForm';

const ForgotPasswordPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Forgot Password - Function Provider</title>
        <meta name="description" content="Reset your password" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <ForgotPasswordForm />
    </>
  );
};

export default ForgotPasswordPage;


