import { Form, Input, Button, Radio, DatePicker } from "antd";
import React, { useEffect } from "react";
import { IDataRequestRating } from "@/lib/pages/manager-search/manager-rating/type";
import { FormField } from "@/utils/constants";
import { FEEDBACK_FORM_FIELDS } from "@/lib/pages/manager-search/manager-rating/_components/AboutFeedback/constants";

type Props = {
  dataRequestRating: IDataRequestRating;
  setDataRequestRating: React.Dispatch<React.SetStateAction<IDataRequestRating>>;
  handleSubmit: () => void;
  prevStep: () => void;
};

const AboutFeedback = (props: Props) => {
  const { dataRequestRating, setDataRequestRating, handleSubmit, prevStep } = props;
  const [form] = Form.useForm();

  const onSubmit = (data: IDataRequestRating) => {
    const newDataRequest = {
      ...dataRequestRating,
      ...data,
    };
    setDataRequestRating(newDataRequest);
    return handleSubmit();
  };

  const renderInput = (config: FormField) => {
    switch (config.type) {
      case "textarea":
        return <Input.TextArea rows={4} className="bg-[#F5F6FA]" placeholder={config.placeholder} />;
      case "radio":
        return (
          <Radio.Group>
            <Radio value={true}>Yes</Radio>
            <Radio value={false}>No</Radio>
          </Radio.Group>
        );
      case "date":
        return <DatePicker size="large" className="w-full" placeholder={config.placeholder} />;
      default:
        return <Input size="large" className="bg-[#F5F6FA]" placeholder={config.placeholder} />;
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit} labelCol={{ style: { minHeight: "auto" } }} wrapperCol={{ style: { minHeight: "auto" } }}>
      <div className="bg-white border border-solid border-gray-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEEDBACK_FORM_FIELDS.map((field) => (
            <Form.Item
              key={field.name}
              name={field.name}
              label={field.label}
              rules={field.rules}
              className={field.colSpan === 2 ? "md:col-span-2 text-start" : "text-start"}
            >
              {renderInput(field)}
            </Form.Item>
          ))}
        </div>
        <div className="flex justify-between mt-6 w-full">
          <div>
            <Button
              // type="primary"
              htmlType="submit"
              size="large"
              className="bg-white border border-primary border-solid px-6 py-2 text-primary"
              onClick={prevStep}
            >
              Previous
            </Button>
          </div>
          <div>
            <Button type="primary" htmlType="submit" size="large" className="bg-primary hover:bg-primary px-6 py-2">
              Submit
            </Button>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default AboutFeedback;
