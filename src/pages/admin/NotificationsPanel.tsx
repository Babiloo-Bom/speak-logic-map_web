import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Form,
  Input,
  Alert,
  message,
  Typography,
  Switch,
  Tag,
  Divider,
  Spin,
  Radio,
  Select,
} from "antd";
import { getAuthToken } from "@/utils/constants";

const { TextArea } = Input;
const { Paragraph, Text } = Typography;

type NotificationItem = {
  id: number;
  user_id: number | null;
  title: string;
  body: string | null;
  data?: any;
  read_at: string | null;
  created_at: string;
  is_read: boolean;
};

type UserOption = { value: number; label: string };

const NotificationsPanel: React.FC = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [resultInfo, setResultInfo] = useState<{
    successCount: number;
    failureCount: number;
    totalTokens: number;
    targetUserId?: number | null;
    targetUserIds?: number[] | null;
    broadcast?: boolean;
  } | null>(null);
  const [sendMode, setSendMode] = useState<"broadcast" | "user">("broadcast");
  const [historyItems, setHistoryItems] = useState<NotificationItem[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [includeBroadcast, setIncludeBroadcast] = useState(true);
  const [userIdFilter, setUserIdFilter] = useState("");
  /** Chỉ admin: mặc định tắt — API chỉ trả thông báo của user đang đăng nhập (hoặc userId nhập tay), tránh tải full DB */
  const [scopeAll, setScopeAll] = useState(false);
  const [historyError, setHistoryError] = useState("");

  /** Dropdown người nhận: options từ API + ghim label khi đã chọn (để search đổi vẫn hiển thị đúng) */
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [pinnedUserOptions, setPinnedUserOptions] = useState<UserOption[]>([]);
  const [userOptionsLoading, setUserOptionsLoading] = useState(false);
  const userSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const debouncedFetchUserOptions = useCallback(
    (search: string) => {
      if (userSearchTimer.current) clearTimeout(userSearchTimer.current);
      userSearchTimer.current = setTimeout(() => {
        fetchUserOptions(search);
      }, 300);
    },
    [fetchUserOptions]
  );

  useEffect(() => {
    if (sendMode === "user") {
      fetchUserOptions("");
    } else {
      setPinnedUserOptions([]);
      setUserOptions([]);
    }
  }, [sendMode, fetchUserOptions]);

  const mergedUserOptions = useMemo(() => {
    const map = new Map<number, UserOption>();
    pinnedUserOptions.forEach((o) => map.set(o.value, o));
    userOptions.forEach((o) => map.set(o.value, o));
    return Array.from(map.values());
  }, [pinnedUserOptions, userOptions]);

  const watchedTargetUserIds = Form.useWatch("targetUserIds", form) as number[] | undefined;
  useEffect(() => {
    if (!Array.isArray(watchedTargetUserIds)) return;
    setPinnedUserOptions((prev) => prev.filter((p) => watchedTargetUserIds.includes(p.value)));
  }, [watchedTargetUserIds]);

  const handleSend = async (values: { title: string; body?: string; targetUserIds?: number[] }) => {
    const token = getAuthToken();
    if (!token) {
      message.error("No authentication token found");
      return;
    }

    const rawIds = values.targetUserIds ?? [];
    const userIds = Array.from(
      new Set(rawIds.filter((n) => typeof n === "number" && !Number.isNaN(n) && n >= 1))
    );

    if (sendMode === "user" && userIds.length === 0) {
      message.error("Chọn ít nhất một người nhận");
      return;
    }
    if (sendMode === "user" && userIds.length > 200) {
      message.error("Tối đa 200 user mỗi lần gửi");
      return;
    }

    try {
      setSubmitting(true);
      setResultInfo(null);

      const payload: Record<string, unknown> = {
        title: values.title.trim(),
        body: values.body?.trim() || "",
      };
      if (sendMode === "user" && userIds.length > 0) {
        payload.userIds = userIds;
      }

      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (Array.isArray(data.missingIds) && data.missingIds.length > 0) {
          message.error(`User không tồn tại: ${data.missingIds.join(", ")}`);
        } else {
          message.error(data.error || "Failed to send notification");
        }
        return;
      }

      message.success(data.message || "Notification sent");
      if (typeof data.successCount === "number") {
        setResultInfo({
          successCount: data.successCount,
          failureCount: data.failureCount ?? 0,
          totalTokens: data.totalTokens ?? 0,
          targetUserId: data.targetUserId ?? null,
          targetUserIds: Array.isArray(data.targetUserIds) ? data.targetUserIds : null,
          broadcast: data.broadcast,
        });
      }
      form.resetFields(["title", "body", "targetUserIds"]);
    } catch (error) {
      console.error("Send notification error:", error);
      message.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const pageSize = 20;
  const parsedUserId = useMemo(() => {
    const n = parseInt(userIdFilter.trim(), 10);
    return Number.isNaN(n) ? null : n;
  }, [userIdFilter]);

  const fetchHistory = useCallback(
    async (page: number, reset: boolean) => {
      const token = getAuthToken();
      if (!token) return;
      try {
        setHistoryLoading(true);
        setHistoryError("");
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pageSize),
          onlyUnread: String(onlyUnread),
          includeBroadcast: String(includeBroadcast),
        });
        if (parsedUserId != null) params.set("userId", String(parsedUserId));
        if (scopeAll) params.set("scope", "all");
        const res = await fetch(`/api/notifications/history?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) {
          setHistoryError(data.error || "Failed to load notifications");
          return;
        }
        const newItems: NotificationItem[] = Array.isArray(data.items) ? data.items : [];
        setHistoryItems((prev) => (reset ? newItems : [...prev, ...newItems]));
        setHistoryPage(page);
        setHasMore(Boolean(data.hasMore));
        setUnreadCount(Number(data.unreadCount || 0));
      } catch (e) {
        console.error("Fetch notification history error:", e);
        setHistoryError("Network error. Please try again.");
      } finally {
        setHistoryLoading(false);
      }
    },
    [onlyUnread, includeBroadcast, parsedUserId, scopeAll]
  );

  useEffect(() => {
    fetchHistory(1, true);
  }, [fetchHistory]);

  const handleMarkRead = async (id: number) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const res = await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        message.error(data.error || "Failed to mark read");
        return;
      }
      setHistoryItems((prev) =>
        prev.map((x) => (x.id === id ? { ...x, is_read: true, read_at: new Date().toISOString() } : x))
      );
      setUnreadCount((v) => Math.max(0, v - 1));
    } catch (e) {
      console.error("Mark read error:", e);
      message.error("Network error. Please try again.");
    }
  };

  const handleHistoryScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 80;
    if (nearBottom && hasMore && !historyLoading) {
      fetchHistory(historyPage + 1, false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Send Notification</h2>
        <Paragraph type="secondary" className="mb-0">
          <Text>
            Gửi push qua FCM: <strong>broadcast</strong> tới mọi thiết bị đã đăng ký, hoặc tới{" "}
            <strong>một hoặc nhiều user</strong> (chọn theo tên và email). Chỉ admin mới có quyền gửi.
          </Text>
        </Paragraph>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSend}
        className="bg-white border border-solid border-gray-200 rounded-lg p-6"
      >
        <Form.Item label="Đối tượng nhận">
          <Radio.Group
            value={sendMode}
            onChange={(e) => {
              setSendMode(e.target.value);
              form.setFieldsValue({ targetUserIds: [] });
              setPinnedUserOptions([]);
            }}
          >
            <Radio value="broadcast">Tất cả thiết bị đã đăng ký (broadcast)</Radio>
            <Radio value="user">Chọn user (tên & email, có thể nhiều người)</Radio>
          </Radio.Group>
        </Form.Item>

        {sendMode === "user" ? (
          <Form.Item
            name="targetUserIds"
            label="Người nhận"
            rules={[
              {
                validator: (_, value) => {
                  const arr = Array.isArray(value) ? value : [];
                  if (arr.length === 0) {
                    return Promise.reject(new Error("Chọn ít nhất một người nhận"));
                  }
                  return Promise.resolve();
                },
              },
            ]}
            extra="Gõ để tìm theo tên hoặc email. Chọn nhiều dòng trong danh sách. Tối đa 200 user mỗi lần gửi."
          >
            <Select
              mode="multiple"
              showSearch
              allowClear
              placeholder="Tìm theo tên hoặc email..."
              className="w-full max-w-2xl"
              filterOption={false}
              loading={userOptionsLoading}
              options={mergedUserOptions}
              onSearch={debouncedFetchUserOptions}
              onSelect={(value, option) => {
                const id = Number(value);
                const label =
                  typeof option?.label === "string"
                    ? option.label
                    : mergedUserOptions.find((o) => o.value === id)?.label ?? `#${id}`;
                setPinnedUserOptions((prev) => {
                  if (prev.some((p) => p.value === id)) return prev;
                  return [...prev, { value: id, label }];
                });
              }}
              onDropdownVisibleChange={(open) => {
                if (open) fetchUserOptions("");
              }}
            />
          </Form.Item>
        ) : null}

        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input maxLength={120} placeholder="Tiêu đề thông báo" />
        </Form.Item>

        <Form.Item name="body" label="Body">
          <TextArea
            rows={4}
            maxLength={500}
            showCount
            placeholder="Nội dung chi tiết (tùy chọn)"
          />
        </Form.Item>

        <div className="flex justify-end">
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
            className="bg-primary hover:bg-primary px-8"
          >
            {sendMode === "user" ? "Gửi cho user đã chọn" : "Gửi broadcast"}
          </Button>
        </div>
      </Form>

      {resultInfo && (
        <Alert
          type="info"
          showIcon
          message="Delivery result"
          description={
            <div>
              <div>
                <Text strong>Chế độ:</Text>{" "}
                {resultInfo.broadcast ? (
                  <Tag color="purple">Broadcast</Tag>
                ) : resultInfo.targetUserIds && resultInfo.targetUserIds.length > 0 ? (
                  <span className="flex flex-wrap gap-1">
                    {resultInfo.targetUserIds.map((id) => (
                      <Tag key={id} color="blue">
                        #{id}
                      </Tag>
                    ))}
                  </span>
                ) : (
                  <Tag color="blue">User #{resultInfo.targetUserId ?? "?"}</Tag>
                )}
              </div>
              <div>
                <Text strong>Sent successfully:</Text> {resultInfo.successCount}
              </div>
              <div>
                <Text strong>Failed:</Text> {resultInfo.failureCount}
              </div>
              <div>
                <Text strong>Total tokens:</Text> {resultInfo.totalTokens}
              </div>
            </div>
          }
        />
      )}

      <Divider />

      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Notification History</h3>
        <Paragraph type="secondary" className="mb-3 !text-sm">
          Mặc định chỉ hiển thị thông báo của tài khoản admin đang đăng nhập. Nhập User ID để xem inbox của user khác.
          Chỉ bật &quot;All users (system)&quot; khi cần audit toàn hệ thống — tốn băng thông hơn.
        </Paragraph>
        <div className="flex flex-wrap gap-4 items-end mb-4">
          <div className="flex items-center gap-2">
            <Text>Unread only</Text>
            <Switch checked={onlyUnread} onChange={setOnlyUnread} />
          </div>
          <div className="flex items-center gap-2">
            <Text>Include broadcast</Text>
            <Switch checked={includeBroadcast} onChange={setIncludeBroadcast} disabled={scopeAll} />
          </div>
          <div className="flex items-center gap-2">
            <Text>All users (system)</Text>
            <Switch
              checked={scopeAll}
              onChange={(v) => {
                setScopeAll(v);
                if (v) setIncludeBroadcast(true);
              }}
            />
          </div>
          <div className="w-52">
            <Text>User ID (admin)</Text>
            <Input
              placeholder="e.g. 4"
              value={userIdFilter}
              onChange={(e) => setUserIdFilter(e.target.value)}
              disabled={scopeAll}
            />
          </div>
          <Button onClick={() => fetchHistory(1, true)}>Apply filter</Button>
          <Tag color={unreadCount > 0 ? "orange" : "green"}>Unread: {unreadCount}</Tag>
        </div>

        {historyError ? (
          <Alert type="error" showIcon message={historyError} />
        ) : (
          <div
            className="bg-white border border-solid border-gray-200 rounded-lg p-4 h-[420px] overflow-auto"
            onScroll={handleHistoryScroll}
          >
            {historyItems.length === 0 && !historyLoading ? (
              <Text type="secondary">No notifications</Text>
            ) : (
              <div className="space-y-3">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-3 ${item.is_read ? "bg-white" : "bg-blue-50 border-blue-200"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Text strong>{item.title}</Text>
                      <div className="flex items-center gap-2">
                        {item.user_id == null ? <Tag color="purple">Broadcast</Tag> : <Tag>User #{item.user_id}</Tag>}
                        {item.is_read ? <Tag color="green">Read</Tag> : <Tag color="gold">Unread</Tag>}
                      </div>
                    </div>
                    {item.body ? <p className="text-sm text-gray-700 mt-2 mb-1">{item.body}</p> : null}
                    <div className="flex items-center justify-between mt-2">
                      <Text type="secondary" className="text-xs">
                        {new Date(item.created_at).toLocaleString()}
                      </Text>
                      {!item.is_read ? (
                        <Button size="small" onClick={() => handleMarkRead(item.id)}>
                          Mark read
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {historyLoading ? (
              <div className="w-full py-4 flex justify-center">
                <Spin size="small" />
              </div>
            ) : null}
            {!hasMore && historyItems.length > 0 ? (
              <div className="w-full py-2 text-center text-xs text-gray-400">No more items</div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPanel;

