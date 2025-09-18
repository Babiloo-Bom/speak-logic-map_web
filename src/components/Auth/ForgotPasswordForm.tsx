import React, { useState } from 'react';
import Link from 'next/link';
import AuthLayout from './AuthLayout';
import styles from './_Auth.module.scss';

interface FormData {
  email: string;
}

interface FormErrors {
  email?: string;
  general?: string;
}

const ForgotPasswordForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
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

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
      } else {
        setErrors({ general: data.error || 'Failed to send reset email' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout
        illustration="email"
        title="Check Your Email"
        subtitle="We've sent a password reset link to your email address."
      >
        <div className={styles.successMessage}>
          {success}
        </div>
        <p style={{ textAlign: 'center', marginBottom: '24px', color: '#8E8E93' }}>
          If you don&apos;t see the email in your inbox, please check your spam folder.
        </p>
        <div className={styles.linkGroup}>
          <Link href="/auth/sign-in" className={styles.link}>
            Back to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      illustration="lock"
      title="Forgot Password"
      subtitle="Enter your email address and we'll send you a link to reset your password."
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
            placeholder="Enter your email address"
            className={`${styles.input} ${errors.email ? styles.error : ''}`}
            disabled={isLoading}
          />
          {errors.email && (
            <span className={styles.errorMessage}>{errors.email}</span>
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
              Sending...
            </span>
          ) : (
            'Send Reset Link'
          )}
        </button>

        <div className={styles.linkGroup}>
          Remember your password?{' '}
          <Link href="/auth/sign-in" className={styles.link}>
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPasswordForm;


