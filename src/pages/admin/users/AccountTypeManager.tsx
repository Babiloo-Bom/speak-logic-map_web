import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Card, Form, message, Select, Space, Tag, Typography } from "antd";
import { getAuthToken } from "@/utils/constants";

const { Paragraph, Text, Title } = Typography;

type UserOption = { value: number; label: string };

type UserInfo = {
  id: number;
  email: string;
  role: string;
  status: string;
  fullName?: string | null;
};

const VALID_ROLES = ["user", "admin", "moderator", "premium", "provider"] as const;

const AccountTypeManager: React.FC = () => {
  const [form] = Form.useForm();
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [userOptionsLoading, setUserOptionsLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mergedOptions = useMemo(() => userOptions, [userOptions]);

  const fetchUserOptions = useCallback(async (search: string) => {
    const token = getAuthToken();
    if (!token) return;
    setUserOptionsLoading(true);
    try {
      const res = await fetch(
        `/api/notifications/user-options?q=${encodeURIComponent(search)}&limit=100`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) {
        message.error(data.error || "Không tải được danh sách user");
        return;
      }
      const items = Array.isArray(data.items) ? data.items : [];
      setUserOptions(
        items.map((i: { id: number; label: string }) => ({
          value: Number(i.id),
          label: String(i.label),
        }))
      );
    } catch (e) {
      console.error(e);
      message.error("Lỗi tải danh sách user");
    } finally {
      setUserOptionsLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    (q: string) => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => fetchUserOptions(q), 300);
    },
    [fetchUserOptions]
  );

  useEffect(() => {
    fetchUserOptions("");
  }, [fetchUserOptions]);

  const fetchUserInfo = useCallback(async (userId: number) => {
    const token = getAuthToken();
    if (!token) return;
    setLoadingUser(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setSelectedUser(null);
        setError(data.error || "Không tải được thông tin user");
        return;
      }
      setSelectedUser(data.user as UserInfo);
      form.setFieldsValue({ role: data.user?.role });
    } catch (e) {
      console.error(e);
      setSelectedUser(null);
      setError("Network error. Please try again.");
    } finally {
      setLoadingUser(false);
    }
  }, [form]);

  const handleChangeRole = useCallback(
    async (values: { userId: number; role: string }) => {
      const token = getAuthToken();
      if (!token) {
        message.error("No authentication token found");
        return;
      }
      setSaving(true);
      setError("");
      try {
        const res = await fetch("/api/admin/users/set-role", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: values.userId, role: values.role }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Cập nhật role thất bại");
          return;
        }
        message.success(data.message || "Đã cập nhật loại tài khoản");
        await fetchUserInfo(values.userId);
      } catch (e) {
        console.error(e);
        setError("Network error. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [fetchUserInfo]
  );

  return (
    <div className="space-y-4">
      <div>
        <Title level={3} className="!mb-1">
          Gán loại tài khoản (Account Type)
        </Title>
        <Paragraph type="secondary" className="!mb-0">
          Chọn user rồi set <Text strong>role</Text> (type account). Chỉ admin mới thao tác được.
        </Paragraph>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleChangeRole}
          initialValues={{ role: "user" }}
        >
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Form.Item
              name="userId"
              label="User"
              rules={[{ required: true, message: "Chọn user" }]}
            >
              <Select
                showSearch
                placeholder="Tìm theo tên hoặc email..."
                filterOption={false}
                loading={userOptionsLoading}
                options={mergedOptions}
                onSearch={debouncedSearch}
                onChange={(value) => {
                  const id = Number(value);
                  if (!Number.isNaN(id)) fetchUserInfo(id);
                }}
              />
            </Form.Item>

            <Form.Item
              name="role"
              label="Account type"
              rules={[
                {
                  required: true,
                  message: "Chọn loại tài khoản",
                },
              ]}
            >
              <Select
                options={VALID_ROLES.map((r) => ({ value: r, label: r }))}
                disabled={!form.getFieldValue("userId")}
              />
            </Form.Item>

            {error ? <Alert type="error" showIcon message={error} /> : null}

            {selectedUser ? (
              <div className="flex flex-wrap gap-2 items-center">
                <Tag color="blue">#{selectedUser.id}</Tag>
                <Tag>{selectedUser.email}</Tag>
                <Tag color={selectedUser.status === "active" ? "green" : "gold"}>
                  {selectedUser.status}
                </Tag>
                <Tag color="purple">role: {selectedUser.role}</Tag>
                {selectedUser.fullName ? <Tag>{selectedUser.fullName}</Tag> : null}
                {loadingUser ? <Text type="secondary">Loading…</Text> : null}
              </div>
            ) : null}

            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              disabled={!form.getFieldValue("userId")}
            >
              Lưu loại tài khoản
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default AccountTypeManager;

