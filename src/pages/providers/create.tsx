import React, { useState } from "react";
import { Form, Input, Button, Upload, message } from "antd";
import { CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd/es/upload/interface";
import { useRouter } from "next/router";
import { getAuthToken } from "@/utils/constants";
import type { ProviderCreateInput } from "@/types/provider";
import Head from "next/head";

const { TextArea } = Input;

const ACCEPT_IMAGES = ".jpg,.jpeg,.png";

function uploadFileToServer(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const token = getAuthToken();
    if (!token) {
      reject(new Error("Not authenticated"));
      return;
    }
    const formData = new FormData();
    const stampedName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    formData.append("file", file);
    formData.append("url", `/uploads/${stampedName}`);

    fetch("/api/file/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) resolve(data.url);
        else reject(new Error(data.error || "Upload failed"));
      })
      .catch(reject);
  });
}

export default function CreateProviderProfilePage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [profileFileList, setProfileFileList] = useState<UploadFile[]>([]);
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  const [mapFileList, setMapFileList] = useState<UploadFile[]>([]);

  const handleProfileUpload = async (file: File) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Only JPEG and PNG files are accepted.");
      return false;
    }
    try {
      const url = await uploadFileToServer(file);
      setProfileImageUrl(url);
      setProfileFileList([{ uid: "-1", name: file.name, status: "done", url }]);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Upload failed");
    }
    return false; // prevent antd default upload
  };

  const handleMapUpload = async (file: File) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("Only JPEG and PNG files are accepted.");
      return false;
    }
    try {
      const url = await uploadFileToServer(file);
      setMapImageUrl(url);
      setMapFileList([{ uid: "-2", name: file.name, status: "done", url }]);
    } catch (e) {
      message.error(e instanceof Error ? e.message : "Upload failed");
    }
    return false;
  };

  const onFinish = async (values: Record<string, any>) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        message.error("Please sign in to create a provider.");
        return;
      }

      const payload: ProviderCreateInput = {
        name: values.name?.trim() || "Provider",
        description: values.about_provider?.trim() || undefined,
        contact_number: values.contact_number?.trim() || undefined,
        address: values.address?.trim() || undefined,
        image_url: profileImageUrl || undefined,
        map_image_url: mapImageUrl || undefined,
        status: "active",
        is_applicable: true,
      };

      const res = await fetch("/api/providers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        message.success("Provider profile created successfully.");
        router.push("/provider-search");
      } else {
        const err = await res.json();
        message.error(err.error || "Failed to create provider.");
      }
    } catch (e) {
      message.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Provider Profile - Add Providers</title>
      </Head>
      <div className="bg-gray-100 min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-6">Provider Profile</h1>

          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              name="name"
              label="Provider name"
              rules={[{ required: true, message: "Please enter provider name" }]}
            >
              <Input placeholder="Provider or business name" />
            </Form.Item>

            <Form.Item name="about_provider" label="About Provider">
              <TextArea rows={5} placeholder="Detail" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item name="contact_number" label="Contact Number">
                <Input placeholder="Contact number" />
              </Form.Item>
              <Form.Item name="address" label="Address">
                <Input placeholder="Address" />
              </Form.Item>
            </div>

            <Form.Item label="Profile Image">
              <Upload.Dragger
                accept={ACCEPT_IMAGES}
                fileList={profileFileList}
                beforeUpload={handleProfileUpload}
                onRemove={() => {
                  setProfileImageUrl(null);
                  setProfileFileList([]);
                }}
                maxCount={1}
                listType="text"
              >
                <p className="ant-upload-drag-icon flex justify-center">
                  <CloudUploadOutlined className="text-3xl text-gray-400" />
                </p>
                <p className="ant-upload-text">Upload or Drag your file here</p>
                <p className="ant-upload-hint">(Only jpeg and png files will be accepted)</p>
              </Upload.Dragger>
              {profileFileList.length > 0 && (
                <div className="flex items-center gap-2 mt-2 text-blue-600">
                  <span>{profileFileList[0].name}</span>
                  <DeleteOutlined
                    className="cursor-pointer hover:text-red-600"
                    onClick={() => {
                      setProfileImageUrl(null);
                      setProfileFileList([]);
                    }}
                  />
                </div>
              )}
            </Form.Item>

            <Form.Item label="Map Image (Optional)">
              <Upload.Dragger
                accept={ACCEPT_IMAGES}
                fileList={mapFileList}
                beforeUpload={handleMapUpload}
                onRemove={() => {
                  setMapImageUrl(null);
                  setMapFileList([]);
                }}
                maxCount={1}
                listType="text"
              >
                <p className="ant-upload-drag-icon flex justify-center">
                  <CloudUploadOutlined className="text-3xl text-gray-400" />
                </p>
                <p className="ant-upload-text">Upload or Drag your file here</p>
                <p className="ant-upload-hint">(Only jpeg and png files will be accepted)</p>
              </Upload.Dragger>
              {mapFileList.length > 0 && (
                <div className="flex items-center gap-2 mt-2 text-blue-600">
                  <span>{mapFileList[0].name}</span>
                  <DeleteOutlined
                    className="cursor-pointer hover:text-red-600"
                    onClick={() => {
                      setMapImageUrl(null);
                      setMapFileList([]);
                    }}
                  />
                </div>
              )}
            </Form.Item>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="default" onClick={() => router.back()} className="!text-blue-600 !border-blue-600">
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading} className="!bg-blue-800 hover:!bg-blue-900">
                Submit
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </>
  );
}
