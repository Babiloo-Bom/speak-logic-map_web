/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import ProfileList from "@/components/provider-search/ProfileList";
import { IDataRequestGetList, IDataResponseGetList } from "@/lib/pages/provider-search/types";
import HeaderSearch from "./HeaderSearch";
import { getAuthToken } from "@/utils/constants";
import { baseDataRequestGetList } from "@/lib/requests/provider-search";
import { Alert, Pagination, PaginationProps } from "antd";
import AdvanceSearch from "./AdvanceSearch";
import { useRouter } from "next/router";
import { firstQueryParam } from "@/utils/router-query";
import { resolveRatingProviderId } from "@/lib/ratings/resolveRatingProviderId";

function ProviderSearch() {
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

  /** Có projectId trên URL: mở thẳng provider-rating khi có provider (PI / env server / NEXT_PUBLIC).
   *  Dùng projectId/piId trong deps — không dùng router.asPath (dễ đổi liên tục và làm cleanup hủy redirect). */
  useEffect(() => {
    if (!router.isReady || !rateProjectId) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        const token = getAuthToken();
        if (!token || cancelled) return;

        const providerNum = await resolveRatingProviderId(token, ratePiId);
        if (cancelled || providerNum == null) return;

        const qs = new URLSearchParams({ projectId: rateProjectId });
        if (ratePiId) qs.set("piId", ratePiId);
        window.location.replace(`/provider-search/provider-rating?providerId=${providerNum}&${qs.toString()}`);
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [router.isReady, rateProjectId, ratePiId]);

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
          {rateProjectId && (
            <Alert
              type="info"
              showIcon
              className="mb-6"
              message="Bạn đang đánh giá kèm mã dự án"
              description={
                <span>
                  Mã dự án: <span className="font-mono">{rateProjectId}</span>. Nếu provider đã gửi mã, trong My Ratings bấm trực tiếp vào mã để mở form đánh giá.
                </span>
              }
            />
          )}
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
