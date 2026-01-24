/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import ProfileList from "./ProfileList";
import { IDataRequestGetList, ProviderItem, IDataResponseGetList } from "@/lib/pages/provider-search/types";
import HeaderSearch from "./HeaderSearch";
import { buildQueryParams, getAuthToken } from "@/utils/constants";
import { baseDataRequestGetList } from "@/lib/requests/provider-search";
import { Pagination, PaginationProps } from "antd";
import AdvanceSearch from "./AdvanceSearch";

function ProviderSearch() {
  const [data, setData] = useState<IDataResponseGetList>();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dataRequest, setDataRequest] = useState<IDataRequestGetList>(baseDataRequestGetList);
  const [openAdvanceSearch, setOpenAdvanceSearch] = useState(false);

  const fetchProfile = async (req: IDataRequestGetList) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const queryString = buildQueryParams(req);
      const url = `/api/providers/search${queryString ? `?${queryString}` : ""}`;
      console.log("queryString; ", queryString);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result: IDataResponseGetList = await response.json();
        setData(result);
        setSuccess("Providers loaded successfully");
        setError("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch providers");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    fetchProfile(dataRequest);
  }, []);

  const onShowPageChange: PaginationProps["onChange"] = (page) => {
    const newDataRequest = {
      ...dataRequest,
      page: page,
    };
    setDataRequest(newDataRequest);
    fetchProfile(newDataRequest);
  };

  const handleSearch = () => {
    const newDataRequest = {
      ...dataRequest,
      page: 1,
    };
    setDataRequest(newDataRequest);
    fetchProfile(newDataRequest);
  };

  const handleClearAllFormSearch = () => {
    setDataRequest(baseDataRequestGetList);
    fetchProfile(baseDataRequestGetList);
  };

  return (
    <div className="bg-white">
      <AdvanceSearch
        open={openAdvanceSearch}
        onClose={() => setOpenAdvanceSearch(false)}
        dataRequest={dataRequest}
        setDataRequest={setDataRequest}
        handleSearch={handleSearch}
        handleClearAllFormSearch={handleClearAllFormSearch}
      />
      <div className="mx-12 px-4 py-8">
        <HeaderSearch
          dataRequest={dataRequest}
          setDataRequest={setDataRequest}
          onOpenAdvanceSearch={() => setOpenAdvanceSearch(true)}
          imageUrl="/img/search-bar.png"
          handleSearch={handleSearch}
        />
        <div className="mx-8">
          <div className="mt-8">
            <ProfileList data={data?.providers} />
          </div>
          <div className="mt-4">
            <Pagination align="center" defaultCurrent={1} total={data?.total || 0} responsive onChange={onShowPageChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProviderSearch;
