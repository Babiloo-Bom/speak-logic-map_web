import { Form, Input, Button } from "antd";
import React, { useEffect } from "react";
import { IProviderRatingRequest, InitialUserData } from "@/lib/pages/provider-search/provider-rating/type";

type Props = {
  dataRequestRating: IProviderRatingRequest;
  setDataRequestRating: React.Dispatch<React.SetStateAction<IProviderRatingRequest>>;
  nextStep: () => void;
  onCancel: () => void;
  initialUserData?: InitialUserData | null;
};

const AboutUser = (props: Props) => {
  const { dataRequestRating, setDataRequestRating, nextStep, onCancel, initialUserData } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      user_name: dataRequestRating.user_name || initialUserData?.user_name || "",
      full_name: dataRequestRating.full_name || initialUserData?.full_name || "",
      email_address: dataRequestRating.email_address || initialUserData?.email_address || "",
      phone_number: dataRequestRating.phone_number || initialUserData?.phone_number || "",
      address_optional: dataRequestRating.address_optional || initialUserData?.address_optional || "",
    });
  }, [dataRequestRating, initialUserData, form]);

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
            name="user_name"
            label="User Name"
            rules={[{ required: true, message: "User name is required" }]}
          >
            <Input size="large" className="bg-[#F5F6FA]" placeholder="Name" />
          </Form.Item>
          <Form.Item
            name="full_name"
            label="Full Name"
            rules={[{ required: true, message: "Full name is required" }]}
          >
            <Input size="large" className="bg-[#F5F6FA]" placeholder="Full Name" />
          </Form.Item>
          <Form.Item
            name="email_address"
            label="Email Address"
            rules={[
              { required: true, message: "Email is required" },
              { type: "email", message: "Invalid email format" },
            ]}
          >
            <Input size="large" className="bg-[#F5F6FA]" placeholder="Email Address" />
          </Form.Item>
          <Form.Item
            name="phone_number"
            label="Phone Number"
            rules={[{ required: true, message: "Phone number is required" }]}
          >
            <Input size="large" className="bg-[#F5F6FA]" placeholder="Phone Number" />
          </Form.Item>
          <Form.Item name="address_optional" label="Address (Optional)" className="md:col-span-2">
            <Input size="large" className="bg-[#F5F6FA]" placeholder="Address (Optional)" />
          </Form.Item>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button size="large" className="text-primary border-primary" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" size="large" className="bg-primary hover:bg-primary px-8 py-2">
            Next
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default AboutUser;
