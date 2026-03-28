/* eslint-disable react-hooks/exhaustive-deps */
import { Button, message, Steps, theme } from "antd";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AboutUser from "./_components/AboutUser/AboutUser";
import AboutProvider from "./_components/AboutProvider/AboutProvider";
import AboutFunctionAndProblem from "./_components/AboutFunctionAndProblem/AboutFunctionAndProblem";
import AboutFeedbackYes from "./_components/AboutFeedbackYes/AboutFeedbackYes";
import AboutFeedbackNo from "./_components/AboutFeedbackNo/AboutFeedbackNo";
import { baseProviderRatingRequest } from "@/lib/pages/provider-search/provider-rating/request";
import { IProviderRatingRequest } from "@/lib/pages/provider-search/provider-rating/type";
import { getAuthToken } from "@/utils/constants";
import { firstQueryParam } from "@/utils/router-query";
import { ProviderWithRelations } from "@/types/provider";
import type { InitialUserData } from "@/lib/pages/provider-search/provider-rating/type";

const STEP_TITLES = ["About User", "About Provider", "About Function And Problem", "About Feedback"];

const ProviderRating = () => {
  const router = useRouter();
  const { providerId: providerIdRaw, projectId: queryProjectIdRaw, piId: piIdRaw } = router.query;
  const providerId = router.isReady ? firstQueryParam(providerIdRaw) : undefined;
  const queryProjectId = router.isReady ? firstQueryParam(queryProjectIdRaw) : undefined;
  const queryPiId = router.isReady ? firstQueryParam(piIdRaw) : undefined;
  const { token } = theme.useToken();
  const [currentStep, setCurrentStep] = useState(0);
  const [dataRequestRating, setDataRequestRating] = useState<IProviderRatingRequest>(baseProviderRatingRequest);
  const [providerData, setProviderData] = useState<ProviderWithRelations | null>(null);
  const [initialUserData, setInitialUserData] = useState<InitialUserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingProvider, setFetchingProvider] = useState(true);
  const [providerLoadError, setProviderLoadError] = useState<string | null>(null);

  // Fetch user profile for pre-fill (Step 1)
  useEffect(() => {
    const fetchUserProfile = async () => {
      const authToken = getAuthToken();
      if (!authToken) return;
      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          const user = data.user;
          const profile = data.profile;
          const fullName = profile
            ? [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim()
            : "";
          setInitialUserData({
            user_name: profile?.pen_name || profile?.first_name || (user?.email ? user.email.split("@")[0] : ""),
            full_name: fullName || (user?.email ? user.email.split("@")[0] : ""),
            email_address: user?.email || "",
            address_optional: profile?.location || "",
          });
        }
      } catch {
        // ignore
      }
    };
    fetchUserProfile();
  }, []);

  // Gắn project_id từ URL (My Ratings / provider gửi mã) vào form
  useEffect(() => {
    if (!router.isReady || !queryProjectId) return;
    setDataRequestRating((prev) =>
      prev.project_id?.trim() ? prev : { ...prev, project_id: queryProjectId }
    );
  }, [router.isReady, queryProjectId]);

  useEffect(() => {
    if (!router.isReady) return;

    if (!providerId || Number.isNaN(Number(providerId))) {
      setProviderData(null);
      setProviderLoadError(null);
      setFetchingProvider(false);
      return;
    }

    const fetchProviderData = async () => {
      setFetchingProvider(true);
      setProviderLoadError(null);
      try {
        const authToken = getAuthToken();
        if (!authToken) {
          setProviderLoadError("Please log in to continue.");
          return;
        }

        const url = `/api/providers/${providerId}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result: ProviderWithRelations = await response.json();
          setProviderData(result);
          setProviderLoadError(null);
        } else {
          const errorData = await response.json().catch(() => ({}));
          const msg = (errorData as { error?: string }).error || "Failed to load provider";
          setProviderLoadError(msg);
          setProviderData(null);
        }
      } catch (error) {
        console.error("Fetch error:", error);
        setProviderLoadError("Network error. Please try again.");
        setProviderData(null);
      } finally {
        setFetchingProvider(false);
      }
    };

    void fetchProviderData();
  }, [router.isReady, providerId]);

  const fetchRatingProvider = async (req: IProviderRatingRequest) => {
    const rating = req.rating || 0;
    if (rating < 1 || rating > 5) {
      message.error("Please select a rating between 1 and 5");
      return;
    }

    try {
      setLoading(true);
      const authToken = getAuthToken();
      if (!authToken) {
        message.error("No authentication token found");
        return;
      }

      if (!providerId) {
        message.error("Missing provider");
        return;
      }

      const url = `/api/providers/${providerId}/rating`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          comment: req.comment || undefined,
          ...(function () {
            const pid = req.project_id?.trim() || queryProjectId?.trim() || "";
            return pid ? { project_id: pid } : {};
          })(),
        }),
      });

      if (response.ok) {
        message.success("Rating submitted successfully!");
        const detail = new URLSearchParams({ providerId: String(providerId) });
        if (queryProjectId) detail.set("projectId", queryProjectId);
        if (queryPiId) detail.set("piId", queryPiId);
        router.push(`/provider-search/provider-detail?${detail.toString()}`);
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Failed to submit rating");
      }
    } catch (error) {
      message.error("Network error. Please try again.");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const next = () => setCurrentStep((s) => s + 1);
  const prev = () => setCurrentStep((s) => s - 1);

  const handleSubmit = (payload?: IProviderRatingRequest) => {
    const data = payload ?? dataRequestRating;
    fetchRatingProvider(data);
  };

  const handleCancel = () => {
    router.push("/my-rating");
  };

  const isStep4Yes = dataRequestRating.used_function_from_provider === true;

  const step4Content =
    currentStep === 3 ? (
      isStep4Yes ? (
        <AboutFeedbackYes
          dataRequestRating={dataRequestRating}
          setDataRequestRating={setDataRequestRating}
          handleSubmit={handleSubmit}
          prevStep={prev}
          loading={loading}
        />
      ) : (
        <AboutFeedbackNo
          dataRequestRating={dataRequestRating}
          setDataRequestRating={setDataRequestRating}
          handleSubmit={handleSubmit}
          prevStep={prev}
          loading={loading}
        />
      )
    ) : null;

  const steps = [
    {
      title: STEP_TITLES[0],
      content: (
        <AboutUser
          dataRequestRating={dataRequestRating}
          setDataRequestRating={setDataRequestRating}
          nextStep={next}
          onCancel={handleCancel}
          initialUserData={initialUserData}
        />
      ),
    },
    {
      title: STEP_TITLES[1],
      content: (
        <AboutProvider
          dataRequestRating={dataRequestRating}
          setDataRequestRating={setDataRequestRating}
          nextStep={next}
          prevStep={prev}
          providerData={providerData}
          initialUserData={initialUserData}
        />
      ),
    },
    {
      title: STEP_TITLES[2],
      content: (
        <AboutFunctionAndProblem
          dataRequestRating={dataRequestRating}
          setDataRequestRating={setDataRequestRating}
          nextStep={next}
          prevStep={prev}
          providerData={providerData}
        />
      ),
    },
    {
      title: STEP_TITLES[3],
      content: step4Content,
    },
  ];

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  const contentStyle: React.CSSProperties = {
    minHeight: 260,
    color: token.colorTextTertiary,
    marginTop: 16,
  };

  if (!router.isReady || fetchingProvider) {
    return (
      <div className="w-full bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading provider information...</div>
        </div>
      </div>
    );
  }

  if (!providerId || Number.isNaN(Number(providerId))) {
    return (
      <div className="w-full bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">Invalid provider</div>
          <Button type="primary" onClick={() => router.push("/my-rating")}>
            Back to My Ratings
          </Button>
        </div>
      </div>
    );
  }

  if (providerLoadError) {
    return (
      <div className="w-full bg-white min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-lg text-gray-800 mb-2">Cannot open provider rating</div>
          <p className="text-gray-600 mb-6">{providerLoadError}</p>
          <Button type="primary" onClick={() => router.push("/my-rating")}>
            Back to My Ratings
          </Button>
        </div>
      </div>
    );
  }

  if (!providerData) {
    return (
      <div className="w-full bg-white min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Unable to load provider data.</p>
          <Button type="primary" onClick={() => router.push("/my-rating")}>
            Back to My Ratings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-12 mt-6">
      <div className="w-full flex items-center justify-center text-4xl font-semibold mb-8">
        Provider Rating
      </div>

      <Steps current={currentStep} labelPlacement="vertical" items={items} className="provider-rating-steps" />

      <div style={contentStyle}>{steps[currentStep].content}</div>
    </div>
  );
};

export default ProviderRating;
