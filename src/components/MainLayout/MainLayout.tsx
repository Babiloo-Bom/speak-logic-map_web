import React from "react";
import TopBar from "./TopBar";
import MainHeader from "./MainHeader";
import Footer from "./Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="w-full min-h-screen bg-gray-100 overflow-x-hidden flex flex-col">
      <TopBar />
      <MainHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
