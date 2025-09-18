import HomePage from '@/components/HomePage/HomePage';
import Layout from '@/components/Layout/Layout';
import styles from '@/styles/Home.module.css';
import { observer } from 'mobx-react-lite';
import Head from 'next/head';
import React from 'react';
import withAuth from '@/components/Auth/withAuth';

const Home: React.FC = (): JSX.Element => {
  return (
    <>
      <Head>
        <title>Map - Main</title>
      </Head>
      <main className='main'>
        <HomePage />
      </main>
    </>
  )
}

// Protect the home page - require authentication and email verification
export default withAuth(observer(Home), {
  requireEmailVerification: true
});
