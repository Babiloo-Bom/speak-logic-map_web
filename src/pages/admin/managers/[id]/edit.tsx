/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Switch, message, Card, Row, Col, Spin } from "antd";
import { useRouter } from "next/router";
import { getAuthToken } from "@/utils/constants";
import type { ManagerUpdateInput } from "@/types/manager";
import type { Manager } from "@/types/manager";
import Head from "next/head";

const { TextArea } = Input;
const { Option } = Select;

const EditManager: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [manager, setManager] = useState<Manager | null>(null);
  const [functions, setFunctions] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchManager();
    }
  }, [id]);

  const fetchManager = async () => {
    try {
      setFetching(true);
      const token = getAuthToken();
      if (!token) {
        message.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/managers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: Manager = await response.json();
        setManager(data);
        form.setFieldsValue({
          name: data.name,
          email: data.email,
          description: data.description,
          expertise: data.expertise,
          status: data.status,
          is_given_set: data.is_given_set,
          lat: data.lat,
          lng: data.lng,
          function_ids: data.functions?.map((f) => f.id) || [],
          problem_ids: data.problems?.map((p) => p.id) || [],
        });
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Failed to fetch manager");
        router.push("/admin");
      }
    } catch (error) {
      message.error("Network error. Please try again.");
      console.error("Fetch error:", error);
    } finally {
      setFetching(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        message.error("No authentication token found");
        return;
      }

      const payload: ManagerUpdateInput = {
        name: values.name,
        description: values.description,
        expertise: values.expertise,
        status: values.status,
        is_given_set: values.is_given_set,
        lat: values.lat ? parseFloat(values.lat) : undefined,
        lng: values.lng ? parseFloat(values.lng) : undefined,
        function_ids: values.function_ids || [],
        problem_ids: values.problem_ids || [],
      };

      // Only include password if provided
      if (values.password) {
        payload.password = values.password;
      }

      const response = await fetch(`/api/managers/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        message.success("Manager updated successfully");
        router.push("/admin");
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Failed to update manager");
      }
    } catch (error) {
      message.error("Network error. Please try again.");
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit Manager - Admin</title>
      </Head>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Edit Manager</h1>
            <p className="text-gray-600 mt-1">Update manager information</p>
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please input manager name" }]}
            >
              <Input placeholder="Manager Name" />
            </Form.Item>

            <Form.Item name="email" label="Email">
              <Input disabled placeholder="Email (cannot be changed)" />
            </Form.Item>

            <Form.Item name="password" label="New Password (leave blank to keep current)">
              <Input.Password placeholder="Enter new password" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextArea rows={4} placeholder="Manager description" />
            </Form.Item>

            <Form.Item name="expertise" label="Expertise">
              <Input placeholder="e.g., Project Management, Agile, Scrum" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="status" label="Status">
                  <Select>
                    <Option value="active">Active</Option>
                    <Option value="pending">Pending</Option>
                    <Option value="suspended">Suspended</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="lat" label="Latitude">
                  <Input type="number" step="any" placeholder="21.0285" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="lng" label="Longitude">
                  <Input type="number" step="any" placeholder="105.8542" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="is_given_set" label="The Given Set Applicable" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item name="function_ids" label="Functions">
              <Select mode="multiple" placeholder="Select functions">
                {functions.map((func) => (
                  <Option key={func.id} value={func.id}>
                    {func.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="problem_ids" label="Problems">
              <Select mode="multiple" placeholder="Select problems">
                {problems.map((prob) => (
                  <Option key={prob.id} value={prob.id}>
                    {prob.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Update Manager
                </Button>
                <Button onClick={() => router.back()}>Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default EditManager;

