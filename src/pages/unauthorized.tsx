import React from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useUserStore } from '@/providers/RootStoreProvider';
import { observer } from 'mobx-react-lite';
import styles from '@/components/Auth/_Auth.module.scss';

const Unauthorized: React.FC = () => {
  const router = useRouter();
  const userStore = useUserStore();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  const handleLogout = async () => {
    await userStore.logout();
    router.push('/auth/sign-in');
  };

  return (
    <>
      <Head>
        <title>Unauthorized Access - Function Provider</title>
        <meta name="description" content="You don't have permission to access this page" />
      </Head>
      
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.header}>
            <h1 className={styles.title}>Access Denied</h1>
            <p className={styles.subtitle}>
              You don&apos;t have permission to access this page
            </p>
          </div>

          <div className={styles.content}>
            <div className={styles.iconContainer}>
              <svg 
                width="64" 
                height="64" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={styles.warningIcon}
              >
                <path 
                  d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  stroke="#FF6B6B" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <p className={styles.description}>
              Your current account doesn&apos;t have the necessary permissions to view this content. 
              {userStore.user && (
                <>
                  <br />
                  <strong>Current role:</strong> {userStore.user.role}
                </>
              )}
            </p>

            <div className={styles.buttonGroup}>
              <button 
                onClick={handleGoBack}
                className={styles.secondaryButton}
              >
                Go Back
              </button>
              
              <button 
                onClick={handleGoHome}
                className={styles.primaryButton}
              >
                Go to Home
              </button>
            </div>

            <div className={styles.linkGroup}>
              Need different permissions?{' '}
              <Link href="/profile" className={styles.link}>
                Contact Support
              </Link>
              {' '}or{' '}
              <button 
                onClick={handleLogout}
                className={styles.linkButton}
              >
                Sign in with different account
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .warningIcon {
          margin: 0 auto 20px;
          display: block;
        }
        
        .iconContainer {
          text-align: center;
          margin: 20px 0;
        }
        
        .linkButton {
          background: none;
          border: none;
          color: #4A5FBF;
          text-decoration: underline;
          cursor: pointer;
          font-size: inherit;
          font-family: inherit;
          padding: 0;
        }
        
        .linkButton:hover {
          color: #3A4F9F;
        }
        
        .buttonGroup {
          display: flex;
          gap: 12px;
          margin: 24px 0;
        }
        
        .buttonGroup button {
          flex: 1;
        }
      `}</style>
    </>
  );
};

export default observer(Unauthorized);
