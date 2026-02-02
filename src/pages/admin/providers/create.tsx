/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState } from "react";
import { Form, Input, Button, Select, Switch, message, Card, Row, Col, Space } from "antd";
import { useRouter } from "next/router";
import { getAuthToken } from "@/utils/constants";
import type { ProviderCreateInput } from "@/types/provider";
import Head from "next/head";

const { TextArea } = Input;
const { Option } = Select;

const CreateProvider: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [functions, setFunctions] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        message.error("No authentication token found");
        return;
      }

      const payload: ProviderCreateInput = {
        name: values.name,
        url: values.url,
        website_url: values.website_url,
        description: values.description,
        image_url: values.image_url,
        status: values.status || "active",
        is_applicable: values.is_applicable !== undefined ? values.is_applicable : true,
        location_by: values.location_by || false,
        lat: values.lat ? parseFloat(values.lat) : undefined,
        lng: values.lng ? parseFloat(values.lng) : undefined,
        near_city: values.near_city,
        geo_id: values.geo_id ? parseInt(values.geo_id) : undefined,
        user_id: values.user_id ? parseInt(values.user_id) : undefined,
        function_ids: values.function_ids || [],
        problem_ids: values.problem_ids || [],
      };

      const response = await fetch("/api/providers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        message.success("Provider created successfully");
        router.push("/admin");
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Failed to create provider");
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
        <title>Create Provider - Admin</title>
      </Head>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Create Provider</h1>
            <p className="text-gray-600 mt-1">Add a new provider to the system</p>
          </div>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please input provider name" }]}
            >
              <Input placeholder="Provider Name" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="url" label="Internal URL">
                  <Input placeholder="www.urlofprovider.com" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="website_url" label="Website URL">
                  <Input placeholder="https://example.com" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="description" label="Description">
              <TextArea rows={4} placeholder="Provider description" />
            </Form.Item>

            <Form.Item name="image_url" label="Image URL">
              <Input placeholder="/uploads/providers/image.jpg" />
            </Form.Item>

            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="status" label="Status" initialValue="active">
                  <Select>
                    <Option value="active">Active</Option>
                    <Option value="inactive">Inactive</Option>
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

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="near_city" label="Near City">
                  <Input placeholder="Ho Chi Minh City" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="user_id" label="User ID (Optional)">
                  <Input type="number" placeholder="Link to existing user" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="is_applicable"
                  label="The Given Set Applicable"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="location_by" label="Location By" valuePropName="checked" initialValue={false}>
                  <Switch />
                </Form.Item>
              </Col>
            </Row>

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
                  Create Provider
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

export default CreateProvider;

