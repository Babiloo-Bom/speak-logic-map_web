import React from "react";
import Head from "next/head";

export default function MyArticlesPage() {
  return (
    <>
      <Head>
        <title>My Articles - Function Provider</title>
      </Head>
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center text-gray-600">
          <h1 className="text-2xl font-semibold mb-2">My Articles</h1>
          <p className="text-sm">Nội dung đang được cập nhật.</p>
        </div>
      </div>
    </>
  );
}
