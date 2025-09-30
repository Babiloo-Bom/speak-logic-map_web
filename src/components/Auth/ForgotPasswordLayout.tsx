import React from 'react';
import styles from './_Auth.module.scss';
import Image from "next/image";
import IMG_LOGO from "@/assets/images/Logo.png";
import ICON_LOCK from "@/assets/icons/icon-lock.png";
import ICON_VERIFY from "@/assets/icons/icon-verify.png";
import ICON_RESETPASSWORD from "@/assets/icons/icon-resetpassword.png";

interface ForgotPasswordLayoutProps {
  children: React.ReactNode;
  illustration: 'forgot' | 'verify' | 'reset';
  title: string;
  subtitle?: string;
}

const ForgotPasswordLayout: React.FC<ForgotPasswordLayoutProps> = ({ children, illustration, title, subtitle }) => {
  const renderIllustration = () => {
    switch (illustration) {
      case 'verify':
        return (
          <Image src={ICON_VERIFY} alt="ICON_VERIFY" />
        );
      case 'reset':
        return (
          <Image src={ICON_RESETPASSWORD} alt="ICON_RESETPASSWORD" />
        );
      default:
        return (
          <Image src={ICON_LOCK} alt="ICON_LOCK" />
        );
    }
  };

  return (
    <div className={styles.authLayout}>
      <div className={`${styles.leftColumn} flex flex-col !justify-start items-center`}>
        <div>
          <Image src={IMG_LOGO} alt="Logo" width={272} height={106} />
        </div>
        <div>
          {renderIllustration()}
        </div>
      </div>

      <div className={`${styles.rightColumn} items-center`}>
        <div className={`${styles.formContainer} flex flex-col items-center gap-8`}>
          <h1 className={`text-5xl font-bold text-[#333333]`}>{title}</h1>
          {subtitle && <p className={`text-2xl font-medium text-[#1D2A44] text-center px-10`}>{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordLayout;


