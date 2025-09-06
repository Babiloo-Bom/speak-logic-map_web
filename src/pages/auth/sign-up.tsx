import React from 'react';
import Head from 'next/head';
import SignUpForm from '@/components/Auth/SignUpForm';

const SignUpPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Sign Up - Function Provider</title>
        <meta name="description" content="Create your Function Provider account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <SignUpForm />
    </>
  );
};

export default SignUpPage;


