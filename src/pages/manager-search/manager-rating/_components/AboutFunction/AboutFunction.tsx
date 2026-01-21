import { Form, Input, Button, Radio, DatePicker } from "antd";
import React, { useEffect } from "react";
import { IDataRequestRating } from "../../type";
import { FormField } from "@/utils/constants";
import { FUNCTION_FORM_FIELDS } from "./constants";

type Props = {
  dataRequestRating: IDataRequestRating;
  setDataRequestRating: React.Dispatch<React.SetStateAction<IDataRequestRating>>;
  nextStep: () => void;
  prevStep: () => void;
};

const AboutFunction = (props: Props) => {
  const { dataRequestRating, setDataRequestRating, nextStep, prevStep } = props;
  const [form] = Form.useForm();
  const usedFunctionValue = Form.useWatch("used_function_from_manager", form);

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
        return <DatePicker size="large" className="w-full" placeholder={config.placeholder} />;
      default:
        return <Input size="large" className="bg-[#F5F6FA]" placeholder={config.placeholder} />;
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <div className="bg-white border border-solid border-gray-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FUNCTION_FORM_FIELDS.filter((obj) => {
            if (!obj?.validatoCustom?.isCheckView) return true;
            return usedFunctionValue === true;
          }).map((field) => (
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
              Next
            </Button>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default AboutFunction;
