/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tag, message, Popconfirm, Rate } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { getAuthToken } from "@/utils/constants";
import type { Provider } from "@/types/provider";
import type { ProviderSearchResponse } from "@/types/provider";

const ProvidersList: React.FC = () => {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const fetchProviders = async (page: number = 1, limit: number = 10) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        message.error("No authentication token found");
        return;
      }

      const url = `/api/providers/search?page=${page}&limit=${limit}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result: ProviderSearchResponse = await response.json();
        setProviders(result.providers);
        setPagination({
          current: result.page,
          pageSize: result.limit,
          total: result.total,
        });
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Failed to fetch providers");
      }
    } catch (error) {
      message.error("Network error. Please try again.");
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders(pagination.current, pagination.pageSize);
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const token = getAuthToken();
      if (!token) {
        message.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/providers/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok || response.status === 204) {
        message.success("Provider deleted successfully");
        fetchProviders(pagination.current, pagination.pageSize);
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Failed to delete provider");
      }
    } catch (error) {
      message.error("Network error. Please try again.");
      console.error("Delete error:", error);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Provider) => (
        <div className="flex items-center gap-3">
          {record.image_url && (
            <img
              src={record.image_url}
              alt={text}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      render: (url: string) => (url ? <span className="text-blue-600">{url}</span> : "-"),
    },
    {
      title: "Rating",
      key: "rating",
      render: (_: any, record: Provider) => (
        <div className="flex items-center gap-2">
          <Rate disabled value={record.rating || 0} allowHalf className="text-sm" />
          <span className="text-sm text-gray-600">{record.rating ? record.rating.toFixed(1) : "0.0"}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "active"
            ? "green"
            : status === "pending"
            ? "orange"
            : status === "suspended"
            ? "red"
            : "default";
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Applicable",
      dataIndex: "is_applicable",
      key: "is_applicable",
      render: (isApplicable: boolean) => (
        <Tag color={isApplicable ? "blue" : "default"}>{isApplicable ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right" as const,
      width: 200,
      render: (_: any, record: Provider) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/provider-search/provider-detail?providerId=${record.id}`)}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => router.push(`/admin/providers/${record.id}/edit`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Provider"
            description="Are you sure you want to delete this provider? This action cannot be undone."
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okType="danger"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Providers</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push("/admin/providers/create")}
        >
          Create Provider
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={providers}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} providers`,
          onChange: (page, pageSize) => {
            setPagination({ ...pagination, current: page, pageSize });
            fetchProviders(page, pageSize);
          },
        }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default ProvidersList;

