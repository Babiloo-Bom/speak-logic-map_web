import { Form, Input, Button, Radio, DatePicker, Rate } from "antd";
import React, { useEffect } from "react";
import dayjs from "dayjs";
import { IProviderRatingRequest } from "@/lib/pages/provider-search/provider-rating/type";

type Props = {
  dataRequestRating: IProviderRatingRequest;
  setDataRequestRating: React.Dispatch<React.SetStateAction<IProviderRatingRequest>>;
  handleSubmit: (payload: IProviderRatingRequest) => void;
  prevStep: () => void;
  loading?: boolean;
};

const AboutFeedbackYes = (props: Props) => {
  const { dataRequestRating, setDataRequestRating, handleSubmit, prevStep, loading = false } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      function_execution_date: dataRequestRating.function_execution_date
        ? dayjs(dataRequestRating.function_execution_date)
        : undefined,
      problem_to_be_solved: dataRequestRating.problem_to_be_solved,
      problem_existed_before_function: dataRequestRating.problem_existed_before_function,
      function_provided_solved_problem: dataRequestRating.function_provided_solved_problem,
      person_from_provider: dataRequestRating.person_from_provider,
      function_solved_problem: dataRequestRating.function_solved_problem,
      problem_existed_after_function: dataRequestRating.problem_existed_after_function,
      rating: dataRequestRating.rating || 0,
    });
  }, [dataRequestRating, form]);

  const onSubmit = (values: Record<string, unknown>) => {
    const dateVal = values.function_execution_date as dayjs.Dayjs | undefined;
    const next: IProviderRatingRequest = {
      ...dataRequestRating,
      function_execution_date: dateVal ? dateVal.format("YYYY-MM-DD") : "",
      problem_to_be_solved: (values.problem_to_be_solved as string) ?? "",
      problem_existed_before_function: Boolean(values.problem_existed_before_function),
      function_provided_solved_problem: Boolean(values.function_provided_solved_problem),
      person_from_provider: (values.person_from_provider as string) ?? "",
      function_solved_problem: Boolean(values.function_solved_problem),
      problem_existed_after_function: Boolean(values.problem_existed_after_function),
      rating: Number(values.rating) || 0,
    };
    setDataRequestRating(next);
    handleSubmit(next);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <div className="bg-white border border-solid border-gray-300 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Form.Item name="function_execution_date" label="Function Execution Date">
            <DatePicker size="large" className="w-full" placeholder="dd----yyyy" format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="person_from_provider" label="Person from provider who helped you to solve the problem">
            <Input size="large" className="bg-[#F5F6FA]" placeholder="Person from Provider" />
          </Form.Item>
          <Form.Item
            name="problem_to_be_solved"
            label="Problem to be solved by the function executed by the provider"
            className="md:col-span-2"
          >
            <Input size="large" className="bg-[#F5F6FA]" placeholder="Problem to be solved" />
          </Form.Item>
          <Form.Item name="function_solved_problem" label="Did the function solve the problem?">
            <Radio.Group>
              <Radio value={true}>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="problem_existed_before_function"
            label="Did the problem exist before the function executed by the provider?"
          >
            <Radio.Group>
              <Radio value={true}>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="problem_existed_after_function"
            label="Did the problem exist after the function executed by the provider?"
          >
            <Radio.Group>
              <Radio value={true}>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="function_provided_solved_problem"
            label="Is the function provided by the provider solved the problem?"
          >
            <Radio.Group>
              <Radio value={true}>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="rating"
            label="Rating"
            rules={[{ required: true, message: "Please select a rating" }]}
            className="md:col-span-2"
          >
            <Rate allowHalf value={form.getFieldValue("rating")} onChange={(v) => form.setFieldsValue({ rating: v })} />
          </Form.Item>
        </div>
        <div className="flex justify-between mt-6">
          <Button
            size="large"
            type="button"
            className="bg-white border border-primary text-primary hover:bg-primary hover:text-white px-8 py-2"
            onClick={prevStep}
            disabled={loading}
          >
            Previous
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="bg-primary hover:bg-primary px-8 py-2"
            loading={loading}
          >
            Submit
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default AboutFeedbackYes;
