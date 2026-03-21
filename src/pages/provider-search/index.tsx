import React from "react";
import dynamic from "next/dynamic";

/** Leaflet chỉ chạy client — tránh import khi `next build` collect page data */
const ProviderSearch = dynamic(
  () => import("@/components/provider-search/ProviderSearch"),
  { ssr: false }
);

function ProviderSearchPage() {
  return <ProviderSearch />;
}

export default ProviderSearchPage;
