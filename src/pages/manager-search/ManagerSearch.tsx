/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProfileList from "./ProfileList";
import { IDataRequestGetList, IDataResponseGetList } from "@/lib/pages/manager-search/types";
import HeaderSearch from "./HeaderSearch";
import { buildQueryParams, getAuthToken } from "@/utils/constants";
import { baseDataRequestGetList } from "@/lib/requests/manager-search";
import { Pagination, PaginationProps } from "antd";
import AdvanceSearch from "./AdvanceSearch";

function ManagerSearch() {
  const router = useRouter();
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
      const newRequest = {
        ...req,
        // Keep near_city as string for city name search
        // given_set is handled separately if needed
      };

      const queryString = buildQueryParams(newRequest);
      const url = `/api/managers/search${queryString ? `?${queryString}` : ""}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result: IDataResponseGetList = await response.json();
        setData(result);
        setSuccess("Managers loaded successfully");
        setError("");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch managers");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Fetch error:", error);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      const queryParams = router.query;

      const browsArray = queryParams.browse
        ? typeof queryParams.browse === "string"
          ? queryParams.browse.split(",").map((item) => item.trim())
          : queryParams.browse
        : [];

      const mergedDataRequest: IDataRequestGetList = {
        ...baseDataRequestGetList,
        q: (queryParams.q as string) || "",
        browse: browsArray,
        operation: (queryParams.operation as string) || "and",
        rating: (queryParams.rating as string) || "",
        given_set: (queryParams.given_set as string) || "",
        near_city: (queryParams.near_city as string) || "",
      };

      setDataRequest(mergedDataRequest);
      fetchProfile(mergedDataRequest);
    }
  }, [router.isReady]);

  const onShowPageChange: PaginationProps["onChange"] = (page) => {
    const newDataRequest = {
      ...dataRequest,
      page: page,
    };
    setDataRequest(newDataRequest);
    fetchProfile(newDataRequest);
  };

  const handleSearch = (newDataRequest?: IDataRequestGetList) => {
    const requestToUse = newDataRequest || {
      ...dataRequest,
      page: 1,
    };
    setDataRequest(requestToUse);
    fetchProfile(requestToUse);
    setOpenAdvanceSearch(false);
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
            <ProfileList data={data?.managers} />
          </div>
          <div className="mt-4">
            <Pagination align="center" defaultCurrent={1} total={data?.total || 0} responsive onChange={onShowPageChange} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerSearch;
