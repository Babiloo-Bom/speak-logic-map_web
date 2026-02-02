/* eslint-disable react-hooks/exhaustive-deps */
import { Button, message, Steps, theme } from "antd";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AboutProvider from "./_components/AboutProvider/AboutProvider";
import RatingForm from "./_components/RatingForm/RatingForm";
import { baseProviderRatingRequest } from "@/lib/pages/provider-search/provider-rating/request";
import { IProviderRatingRequest } from "@/lib/pages/provider-search/provider-rating/type";
import { getAuthToken } from "@/utils/constants";
import { ProviderWithRelations } from "@/types/provider";

const ProviderRating = () => {
  const router = useRouter();
  const { providerId } = router.query;
  const { token } = theme.useToken();
  const [currentStep, setCurrentStep] = useState(0);
  const [dataRequestRating, setDataRequestRating] = useState<IProviderRatingRequest>(baseProviderRatingRequest);
  const [providerData, setProviderData] = useState<ProviderWithRelations | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingProvider, setFetchingProvider] = useState(true);

  // Fetch provider data on mount
  useEffect(() => {
    const fetchProviderData = async () => {
      if (!providerId) return;

      try {
        setFetchingProvider(true);
        const token = getAuthToken();
        if (!token) {
          message.error("No authentication token found");
          return;
        }

        const url = `/api/providers/${providerId}`;
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result: ProviderWithRelations = await response.json();
          setProviderData(result);
        } else {
          const errorData = await response.json();
          message.error(errorData.error || "Failed to fetch provider");
          router.push("/provider-search");
        }
      } catch (error) {
        message.error("Network error. Please try again.");
        console.error("Fetch error:", error);
        router.push("/provider-search");
      } finally {
        setFetchingProvider(false);
      }
    };

    fetchProviderData();
  }, [providerId]);

  const fetchRatingProvider = async (req: IProviderRatingRequest) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        message.error("No authentication token found");
        return;
      }

      const url = `/api/providers/${providerId}/rating`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating: req.rating,
          comment: req.comment || undefined,
        }),
      });

      if (response.ok) {
        message.success("Rating submitted successfully!");
        router.push(`/provider-search/provider-detail?providerId=${providerId}`);
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

  const next = () => {
    setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    fetchRatingProvider(dataRequestRating);
  };

  const steps = [
    {
      title: "About Provider",
      content: <AboutProvider providerData={providerData} nextStep={next} />,
    },
    {
      title: "Rating & Review",
      content: (
        <RatingForm
          dataRequestRating={dataRequestRating}
          setDataRequestRating={setDataRequestRating}
          handleSubmit={handleSubmit}
          prevStep={prev}
          loading={loading}
        />
      ),
    },
  ];

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  const contentStyle: React.CSSProperties = {
    lineHeight: "260px",
    textAlign: "center",
    color: token.colorTextTertiary,
    marginTop: 16,
  };

  if (fetchingProvider) {
    return (
      <div className="w-full bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading provider information...</div>
        </div>
      </div>
    );
  }

  if (!providerData) {
    return (
      <div className="w-full bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600 mb-4">Provider not found</div>
          <Button type="primary" onClick={() => router.push("/provider-search")}>
            Back to Search
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

