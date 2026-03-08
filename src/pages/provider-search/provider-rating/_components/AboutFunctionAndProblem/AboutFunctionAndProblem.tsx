import { Form, Input, Button, Radio } from "antd";
import React, { useEffect } from "react";
import { IProviderRatingRequest } from "@/lib/pages/provider-search/provider-rating/type";

type ProviderDataShape = {
  functions?: { name: string }[];
  problems?: { name: string }[];
} | null;

type Props = {
  dataRequestRating: IProviderRatingRequest;
  setDataRequestRating: React.Dispatch<React.SetStateAction<IProviderRatingRequest>>;
  nextStep: () => void;
  prevStep: () => void;
  providerData?: ProviderDataShape;
};

const AboutFunctionAndProblem = (props: Props) => {
  const { dataRequestRating, setDataRequestRating, nextStep, prevStep, providerData } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    const functionName =
      dataRequestRating.function_name ||
      (providerData?.functions?.length ? providerData.functions[0].name : "");
    const problemSolved =
      dataRequestRating.problem_solved ||
      (providerData?.problems?.length ? providerData.problems[0].name : "");
    form.setFieldsValue({
      function_name: functionName,
      problem_solved: problemSolved,
      used_function_from_provider: dataRequestRating.used_function_from_provider,
    });
  }, [dataRequestRating, providerData, form]);

  const onSubmit = (values: Partial<IProviderRatingRequest>) => {
    const next = { ...dataRequestRating, ...values };
    setDataRequestRating(next);
    nextStep();
  };

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <div className="bg-white border border-solid border-gray-300 rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6">
          <Form.Item name="function_name" label="Function Name">
            <Input size="large" className="bg-[#F5F6FA]" placeholder="Name" />
          </Form.Item>
          <Form.Item name="problem_solved" label="Problem Solved">
            <Input size="large" className="bg-[#F5F6FA]" placeholder="Problem Solved" />
          </Form.Item>
          <Form.Item
            name="used_function_from_provider"
            label="Did you use the function from the Provider?"
            rules={[{ required: true, message: "Please select Yes or No" }]}
          >
            <Radio.Group>
              <Radio value={true}>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
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

export default AboutFunctionAndProblem;
