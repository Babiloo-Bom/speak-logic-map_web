import { Button, Card, message, Typography, Table } from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { CopyOutlined } from "@ant-design/icons";
import { buildQueryParams, getAuthToken } from "@/utils/constants";
import { baseDataRequestGetMyRating } from "@/lib/pages/my-rating/request";
import { IDataRequestGetMyRating, IMyRatingItem, IResponseGetMyRating } from "@/lib/pages/my-rating/type";
import dayjs from "dayjs";

const { Text } = Typography;

const MyRatingPage = () => {
  const router = useRouter();
  const [dataRequestGetMyRating, setDataRequestGetMyRating] = useState<IDataRequestGetMyRating>({
    ...baseDataRequestGetMyRating,
    used: "",
  });
  const [data, setData] = useState<IResponseGetMyRating | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchMyRating = async (req: IDataRequestGetMyRating) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const queryString = buildQueryParams(req);
      const url = `/api/ratings/project-identification${queryString ? `?${queryString}` : ""}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });

      if (response.ok) {
        const result: IResponseGetMyRating = await response.json();
        setData(result);
        setSuccess("Managers loaded successfully");
        setError("");
        if (result.items && result.items.length > 0) {
          setSelectedProjectId((prev) => prev || result.items[0].project_id);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch managers");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRating(dataRequestGetMyRating);
  }, [router.asPath]);

  const handleGenerate = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const res = await fetch("/api/ratings/project-identification", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        message.error(err.error || "Failed to generate project identification");
        return;
      }

      const newItem = await res.json();
      setSelectedProjectId(newItem.project_id);
      setData((prev) => ({
        items: prev ? [newItem, ...prev.items] : [newItem],
        total: (prev?.total || 0) + 1,
      }));
      message.success("Generated new project identification");
    } catch (e) {
      console.error("Generate project identification error:", e);
      message.error("Network error. Please try again.");
    }
  };

  const handleView = () => {
    router.push("/function-ratings");
  };

  const handleSave = async () => {
    if (!selectedProjectId) {
      message.warning("No project identification to save");
      return;
    }
    setSaving(true);
    try {
      const token = getAuthToken();
      if (!token) {
        message.error("No authentication token found");
        return;
      }
      const res = await fetch("/api/ratings/project-identification", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ project_id: selectedProjectId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        message.error(err.error || "Failed to save project identification");
        return;
      }
      message.success("Project identification saved");
      router.push("/function-ratings");
    } catch (e) {
      console.error("Save project identification error:", e);
      message.error("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async () => {
    if (!selectedProjectId) {
      message.warning("No project identification to copy");
      return;
    }
    try {
      await navigator.clipboard.writeText(selectedProjectId);
      message.success("Copied. You can share this ID with another user.");
    } catch {
      message.error("Failed to copy");
    }
  };

  const tableItems = useMemo(() => data?.items ?? [], [data?.items]);

  const columns = [
    {
      title: "Project Identification",
      dataIndex: "project_id",
      key: "project_id",
      render: (id: string, row: IMyRatingItem) => {
        const href = row.provider_id
          ? `/provider-search/provider-rating?providerId=${row.provider_id}&projectId=${encodeURIComponent(id)}`
          : `/function-ratings/${encodeURIComponent(id)}?piId=${row.id}`;
        return (
          <Link href={href} className="font-mono text-primary hover:underline">
            {id}
          </Link>
        );
      },
    },
    {
      title: "Date",
      dataIndex: "created_at",
      key: "created_at",
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Used",
      dataIndex: "used",
      key: "used",
      render: (used: boolean) => (used ? "Yes" : "No"),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: IMyRatingItem) => {
        const href = record.provider_id
          ? `/provider-search/provider-rating?providerId=${record.provider_id}&projectId=${encodeURIComponent(
              record.project_id
            )}`
          : `/function-ratings/${encodeURIComponent(record.project_id)}?piId=${record.id}`;
        return (
          <Link href={href}>
            <Button
              size="small"
              className="!bg-white !text-primary border border-primary hover:!bg-primary hover:!text-white hover:!border-primary"
            >
              Rate
            </Button>
          </Link>
        );
      },
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Banner: ảnh nền dưới chữ My Ratings */}
      <div
        className="w-full flex items-center justify-center py-16 px-4 relative bg-cover bg-center"
        style={{
          backgroundImage: "url(/img/0a18721094daa3de2c797ae22f13fdd414489005.jpg)",
          minHeight: "240px",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <h1 className="text-4xl md:text-[49px] font-medium text-white relative z-10">My Ratings</h1>
      </div>

      <div className="w-full flex items-center justify-center px-4">
        <div className="w-full max-w-3xl text-center my-20">
          <Card className="mb-10 rounded-xl">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="large"
                className="w-full sm:w-1/2 h-12 bg-primary text-white"
                onClick={handleGenerate}
              >
                Generate Project Identification
              </Button>
              <Button
                size="large"
                className="w-full sm:w-1/2 h-12 border-primary text-primary"
                onClick={handleView}
              >
                View Project Identification
              </Button>
            </div>
          </Card>

          <div className="mb-10">
            <Card className="rounded-xl border border-[#D0DAEE]">
              <div className="flex flex-col items-center gap-3">
                <Text type="secondary">Project Identification</Text>
                <div className="px-4 py-3 rounded-lg bg-[#F5F6FA] text-lg font-mono tracking-wide border border-[#D0DAEE] w-full max-w-xl mx-auto break-all">
                  {selectedProjectId || "No project identification yet"}
                </div>
              </div>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button
              size="large"
              className="w-full sm:w-40 h-11 border-primary text-primary"
              onClick={handleSave}
              loading={saving}
            >
              Save
            </Button>
            <Button
              size="large"
              icon={<CopyOutlined />}
              className="bg-primary text-white w-full sm:w-56 h-11 flex items-center justify-center"
              onClick={handleCopy}
            >
              Copy To Clipboard
            </Button>
          </div>

          {/* Project list table like Figma My Ratings */}
          <Card className="rounded-xl border border-[#D0DAEE] text-left">
            <Table<IMyRatingItem>
              rowKey="id"
              dataSource={tableItems}
              columns={columns}
              loading={loading}
              pagination={false}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyRatingPage;
