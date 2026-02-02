/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, Switch, message, Card, Row, Col, Spin, Space } from "antd";
import { useRouter } from "next/router";
import { getAuthToken } from "@/utils/constants";
import type { ProviderUpdateInput } from "@/types/provider";
import type { ProviderWithRelations } from "@/types/provider";
import Head from "next/head";

const { TextArea } = Input;
const { Option } = Select;

const EditProvider: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [provider, setProvider] = useState<ProviderWithRelations | null>(null);
  const [functions, setFunctions] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchProvider();
    }
  }, [id]);

  const fetchProvider = async () => {
    try {
      setFetching(true);
      const token = getAuthToken();
      if (!token) {
        message.error("No authentication token found");
        return;
      }

      const response = await fetch(`/api/providers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: ProviderWithRelations = await response.json();
        setProvider(data);
        form.setFieldsValue({
          name: data.name,
          url: data.url,
          website_url: data.website_url,
          description: data.description,
          image_url: data.image_url,
          status: data.status,
          is_applicable: data.is_applicable,
          location_by: (data as any).location_by || false,
          lat: data.lat,
          lng: data.lng,
          near_city: (data as any).near_city,
          geo_id: data.geo_id,
          user_id: data.user_id,
          function_ids: data.functions?.map((f) => f.id) || [],
          problem_ids: data.problems?.map((p) => p.id) || [],
        });
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Failed to fetch provider");
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

      const payload: ProviderUpdateInput = {
        name: values.name,
        url: values.url,
        website_url: values.website_url,
        description: values.description,
        image_url: values.image_url,
        status: values.status,
        is_applicable: values.is_applicable,
        location_by: values.location_by,
        lat: values.lat ? parseFloat(values.lat) : undefined,
        lng: values.lng ? parseFloat(values.lng) : undefined,
        near_city: values.near_city,
        geo_id: values.geo_id ? parseInt(values.geo_id) : undefined,
        user_id: values.user_id ? parseInt(values.user_id) : undefined,
        function_ids: values.function_ids || [],
        problem_ids: values.problem_ids || [],
      };

      const response = await fetch(`/api/providers/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        message.success("Provider updated successfully");
        router.push("/admin");
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Failed to update provider");
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
        <title>Edit Provider - Admin</title>
      </Head>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Edit Provider</h1>
            <p className="text-gray-600 mt-1">Update provider information</p>
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
                <Form.Item name="status" label="Status">
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
                <Form.Item name="is_applicable" label="The Given Set Applicable" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="location_by" label="Location By" valuePropName="checked">
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
                  Update Provider
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

export default EditProvider;

