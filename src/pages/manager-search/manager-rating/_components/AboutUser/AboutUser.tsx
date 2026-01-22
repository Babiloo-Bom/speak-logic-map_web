import { Form, Input, Button, Radio, DatePicker } from "antd";
import React from "react";
import { USER_FORM_FIELDS } from "@/lib/pages/manager-search/manager-rating/_components/AboutUser/constants";
import { IDataRequestRating } from "@/lib/pages/manager-search/manager-rating/type";
import { FormField } from "@/utils/constants";

type Props = {
  dataRequestRating: IDataRequestRating;
  setDataRequestRating: React.Dispatch<React.SetStateAction<IDataRequestRating>>;
  nextStep: () => void;
};

const AboutUser = (props: Props) => {
  const { dataRequestRating, setDataRequestRating, nextStep } = props;
  const [form] = Form.useForm();

  const onSubmit = (data: IDataRequestRating) => {
    const newDataRequest = {
      ...dataRequestRating,
      ...data,
    };
    setDataRequestRating(newDataRequest);
    return nextStep();
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
        return <DatePicker className="w-full" placeholder={config.placeholder} />;
      default:
        return <Input size="large" className="bg-[#F5F6FA]" placeholder={config.placeholder} />;
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <div className="bg-white border border-solid border-gray-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {USER_FORM_FIELDS.map((field) => (
            <Form.Item key={field.name} name={field.name} label={field.label} rules={field.rules} className={field.colSpan === 2 ? "md:col-span-2" : ""}>
              {renderInput(field)}
            </Form.Item>
          ))}
        </div>
        <div className="flex justify-end mt-6 w-full">
          <Button type="primary" htmlType="submit" size="large" className="bg-primary hover:bg-primary px-6 py-2">
            Next
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default AboutUser;
