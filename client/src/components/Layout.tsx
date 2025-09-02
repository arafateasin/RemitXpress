import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import NotificationPermissionBanner from "./NotificationPermissionBanner";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="container px-4 mx-auto">
        <NotificationPermissionBanner />
      </div>
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
