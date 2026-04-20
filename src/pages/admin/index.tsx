import React, { useState } from "react";
import { Tabs } from "antd";
import Head from "next/head";
import ManagersList from "./managers/ManagersList";
import ProvidersList from "./providers/ProvidersList";
import NotificationsPanel from "./NotificationsPanel";
import AccountTypeManager from "./users/AccountTypeManager";

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("managers");

  const tabItems = [
    {
      key: "managers",
      label: "Managers",
      children: <ManagersList />,
    },
    {
      key: "providers",
      label: "Providers",
      children: <ProvidersList />,
    },
    {
      key: "account-type",
      label: "Account Type",
      children: <AccountTypeManager />,
    },
    {
      key: "notifications",
      label: "Notifications",
      children: <NotificationsPanel />,
    },
  ];

  return (
    <>
      <Head>
        <title>Admin Dashboard - Speak Logic Map</title>
      </Head>
      <div className="w-full min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage Managers, Providers and Notifications</p>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="bg-white rounded-lg shadow-sm p-4"
          />
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;

