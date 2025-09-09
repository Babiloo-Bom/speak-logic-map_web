import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthLayout from './AuthLayout';
import styles from './_Auth.module.scss';

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

const SignInForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Store access token
        localStorage.setItem('accessToken', data.accessToken);
        
        // Store user data
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        router.push('/');
      } else {
        if (data.code === 'ACCOUNT_PENDING') {
          setErrors({ general: data.error });
        } else if (data.code === 'ACCOUNT_SUSPENDED') {
          setErrors({ general: data.error });
        } else {
          setErrors({ general: data.error || 'Login failed' });
        }
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: Implement social login
    console.log(`Login with ${provider}`);
    alert(`${provider} login will be implemented in the next phase`);
  };

  return (
    <AuthLayout
      illustration="lock"
      title="Sign In"
    >
      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div className={styles.errorBanner}>
            {errors.general}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            className={`${styles.input} ${errors.email ? styles.error : ''}`}
            disabled={isLoading}
          />
          {errors.email && (
            <span className={styles.errorMessage}>{errors.email}</span>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password" className={styles.label}>
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            className={`${styles.input} ${errors.password ? styles.error : ''}`}
            disabled={isLoading}
          />
          {errors.password && (
            <span className={styles.errorMessage}>{errors.password}</span>
          )}
        </div>

<div className={styles.additionalSection}>
        <Link href="/auth/forgot-password" className={styles.forgotPassword}>
          Forgot your password?
        </Link>

        <div className={styles.linkGroup}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/sign-up" className={styles.link}>
            Sign up
          </Link>
        </div>
</div>

        <button
          type="submit"
          className={styles.primaryButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className={styles.loading}>
              <span className={styles.spinner} />
              Signing In...
            </span>
          ) : (
            'Sign In'
          )}
        </button>

        <div className={styles.divider}>
          <span className={styles.dividerText}>OR</span>
        </div>

        <button
          type="button"
          className={styles.socialButton}
          onClick={() => handleSocialLogin('Google')}
          disabled={isLoading}
        >
          Continue with Google
        </button>

        <button
          type="button"
          className={styles.socialButton}
          onClick={() => handleSocialLogin('Facebook')}
          disabled={isLoading}
        >
          Continue with Facebook
        </button>

        <button
          type="button"
          className={styles.socialButton}
          onClick={() => handleSocialLogin('Apple')}
          disabled={isLoading}
        >
          Continue with Apple
        </button>
      </form>
    </AuthLayout>
  );
};

export default SignInForm;


