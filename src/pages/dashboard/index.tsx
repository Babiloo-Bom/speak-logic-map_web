import React from "react";
import Head from "next/head";
import HeroSection from "./HeroSection";

const Dashboard: React.FC = () => {
  return (
    <>
      <Head>
        <title>Dashboard - Speak Logic Map</title>
      </Head>
      <HeroSection />
    </>
  );
};

export default Dashboard;
