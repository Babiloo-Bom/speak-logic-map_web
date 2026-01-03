import React, { useEffect, useState } from "react";
import ProfileList from "./ProfileList";
import { IDataRequestGetList, ManagerItem } from "./types";
import HeaderSearch from "@/components/HeaderSearch/HeaderSearch";
import { buildQueryParams, getAuthToken } from "@/utils/constants";
import { baseDataRequestGetList } from "./request";
import { Pagination, PaginationProps } from "antd";

function ManagerSearch() {
  const [data, setData] = useState<ManagerItem[]>();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dataRequest, setDataRequest] = useState<IDataRequestGetList>(baseDataRequestGetList);

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
        const result = await response.json();
        setData(result.managers || []);
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
    // setTimeout(() => {
    //   setData(
    //     Array.from({ length: 9 }).map((_, i) => ({
    //       id: String(i),
    //       name: "Patrick Thompson",
    //       avatar: "/images/avatar.png",
    //       rating: 5,
    //       functionProvided: "Manage house Renovation",
    //       expertise: "House renovation, Expertise 2",
    //       applicable: true,
    //     }))
    //   );
    // }, 2000);
  }, []);

  const onShowPageChange: PaginationProps["onChange"] = (page) => {
    const newDataRequest = {
      ...dataRequest,
      page: page,
    };
    setDataRequest(newDataRequest);
    fetchProfile(newDataRequest);
  };

  return (
    <div className=" bg-white">
      <div className="mx-12 px-4 py-8">
        <HeaderSearch imageUrl="/img/search-bar.png" />
        <div className="mt-8">
          <ProfileList data={data} />
        </div>
        <div className="mt-4">
          <Pagination align="center" defaultCurrent={1} total={50} responsive onChange={onShowPageChange} />
        </div>
      </div>
    </div>
  );
}

export default ManagerSearch;
