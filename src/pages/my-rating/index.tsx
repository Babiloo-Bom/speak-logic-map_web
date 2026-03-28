import { Button, Card, message, Typography, Table } from "antd";
import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { CopyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getAuthToken } from "@/utils/constants";
import type { IMyRatingItem, IResponseGetMyRating } from "@/lib/pages/my-rating/type";

const { Text } = Typography;

const MyRatingPage = () => {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSavedTable, setShowSavedTable] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableData, setTableData] = useState<IResponseGetMyRating | null>(null);

  const fetchProjectIdentificationList = async () => {
    try {
      setTableLoading(true);
      const token = getAuthToken();
      if (!token) {
        message.error("No authentication token found");
        return;
      }
      const res = await fetch("/api/ratings/project-identification?page=1&limit=20", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        message.error(err.error || "Failed to load project identifications");
        return;
      }
      const data: IResponseGetMyRating = await res.json();
      setTableData(data);
    } catch (e) {
      console.error("Fetch project identifications error:", e);
      message.error("Network error. Please try again.");
    } finally {
      setTableLoading(false);
    }
  };

  const handleGenerate = async () => {
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
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        message.error(err.error || "Failed to generate project identification");
        return;
      }

      const newItem = await res.json();
      setSelectedProjectId(newItem.project_id);
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
      // Show table after save
      setShowSavedTable(true);
      await fetchProjectIdentificationList();
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

  const tableItems = tableData?.items ?? [];
  const columns = [
    {
      title: "Project Identification",
      dataIndex: "project_id",
      key: "project_id",
      render: (id: string, row: IMyRatingItem) => {
        const providerIdForRating = row.provider_id ?? row.sender_provider_id;
        let href: string;
        if (providerIdForRating) {
          href = `/provider-search/provider-rating?providerId=${providerIdForRating}&projectId=${encodeURIComponent(id)}&piId=${encodeURIComponent(String(row.id))}`;
        } else if (row.manager_id) {
          href = `/manager-search/manager-rating?managerId=${row.manager_id}&projectId=${encodeURIComponent(id)}&piId=${encodeURIComponent(String(row.id))}`;
        } else {
          href = `/rate/start?projectId=${encodeURIComponent(id)}&piId=${encodeURIComponent(String(row.id))}`;
        }
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
      width: 140,
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Used",
      dataIndex: "used",
      key: "used",
      width: 90,
      render: (used: boolean) => (used ? "Yes" : "No"),
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

          {/* Project Identification (ban đầu trống; chỉ hiện sau khi bấm Generate hoặc chọn từ bảng) */}
          <div className="mb-10">
            <Card className="rounded-xl border border-[#D0DAEE]">
              <div className="flex flex-col items-center gap-3">
                <Text type="secondary">Project Identification</Text>
                <div className="px-4 py-3 rounded-lg bg-[#F5F6FA] text-lg font-mono tracking-wide border border-[#D0DAEE] w-full max-w-xl mx-auto break-all min-h-[52px] flex items-center justify-center">
                  {selectedProjectId ?? ""}
                </div>
              </div>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
            <Button
              size="large"
              className="w-full sm:w-40 h-11 border-primary text-primary"
              onClick={handleSave}
              loading={saving}
              disabled={!selectedProjectId}
            >
              Save
            </Button>
            <Button
              size="large"
              icon={<CopyOutlined />}
              className="bg-primary text-white w-full sm:w-56 h-11 flex items-center justify-center"
              onClick={handleCopy}
              disabled={!selectedProjectId}
            >
              Copy To Clipboard
            </Button>
          </div>

          {showSavedTable && (
            <div className="mt-10">
              <Card className="rounded-xl border border-[#D0DAEE] text-left">
                <Table<IMyRatingItem>
                  rowKey={(r) => `${r.project_id}-${r.id}`}
                  dataSource={tableItems}
                  columns={columns as any}
                  loading={tableLoading}
                  pagination={false}
                />
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRatingPage;
