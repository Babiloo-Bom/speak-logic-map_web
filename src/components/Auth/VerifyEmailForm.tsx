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

  // useEffect(() => {
  //   if (token && typeof token === 'string') {
  //     verifyEmail(token);
  //   }
  // }, [token]);

  // const verifyEmail = async (verificationToken: string) => {
  //   setIsLoading(true);
  //   setError('');

  //   try {
  //     const response = await fetch('/api/auth/verify', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ token: verificationToken }),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       setSuccess(data.message);
  //       // Redirect to sign in after a delay
  //       setTimeout(() => {
  //         router.push('/auth/sign-in');
  //       }, 3000);
  //     } else {
  //       setError(data.errors || 'Verification failed');
  //     }
  //   } catch (errors) {
  //     setError('Network errors. Please try again.');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleResendVerification = async () => {
  //   const email = prompt('Please enter your email address to resend verification:');

  //   if (!email) return;

  //   setResendLoading(true);

  //   try {
  //     // For this demo, we'll use the forgot password endpoint
  //     // In a real app, you'd have a separate resend verification endpoint
  //     const response = await fetch('/api/auth/verify-password', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ email }),
  //     });

  //     if (response.ok) {
  //       alert('Verification email sent! Please check your inbox.');
  //     } else {
  //       alert('Failed to resend verification email.');
  //     }
  //   } catch (errors) {
  //     alert('Network errors. Please try again.');
  //   } finally {
  //     setResendLoading(false);
  //   }
  // };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   // if (!validateForm()) return;

  //   setIsLoading(true);
  //   setError('');
  //   setSuccess('');

  //   try {
  //     const response = await fetch('/api/auth/forgot-password', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       setSuccess(data.message);
  //     } else {
  //       // setError({ general: data.errors || 'Failed to send reset email' });
  //     }
  //   } catch (errors) {
  //     // setError({ general: 'Network errors. Please try again.' });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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

  // if (isLoading) {
  //   return (
  //     <ForgotPasswordLayout
  //       illustration="email"
  //       title="Verifying Email"
  //       subtitle="Please wait while we verify your email address."
  //     >
  //       <div style={{ textAlign: 'center', padding: '40px 0' }}>
  //         <div className={styles.spinner} style={{ width: '32px', height: '32px', margin: '0 auto 16px' }} />
  //         <p>Verifying your email address...</p>
  //       </div>
  //     </ForgotPasswordLayout>
  //   );
  // }

  // if (success) {
  //   return (
  //     <ForgotPasswordLayout
  //       illustration="check"
  //       title="Email Verified!"
  //       subtitle="Your email has been successfully verified."
  //     >
  //       <div className={styles.successMessage}>
  //         {success}
  //       </div>
  //       <p style={{ textAlign: 'center', marginBottom: '24px', color: '#8E8E93' }}>
  //         Redirecting to sign in page in a few seconds...
  //       </p>
  //       <Link href="/auth/sign-in" className={styles.primaryButton}>
  //         Continue to Sign In
  //       </Link>
  //     </ForgotPasswordLayout>
  //   );
  // }

  // if (errors) {
  //   return (
  //     <ForgotPasswordLayout
  //       illustration="email"
  //       title="Verification Failed"
  //       subtitle="There was a problem verifying your email address."
  //     >
  //       <div className={styles.errorBanner}>
  //         {errors}
  //       </div>

  //       <button
  //         type="button"
  //         className={styles.primaryButton}
  //         onClick={handleResendVerification}
  //         disabled={resendLoading}
  //       >
  //         {resendLoading ? (
  //           <span className={styles.loading}>
  //             <span className={styles.spinner} />
  //             Sending...
  //           </span>
  //         ) : (
  //           'Resend Verification Email'
  //         )}
  //       </button>

  //       <div className={styles.linkGroup}>
  //         <Link href="/auth/sign-in" className={styles.link}>
  //           Back to Sign In
  //         </Link>
  //         {' | '}
  //         <Link href="/auth/sign-up" className={styles.link}>
  //           Sign Up Again
  //         </Link>
  //       </div>
  //     </ForgotPasswordLayout>
  //   );
  // }

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


