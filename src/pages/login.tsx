import React, { memo, useEffect } from "react";
import { useRouter } from "next/router";
import Head from 'next/head';

const Login: React.FC = (): JSX.Element => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new auth system
    router.push('/auth/sign-in');
  }, [router]);

  return (
    <>
      <Head>
        <title>Redirecting - Function Provider</title>
      </Head>
      <main style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#8E8E93'
      }}>
        Redirecting to sign in...
      </main>
    </>
  )
};
export default memo(Login);
