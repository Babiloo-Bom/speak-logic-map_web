import React from 'react';
import Head from 'next/head';
import VerifyPasswordForm from '@/components/Auth/VerifyPasswordForm';

const VerifyPasswordPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Verify password - Function Provider</title>
        <meta name="description" content="Verify your password" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <VerifyPasswordForm />
    </>
  );
};

export default VerifyPasswordPage;


