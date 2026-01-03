import React, { useEffect, useState } from "react";
import ProfileList from "./ProfileList";
import { ManagerItem } from "./types";
import HeaderSearch from "@/components/HeaderSearch/HeaderSearch";
import { buildQueryParams, getAuthToken } from "@/utils/constants";
import { baseDataRequestGetList } from "./request";

function ManagerSearch() {
  const [data, setData] = useState<ManagerItem[]>();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dataRequest, setDataRequest] = useState(baseDataRequestGetList);

  const fetchProfile = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const queryString = buildQueryParams(dataRequest);
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
    fetchProfile();
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

  return (
    <div className="mx-12 px-4 py-8">
      <HeaderSearch imageUrl="/img/search-bar.png" />
      <div className="mt-8">
        <ProfileList data={data} />
      </div>
    </div>
  );
}

export default ManagerSearch;
