import React from "react";
import Head from "next/head";
import TopBar from "./TopBar";
import MainHeader from "./MainHeader";
import HeroSection from "./HeroSection";
import Footer from "./Footer";

const Dashboard: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-gray-100 overflow-x-hidden">
      <TopBar />
      <MainHeader />
      <HeroSection />
      <Footer />
    </div>
  );
};

export default Dashboard;
