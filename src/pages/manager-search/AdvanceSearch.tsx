import { Button, Checkbox, Drawer, Radio, Input, InputNumber, Space } from "antd";
import React, { useState, useEffect } from "react";
import { ADVANCE_SEARCH_FILTERS } from "@/lib/pages/manager-search/constants";
import { IDataRequestGetList } from "@/lib/pages/manager-search/types";

type Props = {
  open: boolean;
  onClose: () => void;
  dataRequest: IDataRequestGetList;
  setDataRequest: React.Dispatch<React.SetStateAction<IDataRequestGetList>>;
  handleSearch: () => void;
  handleClearAllFormSearch: () => void;
};

function AdvanceSearch(props: Props) {
  const { open, onClose, dataRequest, setDataRequest, handleSearch, handleClearAllFormSearch } = props;
  interface CityOption {
    fullName: string;
    codeName: string;
  }

  const [citySuggestions, setCitySuggestions] = useState<CityOption[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  // Load city suggestions from API
  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await fetch("/api/cities");
        if (response.ok) {
          const cities = await response.json();
          setCitySuggestions(Array.isArray(cities) ? cities : []);
        }
      } catch (error) {
        console.error("Failed to load cities:", error);
      }
    };
    loadCities();
  }, []);

  const handleCityChange = (value: string) => {
    setDataRequest({ ...dataRequest, near_city: value, city_id: "" });
    setShowCitySuggestions(value.length > 0);
  };

  const filteredCities = citySuggestions.filter(
    (city) =>
      city.fullName.toLowerCase().includes(dataRequest.near_city?.toLowerCase() || "") ||
      city.codeName.toLowerCase().includes(dataRequest.near_city?.toLowerCase() || "")
  );

  const isLocationFilterActive = !!(dataRequest.near_city || dataRequest.city_id || dataRequest.radius);

  return (
    <div className="bg-white">
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">ADVANCE SEARCH</h2>
            <Button type="text" className="text-primary text-sm" onClick={() => handleClearAllFormSearch()}>
              CLEAR ALL
            </Button>
          </div>
        }
        placement="right"
        width={380}
        onClose={onClose}
        open={open}
        footer={
          <div className="flex items-center justify-between border-t border-blue-500/40">
            {/* CLOSE */}
            <Button type="text" onClick={onClose} className="w-1/2 h-12 text-gray-700 font-medium rounded-none hover:bg-transparent">
              CLOSE
            </Button>

            {/* Divider */}
            <div className="h-6 w-px bg-blue-500/40" />

            <Button type="text" onClick={handleSearch} className="w-1/2 h-12 text-primary font-semibold rounded-none hover:bg-transparent">
              APPLY
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {ADVANCE_SEARCH_FILTERS.map((section) => (
            <div key={section.key}>
              <h4 className="font-semibold text-primary mb-2">{section.title}</h4>

              {section.type === "checkbox" ? (
                <Checkbox.Group
                  className="flex flex-col gap-3"
                  value={(dataRequest[section.key as keyof IDataRequestGetList] as unknown as any[]) || []}
                  onChange={(values) => setDataRequest({ ...dataRequest, [section.key]: values })}
                >
                  {section.options.map((option) => (
                    <div key={option.value} className="flex justify-between items-center">
                      <Checkbox value={option.value}>{option.label}</Checkbox>
                      {option.count !== undefined && <span className="text-gray-400 text-sm">{option.count}</span>}
                    </div>
                  ))}
                </Checkbox.Group>
              ) : (
                <Radio.Group
                  className="flex flex-col gap-3"
                  value={dataRequest[section.key as keyof IDataRequestGetList] as unknown}
                  onChange={(e) => setDataRequest({ ...dataRequest, [section.key]: e.target.value })}
                >
                  {section.options.map((option) => (
                    <Radio key={option.value} value={option.value}>
                      {option.label}
                    </Radio>
                  ))}
                </Radio.Group>
              )}
            </div>
          ))}

          {/* Location Filter Section */}
          <div>
            <h4 className="font-semibold text-primary mb-2">Location</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">City Name</label>
                <div className="relative">
                  <Input
                    placeholder="Enter city name..."
                    value={dataRequest.near_city || ""}
                    onChange={(e) => handleCityChange(e.target.value)}
                    onBlur={() => setTimeout(() => setShowCitySuggestions(false), 200)}
                    onFocus={() => {
                      if (dataRequest.near_city) setShowCitySuggestions(true);
                    }}
                  />
                  {showCitySuggestions && filteredCities.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredCities.slice(0, 10).map((city, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => {
                            setDataRequest({ ...dataRequest, near_city: city.fullName, city_id: "" });
                            setShowCitySuggestions(false);
                          }}
                        >
                          {city.fullName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600 mb-1 block">Radius (km)</label>
                <InputNumber
                  className="w-full"
                  placeholder="Enter radius in km"
                  min={0}
                  max={10000}
                  value={dataRequest.radius ? Number(dataRequest.radius) : undefined}
                  onChange={(value) => setDataRequest({ ...dataRequest, radius: value ? String(value) : "" })}
                  addonAfter="km"
                />
              </div>

              {isLocationFilterActive && (
                <Button
                  type="link"
                  size="small"
                  className="p-0 text-gray-500"
                  onClick={() => {
                    setDataRequest({
                      ...dataRequest,
                      near_city: "",
                      city_id: "",
                      radius: "",
                      lat: "",
                      lng: "",
                    });
                  }}
                >
                  Clear location filter
                </Button>
              )}
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export default AdvanceSearch;
