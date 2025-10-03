import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ForgotPasswordLayout from './ForgotPasswordLayout';
import styles from './_Auth.module.scss';
import crypto from "crypto";

interface FormData {
  email: string;
}

interface FormErrors {
  email?: string;
  general?: string;
}

const ForgotPasswordForm: React.FC = () => {
  const router = useRouter();
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
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        const SECRET = process.env.JWT_SECRET || "93191c50041fd5d5fd66d09f0";
        const email = formData.email;
        const exp = Date.now() + 15 * 60 * 1000;
        const payload = JSON.stringify({ email, exp });
        const base = Buffer.from(payload).toString("base64");
        const sig = crypto.createHmac("sha256", SECRET).update(base).digest("base64"); 
        const token = `${base}.${sig}`;
        router.push(`/auth/verify-password?token=${token}`);
      } else {
        setErrors({ general: data.error || 'Failed to send reset email' });
      }
    } catch (error) {
      console.error(error);
      console.log(error);
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ForgotPasswordLayout
      illustration="forgot"
      title="Verify"
      subtitle="Please Enter Your Email Address To Receive a Verification Code"
    >
      <form className="w-full flex flex-col gap-8" onSubmit={handleSubmit}>
        {errors.general && (
          <div className={styles.errorBanner}>
            {errors.general}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="email" className="text-base font-medium text-[#1D2A44]">
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
        <div className='text-center'>
          <a href='#' className='text-base font-medium text-[#324899] underline'>Try another way</a>
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
            'Send'
          )}
        </button>
      </form>
    </ForgotPasswordLayout>
  );
};

export default ForgotPasswordForm;


