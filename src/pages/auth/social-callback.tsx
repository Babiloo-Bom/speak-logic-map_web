import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthLayout from '@/components/Auth/AuthLayout';
import styles from '@/components/Auth/_Auth.module.scss';
import { useUserStore } from '@/providers/RootStoreProvider';
import type { User, UserProfile } from '@/lib/auth';

interface SocialLoginPayload {
  accessToken: string;
  user: User;
  profile?: UserProfile | null;
}

const decodePayload = (encoded: string): SocialLoginPayload | null => {
  try {
    const json = typeof window !== 'undefined' ? window.atob(encoded) : Buffer.from(encoded, 'base64').toString('utf-8');
    return JSON.parse(json);
  } catch (error) {
    console.error('Failed to decode social login payload:', error);
    return null;
  }
};

const SocialCallback: React.FC = () => {
  const router = useRouter();
  const userStore = useUserStore();
  const [error, setError] = useState<string | null>(null);

  const providerParam = typeof router.query.provider === 'string' ? router.query.provider : undefined;
  const providerName = providerParam ? providerParam.charAt(0).toUpperCase() + providerParam.slice(1) : 'social';

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const { data } = router.query;

    if (typeof data !== 'string') {
      setError(`We could not complete your ${providerName} sign in. Please try again.`);
      return;
    }

    const payload = decodePayload(data);

    if (!payload || !payload.accessToken || !payload.user) {
      setError(`We could not complete your ${providerName} sign in. Please try again.`);
      return;
    }

    userStore.setAuthData(payload.user, payload.accessToken, payload.profile);
    router.replace('/');
  }, [providerName, router, userStore]);

  if (error) {
    return (
      <AuthLayout illustration="lock" title={`${providerName} Sign-In Failed`}>
        <p style={{ textAlign: 'center', marginBottom: '24px', color: '#8E8E93' }}>
          {error}
        </p>
        <Link href="/auth/sign-in" className={styles.secondaryButton}>
          Back to Sign In
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout illustration="check" title="Signing You In">
      <div className={styles.loading} style={{ justifyContent: 'center' }}>
        <span className={styles.spinner} />
        <span>Signing you in with {providerName}...</span>
      </div>
    </AuthLayout>
  );
};

export default SocialCallback;
