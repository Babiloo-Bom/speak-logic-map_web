import { Button, Card, Input, Rate, Table, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { buildQueryParams, getAuthToken } from "@/utils/constants";
import { baseDataRequestGetMyRating } from "@/lib/pages/my-rating/request";
import type { IDataRequestGetMyRating, IMyRatingItem, IResponseGetMyRating } from "@/lib/pages/my-rating/type";
import dayjs from "dayjs";

const { Text } = Typography;

const FunctionRatingsPage = () => {
  const router = useRouter();
  const [data, setData] = useState<IResponseGetMyRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [averageRating, setAverageRating] = useState<number | null>(null);

  const fetchList = async (req: IDataRequestGetMyRating) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) return;
      const queryString = buildQueryParams(req);
      const url = `/api/ratings/project-identification${queryString ? `?${queryString}` : ""}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const result: IResponseGetMyRating = await res.json();
        setData(result);
      }
    } catch (e) {
      console.error("Fetch project identifications error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchAverageRating = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch("/api/ratings/average", { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const json = await res.json();
        setAverageRating(json.average ?? null);
      }
    } catch (e) {
      console.error("Fetch average rating error:", e);
    }
  };

  React.useEffect(() => {
    fetchList(baseDataRequestGetMyRating);
    fetchAverageRating();
  }, [router.asPath]);

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(
      (row) =>
        row.project_id.toLowerCase().includes(q) ||
        dayjs(row.created_at).format("DD/MM/YYYY").toLowerCase().includes(q)
    );
  }, [data?.items, search]);

  const columns = [
    {
      title: "Project Identification",
      dataIndex: "project_id",
      key: "project_id",
      render: (id: string, row: IMyRatingItem) => {
        const providerIdForRating = row.provider_id ?? row.sender_provider_id;
        let href: string;
        if (providerIdForRating) {
          href = `/provider-search/provider-rating?providerId=${providerIdForRating}&projectId=${encodeURIComponent(id)}`;
        } else if (row.manager_id) {
          href = `/manager-search/manager-rating?managerId=${row.manager_id}&projectId=${encodeURIComponent(id)}`;
        } else {
          href = `/function-ratings/${encodeURIComponent(id)}?piId=${row.id}`;
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
      render: (v: string) => dayjs(v).format("DD/MM/YYYY"),
    },
    {
      title: "Action",
      key: "action",
      render: (_: unknown, record: IMyRatingItem) => {
        const href = `/function-ratings/${encodeURIComponent(record.project_id)}?piId=${record.id}`;
        return (
          <Link href={href}>
            <Button
              size="small"
              className="!bg-white !text-primary border border-primary hover:!bg-primary hover:!text-white hover:!border-primary"
            >
              View Rating
            </Button>
          </Link>
        );
      },
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Banner */}
      <div
        className="w-full py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center relative overflow-hidden"
        style={{ minHeight: "200px" }}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-white blur-2xl" />
        </div>
        <h1 className="text-4xl md:text-5xl font-semibold text-white relative z-10">Function Ratings</h1>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 py-8">
        {/* Average rating + Function Trend (dữ liệu thực từ API) */}
        <div className="text-center mb-8">
          <p className="text-xl text-gray-700 mb-2">
            {averageRating != null ? `${averageRating} Average Functions Rating` : "Average Functions Rating"}
          </p>
          <div className="flex justify-center mb-4">
            <Rate
              allowHalf
              disabled
              value={averageRating ?? 0}
              style={{ fontSize: 24 }}
              className="function-rating-stars"
            />
          </div>
          <Link href="/function-ratings/trends">
            <Button type="primary" size="large" className="bg-primary border-primary">
              Function Trend
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search for anything."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            size="large"
            className="rounded-lg"
          />
        </div>

        {/* Project Identification list */}
        <Card className="rounded-xl border border-gray-200">
          <Table
            rowKey="id"
            dataSource={filteredItems}
            columns={columns}
            loading={loading}
            pagination={false}
          />
        </Card>
      </div>
    </div>
  );
};

export default FunctionRatingsPage;
