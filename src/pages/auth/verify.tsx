import React from 'react';
import Head from 'next/head';
import VerifyEmailForm from '@/components/Auth/VerifyEmailForm';

const VerifyPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Verify Email - Function Provider</title>
        <meta name="description" content="Verify your email address" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <VerifyEmailForm />
    </>
  );
};

export default VerifyPage;


