import React from "react";
import Link from "next/link";
import { Button } from "antd";

export default function ProvidersPage() {
  return (
    <div className="bg-white min-h-[60vh]">
      {/* Hero section: background image + title + buttons */}
      <section
        className="relative flex flex-col items-center justify-center min-h-[420px] md:min-h-[480px] bg-gray-200 bg-cover bg-center"
        style={{
          backgroundImage: "url('/img/bg-dashboard.png')",
        }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-gray-800 mb-8 drop-shadow-sm">
            Providers
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/providers/create">
              <Button
                type="primary"
                size="large"
                className="!bg-blue-800 hover:!bg-blue-900 !border-0 !h-12 !px-8 !font-medium"
              >
                Add Providers
              </Button>
            </Link>
            <Link href="/providers/wizard">
              <Button
                type="primary"
                size="large"
                className="!bg-blue-800 hover:!bg-blue-900 !border-0 !h-12 !px-8 !font-medium"
              >
                Add Provider Wizard
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
