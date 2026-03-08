import { Form, Input, Button } from "antd";
import React, { useEffect } from "react";
import { IProviderRatingRequest, InitialUserData } from "@/lib/pages/provider-search/provider-rating/type";

type ProviderDataShape = {
  name?: string;
  website_url?: string;
  address?: string;
  near_city?: string;
  contact_number?: string;
} | null;

type Props = {
  dataRequestRating: IProviderRatingRequest;
  setDataRequestRating: React.Dispatch<React.SetStateAction<IProviderRatingRequest>>;
  nextStep: () => void;
  prevStep: () => void;
  providerData?: ProviderDataShape;
  initialUserData?: InitialUserData | null;
};

const AboutProvider = (props: Props) => {
  const { dataRequestRating, setDataRequestRating, nextStep, prevStep, providerData, initialUserData } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    const providerAddress =
      dataRequestRating.provider_address ||
      providerData?.address ||
      providerData?.near_city ||
      "";
    const personName = dataRequestRating.person_name || initialUserData?.full_name || initialUserData?.user_name || "";
    form.setFieldsValue({
      provider_name: dataRequestRating.provider_name || providerData?.name || "",
      provider_address: providerAddress,
      provider_url: dataRequestRating.provider_url || providerData?.website_url || "",
      person_name: personName,
      person_phone: dataRequestRating.person_phone || initialUserData?.phone_number || "",
    });
  }, [dataRequestRating, providerData, initialUserData, form]);

  const onSubmit = (values: Partial<IProviderRatingRequest>) => {
    const next = { ...dataRequestRating, ...values };
    setDataRequestRating(next);
    nextStep();
  };

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <div className="bg-white border border-solid border-gray-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item
            name="provider_name"
            label="Provider name"
            rules={[{ required: true, message: "Provider name is required" }]}
          >
            <Input size="large" className="bg-[#F5F6FA]" placeholder="Name" />
          </Form.Item>
          <Form.Item
            name="person_name"
            label="Person Name"
            rules={[{ required: true, message: "Person name is required" }]}
          >
            <Input size="large" className="bg-[#F5F6FA]" placeholder="User Name" />
          </Form.Item>
          <Form.Item name="provider_address" label="Provider Address">
            <Input size="large" className="bg-[#F5F6FA]" placeholder="Provider Address" />
          </Form.Item>
          <Form.Item
            name="person_phone"
            label="Phone Number"
            rules={[{ required: true, message: "Phone number is required" }]}
          >
            <Input size="large" className="bg-[#F5F6FA]" placeholder="Phone Number" />
          </Form.Item>
          <Form.Item name="provider_url" label="Provider URL" className="md:col-span-2">
            <Input size="large" className="bg-[#F5F6FA]" placeholder="URL" />
          </Form.Item>
        </div>
        <div className="flex justify-between mt-6">
          <Button
            size="large"
            className="bg-white border border-primary text-primary hover:bg-primary hover:text-white px-8 py-2"
            onClick={prevStep}
          >
            Previous
          </Button>
          <Button type="primary" htmlType="submit" size="large" className="bg-primary hover:bg-primary px-8 py-2">
            Next
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default AboutProvider;
