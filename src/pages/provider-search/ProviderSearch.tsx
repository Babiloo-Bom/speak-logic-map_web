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

      const params = new URLSearchParams();
      if (req.q) params.set("q", req.q);
      params.set("page", String(req.page ?? 1));
      params.set("limit", String(req.limit ?? 9));
      const sortBy = req.sort_by && ["all", "provider", "functions", "problems", "description"].includes(req.sort_by)
        ? req.sort_by
        : "all";
      params.set("sortBy", sortBy);
      if (req.rating) {
        const r = parseInt(String(req.rating), 10);
        if (!Number.isNaN(r)) params.set("minRating", String(r));
      }
      if (req.given_set === "using_given_set" || req.given_set === "true") {
        params.set("applicable", "true");
      }
      const queryString = params.toString();
      const url = `/api/providers/search${queryString ? `?${queryString}` : ""}`;
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
    setDataRequest((prev) => {
      const next = { ...prev, page: 1 };
      fetchProfile(next);
      return next;
    });
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
          onSortChange={(sortBy) => {
            setDataRequest((prev) => {
              const next = { ...prev, sort_by: sortBy || "all", page: 1 };
              fetchProfile(next);
              return next;
            });
          }}
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
