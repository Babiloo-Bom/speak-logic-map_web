import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AuthLayout from './AuthLayout';
import styles from './_Auth.module.scss';
import { useUserStore } from '@/providers/RootStoreProvider';
import { observer } from 'mobx-react-lite';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const SignUpForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        // Optionally redirect to sign in after a delay
        setTimeout(() => {
          router.push('/auth/sign-in');
        }, 3000);
      } else {
        if (response.status === 409) {
          setErrors({ email: 'An account with this email already exists' });
        } else {
          setErrors({ general: data.error || 'Registration failed' });
        }
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = (provider: string) => {
    // TODO: Implement social signup
    console.log(`Sign up with ${provider}`);
    alert(`${provider} signup will be implemented in the next phase`);
  };

  if (success) {
    return (
      <AuthLayout
        illustration="email"
        title="Check Your Email"
        subtitle="We've sent a verification link to your email address."
      >
        <div className={styles.successMessage}>
          {success}
        </div>
        <p style={{ textAlign: 'center', marginBottom: '24px', color: '#8E8E93' }}>
          Redirecting to sign in page in a few seconds...
        </p>
        <Link href="/auth/sign-in" className={styles.secondaryButton}>
          Back to Sign In
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      illustration="lock"
      title="Sign Up"
    >
      <form onSubmit={handleSubmit}>
        {errors.general && (
          <div className={styles.errorBanner}>
            {errors.general}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="firstName" className={styles.label}>
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="Name"
            className={`${styles.input} ${errors.firstName ? styles.error : ''}`}
            disabled={isLoading}
          />
          {errors.firstName && (
            <span className={styles.errorMessage}>{errors.firstName}</span>
          )}
        </div>

        <div className={styles.formGroup}>
        <label htmlFor="firstName" className={styles.label}>
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Last name"
            className={`${styles.input} ${errors.lastName ? styles.error : ''}`}
            disabled={isLoading}
          />
          {errors.lastName && (
            <span className={styles.errorMessage}>{errors.lastName}</span>
          )}
        </div>

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
            placeholder="Email"
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

        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            className={`${styles.input} ${errors.confirmPassword ? styles.error : ''}`}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <span className={styles.errorMessage}>{errors.confirmPassword}</span>
          )}
        </div>

        <button
          type="submit"
          className={styles.primaryButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className={styles.loading}>
              <span className={styles.spinner} />
              Creating Account...
            </span>
          ) : (
            'Sign Up'
          )}
        </button>

        <div className={styles.divider}>
          <span className={styles.dividerText}>OR</span>
        </div>

        <button
          type="button"
          className={styles.socialButton}
          onClick={() => handleSocialSignUp('Google')}
          disabled={isLoading}
        >
          Continue with Google
        </button>

        <button
          type="button"
          className={styles.socialButton}
          onClick={() => handleSocialSignUp('Facebook')}
          disabled={isLoading}
        >
          Continue with Facebook
        </button>

        <button
          type="button"
          className={styles.socialButton}
          onClick={() => handleSocialSignUp('Apple')}
          disabled={isLoading}
        >
          Continue with Apple
        </button>

        <div className={styles.linkGroup}>
          Already have an account?{' '}
          <Link href="/auth/sign-in" className={styles.link}>
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default observer(SignUpForm);


