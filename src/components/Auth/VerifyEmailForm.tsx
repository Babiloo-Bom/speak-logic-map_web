import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthLayout from './AuthLayout';
import styles from './_Auth.module.scss';

const VerifyEmailForm: React.FC = () => {
  const router = useRouter();
  const { token } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (token && typeof token === 'string') {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        // Redirect to sign in after a delay
        setTimeout(() => {
          router.push('/auth/sign-in');
        }, 3000);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const email = prompt('Please enter your email address to resend verification:');
    
    if (!email) return;

    setResendLoading(true);

    try {
      // For this demo, we'll use the forgot password endpoint
      // In a real app, you'd have a separate resend verification endpoint
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert('Verification email sent! Please check your inbox.');
      } else {
        alert('Failed to resend verification email.');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AuthLayout
        illustration="email"
        title="Verifying Email"
        subtitle="Please wait while we verify your email address."
      >
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div className={styles.spinner} style={{ width: '32px', height: '32px', margin: '0 auto 16px' }} />
          <p>Verifying your email address...</p>
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout
        illustration="check"
        title="Email Verified!"
        subtitle="Your email has been successfully verified."
      >
        <div className={styles.successMessage}>
          {success}
        </div>
        <p style={{ textAlign: 'center', marginBottom: '24px', color: '#8E8E93' }}>
          Redirecting to sign in page in a few seconds...
        </p>
        <Link href="/auth/sign-in" className={styles.primaryButton}>
          Continue to Sign In
        </Link>
      </AuthLayout>
    );
  }

  if (error) {
    return (
      <AuthLayout
        illustration="email"
        title="Verification Failed"
        subtitle="There was a problem verifying your email address."
      >
        <div className={styles.errorBanner}>
          {error}
        </div>
        
        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleResendVerification}
          disabled={resendLoading}
        >
          {resendLoading ? (
            <span className={styles.loading}>
              <span className={styles.spinner} />
              Sending...
            </span>
          ) : (
            'Resend Verification Email'
          )}
        </button>

        <div className={styles.linkGroup}>
          <Link href="/auth/sign-in" className={styles.link}>
            Back to Sign In
          </Link>
          {' | '}
          <Link href="/auth/sign-up" className={styles.link}>
            Sign Up Again
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // If no token is provided
  return (
    <AuthLayout
      illustration="email"
      title="Verify Your Email"
      subtitle="Please check your email for a verification link."
    >
      <p style={{ textAlign: 'center', marginBottom: '24px', color: '#8E8E93' }}>
        We&apos;ve sent a verification link to your email address. Click the link in the email to verify your account.
      </p>

      <button
        type="button"
        className={styles.primaryButton}
        onClick={handleResendVerification}
        disabled={resendLoading}
      >
        {resendLoading ? (
          <span className={styles.loading}>
            <span className={styles.spinner} />
            Sending...
          </span>
        ) : (
          'Resend Verification Email'
        )}
      </button>

      <div className={styles.linkGroup}>
        <Link href="/auth/sign-in" className={styles.link}>
          Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmailForm;


