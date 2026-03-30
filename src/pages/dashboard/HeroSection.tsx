import { Button, Image, Input, Radio } from "antd";
import FeatureItem from "./FeatureItem";
import { MenuOutlined, SearchOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { DASHBOARD_HEADER_TABS, DASHBOARD_MANAGER_FILTER_TABS, itemsTabs } from "@/lib/pages/dashboard/constants";
import { useCallback, useState } from "react";
import AdvanceSearch from "./AdvanceSearch";
import { baseDataRequest } from "@/lib/pages/dashboard/request";

const MapIcon = () => <Image preview={false} src="/icons/solar_map-outline.svg" alt="map" style={{ width: "1em", height: "1em" }} />;

const tabButtonBase =
  "px-10 py-3 rounded-md border-[2px] border-solid border-[#324899] text-sm font-semibold transition-colors";
const tabButtonInactive = `${tabButtonBase} bg-transparent text-[#324899] hover:bg-[#324899] hover:text-white`;
const tabButtonActive = `${tabButtonBase} bg-[#324899] text-white`;

/** Cùng màu xanh cho toàn bộ nút lọc (Providers … All) */
const filterButtonBlue = "px-4 py-2 rounded-md text-sm bg-[#324899] text-white border border-[#324899] font-medium hover:bg-[#2a3d85] hover:text-white";

const HeroSection = () => {
  const router = useRouter();
  const [openAdvanceSearch, setOpenAdvanceSearch] = useState(false);
  const [dataRequest, setDataRequest] = useState(baseDataRequest);
  /** Tab trên: Providers | Managers | News — mặc định Providers */
  const [activeMainTab, setActiveMainTab] = useState<string>("provider");
  /** Nút lọc dưới — sort theo provider-search */
  const [activeFilterField, setActiveFilterField] = useState<string>("provider");

  const buildQueryString = useCallback(() => {
    const queryParams = new URLSearchParams();
    Object.entries(dataRequest).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value));
    });
    const qs = queryParams.toString();
    return qs ? `?${qs}` : "";
  }, [dataRequest]);

  /** Đi tới provider-search kèm sortBy (sortOverride khi vừa bấm nút, state chưa kịp commit). */
  const goProviderSearch = useCallback(
    (sortOverride?: string) => {
      const sort = sortOverride ?? activeFilterField;
      const params = new URLSearchParams();
      Object.entries(dataRequest).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
      params.set("sortBy", sort);
      const qs = params.toString();
      router.push(`/provider-search${qs ? `?${qs}` : ""}`);
    },
    [dataRequest, activeFilterField, router]
  );

  /** Đi tới manager-search kèm sort_by */
  const goManagerSearch = useCallback(
    (sortOverride?: string) => {
      const sort = sortOverride ?? activeFilterField;
      const params = new URLSearchParams();
      if (dataRequest.q) params.set("q", dataRequest.q);
      if (dataRequest.browse) params.set("browse", String(dataRequest.browse));
      if (dataRequest.operation) params.set("operation", dataRequest.operation);
      if (dataRequest.rating) params.set("rating", dataRequest.rating);
      if (dataRequest.given_set) params.set("given_set", dataRequest.given_set);
      if (dataRequest.near_city) params.set("near_city", dataRequest.near_city);
      params.set("sort_by", sort);
      const qs = params.toString();
      router.push(`/manager-search${qs ? `?${qs}` : ""}`);
    },
    [dataRequest, activeFilterField, router]
  );

  /** Nút Managers / Providers ở hàng dưới → chuyển thẳng sang trang search tương ứng */
  const handleFilterRowClick = (field: string) => {
    setActiveFilterField(field);
    if (activeMainTab === "manager" && field === "name") {
      goManagerSearch("name");
      return;
    }
    if (activeMainTab === "provider" && field === "provider") {
      goProviderSearch("provider");
      return;
    }
  };

  const handleRedirectToMap = (type: string) => {
    setActiveMainTab(type);
    if (type === "provider") setActiveFilterField("provider");
    if (type === "manager") setActiveFilterField("name");

    const query = buildQueryString();

    switch (type) {
      case "provider":
        if (router.pathname !== "/dashboard") {
          router.push(`/dashboard${query}`);
        }
        break;
      case "manager":
        if (router.pathname !== "/dashboard") {
          router.push(`/dashboard${query}`);
        }
        break;
      case "new":
        router.push(`/map/news${query}`);
        break;
      default:
        break;
    }
  };

  const runSearchForActiveTab = () => {
    switch (activeMainTab) {
      case "provider":
        goProviderSearch();
        break;
      case "manager":
        goManagerSearch();
        break;
      case "new":
        router.push(`/map/news${buildQueryString()}`);
        break;
      default:
        break;
    }
  };

  return (
    <section
      className="relative bg-cover bg-center mx-12 mt-6 rounded-lg overflow-hidden"
      style={{
        backgroundImage: "url('/img/bg-dashboard.png')",
      }}
    >
      {openAdvanceSearch && (
        <AdvanceSearch
          open={openAdvanceSearch}
          onClose={() => setOpenAdvanceSearch(false)}
          dataRequest={dataRequest}
          setDataRequest={setDataRequest}
          handleClearAllFormSearch={() => setDataRequest(baseDataRequest)}
        />
      )}
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative max-w-5xl mx-auto px-4 py-16 text-center text-white" style={{ fontFamily: "Urbanist, sans-serif" }}>
        <h1 className="text-4xl md:text-5xl font-medium mb-4 text-[#2D323B]">Home</h1>

        <Button className="bg-white  rounded-lg shadow mb-6 border-[2px] border-[#324899] px-10 py-4" icon={<MapIcon />} onClick={() => router.push("/")}>
          <div className="font-semibold text-[#324899]">Show Map</div>
        </Button>

        {/* Tabs — mặc định Providers (active) */}
        <div className="flex justify-center gap-10 mb-6 bg-[#CCCCCC] rounded-2xl p-4 w-fit mx-auto">
          {itemsTabs.map((tab) => (
            <button
              key={tab.field}
              type="button"
              className={activeMainTab === tab.field ? tabButtonActive : tabButtonInactive}
              onClick={() => handleRedirectToMap(tab.field)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-3 mx-auto">
          <Input
            value={dataRequest.q}
            onChange={(e) => setDataRequest((prev) => ({ ...prev, q: e.target.value }))}
            placeholder="search all location"
            className="flex-1 px-4 py-3 rounded-md  !h-12"
            onPressEnter={runSearchForActiveTab}
          />
          <button type="button" className="px-4 py-3 rounded-lg !h-12 !w-12 bg-primary" onClick={runSearchForActiveTab} aria-label="Search">
            <SearchOutlined className="text-white" />
          </button>
          <Button icon={<MenuOutlined />} onClick={() => setOpenAdvanceSearch(true)} className="border-primary text-primary hover:text-primary !h-12 !w-12" />
        </div>

        {/* Feature cards — đổi theo tab Providers / Managers */}
        <div className="mt-10 bg-white/30 border border-white border-solid backdrop-blur rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeMainTab === "manager" ? (
              <>
                <FeatureItem title="Managers" icon="👤" />
                <FeatureItem title="The Given Set" icon="📘" />
                <FeatureItem title="Functions" icon="⚙️" />
              </>
            ) : (
              <>
                <FeatureItem title="Function Providers" icon="👥" />
                <FeatureItem title="The Given Set" icon="📘" />
                <FeatureItem title="Functions" icon="⚙️" />
              </>
            )}
          </div>
        </div>

        {/* Filter — theo Provider hoặc Manager */}
        <div className="mt-6 bg-white/30 border border-white border-solid backdrop-blur rounded-xl p-4">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {(activeMainTab === "manager" ? DASHBOARD_MANAGER_FILTER_TABS : DASHBOARD_HEADER_TABS).map((item) => (
              <button
                key={item.field}
                type="button"
                className={filterButtonBlue}
                onClick={() => handleFilterRowClick(item.field)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="inline-flex flex-wrap gap-4 text-sm bg-[#F7F7F7] px-4 py-2 rounded-lg items-center justify-center mx-auto">
            <span className="font-bold text-xs bg-[#000000]/50 p-2 rounded-lg text-white">Operations</span>

            <Radio.Group
              defaultValue="EXACT_PHRASE"
              buttonStyle="solid"
              className="flex flex-wrap gap-4"
              options={[
                { value: "EXACT_PHRASE", label: <span className="text-[#324899] font-semibold">EXACT PHRASE</span> },
                { value: "AND", label: <span className="text-[#324899] font-semibold">AND</span> },
                { value: "OR", label: <span className="text-[#324899] font-semibold">OR</span> },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
export default HeroSection;
