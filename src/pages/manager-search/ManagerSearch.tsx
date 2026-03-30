/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProfileList from "./ProfileList";
import { IDataRequestGetList, IDataResponseGetList } from "@/lib/pages/manager-search/types";
import HeaderSearch from "./HeaderSearch";
import { buildQueryParams, getAuthToken } from "@/utils/constants";
import { baseDataRequestGetList } from "@/lib/requests/manager-search";
import { Alert, Pagination, PaginationProps } from "antd";
import AdvanceSearch from "./AdvanceSearch";
import { firstQueryParam } from "@/utils/router-query";

function ManagerSearch() {
  const router = useRouter();
  const rateProjectId = router.isReady ? firstQueryParam(router.query.projectId) : undefined;
  const ratePiId = router.isReady ? firstQueryParam(router.query.piId) : undefined;
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
        given_set: req.given_set ? true : false,
        near_city: req.near_city ? true : false,
        sort_by: req.sort_by || "all",
        sort_order: req.sort_order || "desc",
      };

      const queryString = buildQueryParams(newRequest);
      const params = new URLSearchParams(queryString);
      params.set("sort_by", newRequest.sort_by);
      params.set("sort_order", newRequest.sort_order);
      const url = `/api/managers/search?${params.toString()}`;
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

      const sortFromQuery = queryParams.sort_by;
      const sortByStr =
        typeof sortFromQuery === "string"
          ? sortFromQuery
          : Array.isArray(sortFromQuery)
            ? sortFromQuery[0]
            : "";

      const mergedDataRequest: IDataRequestGetList = {
        ...baseDataRequestGetList,
        q: (queryParams.q as string) || "",
        browse: browsArray,
        operation: (queryParams.operation as string) || "and",
        rating: (queryParams.rating as string) || "",
        given_set: (queryParams.given_set as string) || "",
        near_city: (queryParams.near_city as string) || "",
        ...(sortByStr &&
        ["name", "expertise", "functions", "problems", "providers", "description", "all"].includes(sortByStr)
          ? { sort_by: sortByStr as IDataRequestGetList["sort_by"] }
          : {}),
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

  const handleSearch = () => {
    setDataRequest((prev) => {
      const next = { ...prev, page: 1 };
      fetchProfile(next);
      return next;
    });
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
          onSortChange={(sortBy) => {
            setDataRequest((prev) => {
              const next = { ...prev, sort_by: sortBy || "all", page: 1 };
              fetchProfile(next);
              return next;
            });
          }}
        />
        <div className="mx-8">
          {rateProjectId && (
            <Alert
              type="info"
              showIcon
              className="mb-6"
              message="Bạn đang đánh giá kèm mã dự án"
              description={
                <span>
                  Chọn <strong>More Details</strong> trên thẻ manager, rồi dùng liên kết đánh giá trên trang chi tiết. Mã:{" "}
                  <span className="font-mono">{rateProjectId}</span>
                </span>
              }
            />
          )}
          <div className="mt-8">
            <ProfileList data={data?.managers} rateProjectId={rateProjectId} ratePiId={ratePiId} />
          </div>
          <div className="mt-4">
            <Pagination
            align="center"
            current={dataRequest.page}
            total={data?.total || 0}
            responsive
            onChange={onShowPageChange}
          />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerSearch;
