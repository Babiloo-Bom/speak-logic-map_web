import React, { useState } from "react";
import { Button, Form, Input, Alert, message, Typography } from "antd";
import { getAuthToken } from "@/utils/constants";

const { TextArea } = Input;
const { Paragraph, Text } = Typography;

const NotificationsPanel: React.FC = () => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [resultInfo, setResultInfo] = useState<{
    successCount: number;
    failureCount: number;
    totalTokens: number;
  } | null>(null);

  const handleSend = async (values: { title: string; body?: string }) => {
    const token = getAuthToken();
    if (!token) {
      message.error("No authentication token found");
      return;
    }

    try {
      setSubmitting(true);
      setResultInfo(null);

      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: values.title.trim(),
          body: values.body?.trim() || "",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        message.error(data.error || "Failed to send notification");
        return;
      }

      message.success(data.message || "Notification sent");
      if (typeof data.successCount === "number") {
        setResultInfo({
          successCount: data.successCount,
          failureCount: data.failureCount ?? 0,
          totalTokens: data.totalTokens ?? 0,
        });
      }
      form.resetFields(["title", "body"]);
    } catch (error) {
      console.error("Send notification error:", error);
      message.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Send Notification</h2>
        <Paragraph type="secondary" className="mb-0">
          <Text>
            Gửi push notification tới tất cả thiết bị đã đăng ký FCM token. Chỉ admin mới có quyền gửi.
          </Text>
        </Paragraph>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSend}
        className="bg-white border border-solid border-gray-200 rounded-lg p-6"
      >
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
            Send notification
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
    </div>
  );
};

export default NotificationsPanel;

