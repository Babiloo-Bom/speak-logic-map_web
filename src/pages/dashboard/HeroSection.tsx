import { Button, Image, Input, Radio } from "antd";
import FeatureItem from "./FeatureItem";
import { SearchOutlined } from "@ant-design/icons";

const MapIcon = () => <Image preview={false} src="/icons/solar_map-outline.svg" alt="map" style={{ width: "1em", height: "1em" }} />;

const HeroSection = () => {
  return (
    <section
      className="relative bg-cover bg-center mx-12 mt-6 rounded-lg overflow-hidden"
      style={{
        backgroundImage: "url('/img/bg-dashboard.png')",
      }}
    >
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative max-w-5xl mx-auto px-4 py-16 text-center text-white" style={{ fontFamily: "Urbanist, sans-serif" }}>
        <h1 className="text-4xl md:text-5xl font-medium mb-4 text-[#2D323B]">Home</h1>

        <Button className="bg-white  rounded-lg shadow mb-6 border-[2px] border-[#324899] px-10 py-4" icon={<MapIcon />}>
          <div className="font-semibold text-[#324899]">Show Map</div>
        </Button>

        {/* Tabs */}
        <div className="flex justify-center gap-10 mb-6 bg-[#CCCCCC] rounded-2xl p-4 w-fit mx-auto">
          {["Providers", "Managers", "News"].map((tab) => (
            <button key={tab} className="px-10 py-3 rounded-md border-[2px] border-solid border-[#324899]  text-sm hover:bg-[#324899] text-[#324899] font-semibold hover:text-white">
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex flex-col md:flex-row gap-3 mx-auto">
          <Input placeholder="Search all location" className="flex-1 px-4 py-3 rounded-md  !h-12" />
          <button className="px-4 py-3 rounded-lg !h-12 !w-12 bg-[#324899] ">
            <SearchOutlined className="text-white hover-text-[#324899]" />
          </button>
          <button className="px-4 py-3 bg-[#324899] rounded-md !h-12">☰</button>
        </div>

        {/* Feature cards */}
        <div className="mt-10 bg-white/30 border border-white border-solid backdrop-blur rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureItem title="Function Providers" icon="👥" />
            <FeatureItem title="The Given Set" icon="📘" />
            <FeatureItem title="Functions" icon="⚙️" />
          </div>
        </div>

        {/* Filter */}
        <div className="mt-6 bg-white/30 border border-white border-solid backdrop-blur rounded-xl p-4">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {["Providers", "Functions", "Descriptions", "Problems", "All"].map((item) => (
              <button key={item} className="px-4 py-2 bg-[#324899] text-white rounded-md text-sm">
                {item}
              </button>
            ))}
          </div>

          <div className="inline-flex flex-wrap gap-4 text-sm bg-[#F7F7F7] px-4 py-2 rounded-lg items-center justify-center mx-auto">
            <span className="font-bold text-xs bg-[#000000]/50 p-2 rounded-lg">Operations</span>

            <Radio.Group
              defaultValue="exactPhase"
              buttonStyle="solid"
              className="flex flex-wrap gap-4"
              options={[
                { value: "EXACT_PHASE", label: <span className="text-[#324899] font-semibold">EXACT PHASE</span> },
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
