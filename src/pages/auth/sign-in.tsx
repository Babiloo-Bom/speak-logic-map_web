import React from 'react';
import Head from 'next/head';
import SignInForm from '@/components/Auth/SignInForm';

const SignInPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Sign In - Function Provider</title>
        <meta name="description" content="Sign in to your Function Provider account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SignInForm />
    </>
  );
};

export default SignInPage;


