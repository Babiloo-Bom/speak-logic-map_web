/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Switch, message, Card, Row, Col, Space } from "antd";
import { useRouter } from "next/router";
import { getAuthToken } from "@/utils/constants";
import type { ManagerCreateInput } from "@/types/manager";
import Head from "next/head";

const { TextArea } = Input;
const { Option } = Select;

const CreateManager: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [functions, setFunctions] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);

  useEffect(() => {
    // TODO: Fetch functions and problems for selection
    // For now, using empty arrays
  }, []);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        message.error("No authentication token found");
        return;
      }

      const payload: ManagerCreateInput = {
        email: values.email,
        password: values.password,
        name: values.name,
        description: values.description,
        expertise: values.expertise,
        status: values.status || "active",
        is_given_set: values.is_given_set || false,
        lat: values.lat ? parseFloat(values.lat) : undefined,
        lng: values.lng ? parseFloat(values.lng) : undefined,
        geo_id: values.geo_id ? parseInt(values.geo_id) : undefined,
        function_ids: values.function_ids || [],
        problem_ids: values.problem_ids || [],
      };

      const response = await fetch("/api/managers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        message.success("Manager created successfully");
        router.push("/admin");
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Failed to create manager");
      }
    } catch (error) {
      message.error("Network error. Please try again.");
      console.error("Create error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create Manager - Admin</title>
      </Head>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Create Manager</h1>
            <p className="text-gray-600 mt-1">Add a new manager to the system</p>
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please input email" },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input placeholder="manager@example.com" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[{ required: true, message: "Please input password" }]}
                >
                  <Input.Password placeholder="Enter password" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please input manager name" }]}
            >
              <Input placeholder="Manager Name" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextArea rows={4} placeholder="Manager description" />
            </Form.Item>

            <Form.Item name="expertise" label="Expertise">
              <Input placeholder="e.g., Project Management, Agile, Scrum" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="status" label="Status" initialValue="active">
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
                  Create Manager
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

export default CreateManager;

