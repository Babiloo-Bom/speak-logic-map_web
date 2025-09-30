import React from 'react';
import styles from './_Auth.module.scss';
import Image from "next/image";
import BackgoundAuth from "@/assets/images/BackgoundAuth.png";
import IMG_LOGO from "@/assets/images/Logo.png";

interface AuthLayoutProps {
  children: React.ReactNode;
  illustration: 'lock' | 'email' | 'check';
  title: string;
  subtitle?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, illustration, title, subtitle }) => {
  const renderIllustration = () => {
    switch (illustration) {
      case 'lock':
        return (
          <div className={styles.iconContainer}>
            <div className={styles.securityIcon} />
          </div>
        );
      case 'check':
        return (
          <div className={styles.iconContainer}>
            <div className={styles.securityIcon} />
            <div className={styles.checkmarkIcon} />
          </div>
        );
      case 'email':
        return (
          <div className={styles.illustration}>
            <div className={styles.emailIcon} />
          </div>
        );
      default:
        return (
          <div className={styles.iconContainer}>
            <div className={styles.securityIcon} />
          </div>
        );
    }
  };

  return (
    <div className={styles.authLayout}>
      <div className={styles.leftColumn} style={{ backgroundImage: `url(${BackgoundAuth.src})` }}>
        {/* Logo */}
        {/* <div className={styles.logo}>
          <div className={styles.logoIcon}>FP</div>
          <div className={styles.logoText}>
            <div className={styles.logoTitle}>Function Provider</div>
            <div className={styles.logoTagline}>Function Solves Problem</div>
          </div>
        </div> */}
        <div>
            <Image src={IMG_LOGO} alt="Logo" width={272} height={106} />
        </div>

        {/* Decorative shapes */}
        {/* <div className={styles.backgroundShape + ' ' + styles.shape1} />
        <div className={styles.backgroundShape + ' ' + styles.shape2} />
        <div className={styles.backgroundShape + ' ' + styles.shape3} /> */}

        {/* Illustration */}
        {/* <div className={styles.illustration}>
          {renderIllustration()}
        </div> */}
      </div>

      <div className={styles.rightColumn}>
        <div className={`${styles.formContainer} flex flex-col gap-8`}>
            <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;


