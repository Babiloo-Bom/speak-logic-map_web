/* eslint-disable react-hooks/exhaustive-deps */
import { getAuthToken } from "@/utils/constants";
import { Card, Avatar, Rate, Divider, message, Button, Tag } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IProviderDetail } from "@/lib/pages/provider-search/provider-detail/type";
import { ProviderWithRelations } from "@/types/provider";
import Image from "next/image";

export default function ProviderDetail() {
  const router = useRouter();
  const { providerId } = router.query;

  const [providerData, setProviderData] = useState<IProviderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProviderDetail = async () => {
    try {
      setLoading(true);
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
        setProviderData(result as IProviderDetail);
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Failed to fetch provider");
      }
    } catch (error) {
      message.error("Network error. Please try again.");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (providerId) {
      fetchProviderDetail();
    }
  }, [providerId]);

  const handleRateProvider = () => {
    router.push(`/provider-search/provider-rating?providerId=${providerId}`);
  };

  if (loading) {
    return (
      <div className="w-full bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Loading provider details...</div>
        </div>
      </div>
    );
  }

  if (!providerData) {
    return (
      <div className="w-full bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-600">Provider not found</div>
          <Button type="primary" className="mt-4" onClick={() => router.push("/provider-search")}>
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Banner */}
      <div className="px-6 md:px-12 pt-8">
        <div
          className="h-[220px] md:h-[240px] bg-cover bg-center rounded-2xl relative"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d')",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl flex items-center justify-center">
            <h1 className="text-white text-4xl md:text-4xl font-semibold">Provider Details</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 mt-8 pb-12">
        {/* Avatar & Name */}
        <div className="flex flex-col items-center">
          {providerData.image_url ? (
            <Image
              src={providerData.image_url}
              alt={providerData.name || "Provider"}
              width={200}
              height={200}
              className="rounded-full object-cover !w-[200px] !h-[200px] border-4 border-white shadow-lg"
            />
          ) : (
            <Avatar size={200} className="border-4 border-white shadow-lg">
              {providerData.name?.charAt(0)?.toUpperCase() || "P"}
            </Avatar>
          )}
          <h2 className="mt-4 text-2xl font-semibold">{providerData.name || "--"}</h2>
          {providerData.status && (
            <Tag
              color={
                providerData.status === "active"
                  ? "green"
                  : providerData.status === "pending"
                  ? "orange"
                  : providerData.status === "suspended"
                  ? "red"
                  : "default"
              }
              className="mt-2"
            >
              {providerData.status.toUpperCase()}
            </Tag>
          )}
        </div>

        {/* Main Info Card */}
        <Card className="mt-6 rounded-xl shadow-sm border border-solid border-primary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500 text-2xl mb-2">Description</p>
              <p className="text-gray-800 font-medium text-lg leading-relaxed">
                {providerData.description || "No description available"}
              </p>

              {providerData.url && (
                <>
                  <p className="mt-6 text-gray-500 text-xl mb-2">Internal URL</p>
                  <p className="text-primary break-all text-lg font-medium">{providerData.url}</p>
                </>
              )}

              {providerData.website_url && (
                <>
                  <p className="mt-4 text-gray-500 text-xl mb-2">Website</p>
                  <a
                    href={providerData.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary break-all text-lg font-medium hover:underline"
                  >
                    {providerData.website_url}
                  </a>
                </>
              )}
            </div>

            <div>
              <p className="text-gray-500 text-xl mb-2">The Given Set Applicable</p>
              <p className="font-medium text-xl text-primary mb-6">
                {providerData.is_applicable ? "Yes" : "No"}
              </p>

              {providerData.geo && (
                <>
                  <p className="text-gray-500 text-xl mb-2">Location</p>
                  <p className="font-medium text-lg text-primary">
                    {providerData.geo.city && providerData.geo.country
                      ? `${providerData.geo.city}, ${providerData.geo.country}`
                      : providerData.geo.city || providerData.geo.country || "Not specified"}
                  </p>
                  {providerData.lat && providerData.lng && (
                    <p className="text-gray-400 text-sm mt-1">
                      Coordinates: {providerData.lat.toFixed(4)}, {providerData.lng.toFixed(4)}
                    </p>
                  )}
                </>
              )}

              <p className="mt-6 text-gray-500 text-xl mb-2">Created</p>
              <p className="font-medium text-lg text-gray-700">
                {providerData.created_at
                  ? new Date(providerData.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "--"}
              </p>
            </div>
          </div>
        </Card>

        {/* Rating Card */}
        <Card className="mt-6 rounded-xl border border-solid border-primary">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold mb-2">Provider Rating</h3>
            <div className="flex items-center justify-center gap-2">
              <Rate disabled value={providerData.rating || 0} allowHalf />
              <span className="ml-2 font-medium text-xl">
                {providerData.rating ? providerData.rating.toFixed(1) : "0.0"}
              </span>
            </div>
            <Button
              type="primary"
              size="large"
              className="mt-4 bg-primary hover:bg-primary/90"
              onClick={handleRateProvider}
            >
              Rate This Provider
            </Button>
          </div>
        </Card>

        {/* Functions Card */}
        {providerData.functions && providerData.functions.length > 0 && (
          <Card className="mt-6 rounded-xl border border-solid border-primary">
            <h3 className="text-2xl font-semibold mb-4">Functions Provided</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providerData.functions.map((func) => (
                <div
                  key={func.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors"
                >
                  <h4 className="font-semibold text-lg text-primary mb-2">{func.name}</h4>
                  {func.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{func.description}</p>
                  )}
                  {func.category && (
                    <Tag color="blue" className="mt-2">
                      {func.category}
                    </Tag>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Problems Card */}
        {providerData.problems && providerData.problems.length > 0 && (
          <Card className="mt-6 rounded-xl border border-solid border-primary">
            <h3 className="text-2xl font-semibold mb-4">Problems Solved</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providerData.problems.map((problem) => (
                <div
                  key={problem.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary transition-colors"
                >
                  <h4 className="font-semibold text-lg text-primary mb-2">{problem.name}</h4>
                  {problem.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{problem.description}</p>
                  )}
                  {problem.category && (
                    <Tag color="purple" className="mt-2">
                      {problem.category}
                    </Tag>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Back Button */}
        <div className="mt-8 flex justify-center">
          <Button
            type="default"
            size="large"
            onClick={() => router.push("/provider-search")}
            className="px-8"
          >
            Back to Search
          </Button>
        </div>
      </div>
    </div>
  );
}

