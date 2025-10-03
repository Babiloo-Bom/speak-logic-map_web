import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ForgotPasswordLayout from './ForgotPasswordLayout';
import styles from './_Auth.module.scss';
import crypto from "crypto";

interface FormData {
  email: string;
  code: string;
}
interface FormErrors {
  email?: string;
  general?: string;
}

const VerifyEmailForm: React.FC = () => {
  const router = useRouter();
  const { token } = router.query;
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    code: '',
  });
  const [isDone, setIsDone] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    formData.email = validateToken(token);

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
        setIsDone(true)
      } else {
        setErrors({ general: 'Failed to verify code' });
      }
    } catch (errors) {
      setErrors({ general: 'Network errors. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    formData.email = validateToken(token);

    setIsLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const response = await fetch('/api/auth/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
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
  }

  const validateToken = (token: string): string | null => {
    if (!token) {
      setErrors({ general: 'The token invalid!' });
    }
    const SECRET = process.env.JWT_SECRET || "93191c50041fd5d5fd66d09f0";
    const [base, sig] = token.split(".");
    const expectedSig = crypto.createHmac("sha256", SECRET).update(base).digest("base64");
    if (sig !== expectedSig) {
      setErrors({ general: 'Invalid signature' });
    }
    const payload = JSON.parse(Buffer.from(base, "base64").toString());
    if (payload.exp < Date.now()) {
      setErrors({ general: 'Token expired' });
    }
    return payload.email;
  }

  // If no token is provided
  return (
    <ForgotPasswordLayout
      illustration="verify"
      title="Verify"
      subtitle="Enter Verification Code Just Sent To Your Email Address"
    >
      <form className="w-full flex flex-col gap-8" onSubmit={handleSubmit}>
        {errors.general && (
          <div className={styles.errorBanner}>
            {errors.general}
          </div>
        )}
        {success && <div className={styles.successMessage}>
          {success}
        </div>}
        {!isDone && (
        <><div className={styles.formGroup}>
            <input
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="Enter code"
              className={`${styles.input} ${errors.email ? styles.errors : ''}`}
              disabled={isLoading} />
          </div><div className='text-center'>
              <a href='#' onClick={handleResendCode} className='text-base font-medium text-[#324899]'>Resend code</a>
            </div></>)}
        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleSubmit}
          disabled={resendLoading}
        >
          {resendLoading ? (
            <span className={styles.loading}>
              <span className={styles.spinner} />
              Sending...
            </span>
          ) : (
            'Verify'
          )}
        </button>
      </form>
    </ForgotPasswordLayout>
  );
};

export default VerifyEmailForm;


