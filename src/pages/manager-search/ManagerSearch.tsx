/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import ProfileList from "./ProfileList";
import { IDataRequestGetList, ManagerItem, IDataResponseGetList } from "./types";
import HeaderSearch from "@/components/HeaderSearch/HeaderSearch";
import { buildQueryParams, getAuthToken } from "@/utils/constants";
import { baseDataRequestGetList } from "./request";
import { Pagination, PaginationProps } from "antd";
import AdvanceSearch from "./AdvanceSearch";

function ManagerSearch() {
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

  console.log("openAdvanceSearch: ", openAdvanceSearch);
  return (
    <div className="bg-white">
      <AdvanceSearch open={openAdvanceSearch} onClose={() => setOpenAdvanceSearch(false)} />
      <div className="mx-12 px-4 py-8">
        <HeaderSearch onOpenAdvanceSearch={() => setOpenAdvanceSearch(true)} imageUrl="/img/search-bar.png" />
        <div className="mt-8">
          <ProfileList data={data?.managers} />
        </div>
        <div className="mt-4">
          <Pagination align="center" defaultCurrent={1} total={data?.total || 0} responsive onChange={onShowPageChange} />
        </div>
      </div>
    </div>
  );
}

export default ManagerSearch;
