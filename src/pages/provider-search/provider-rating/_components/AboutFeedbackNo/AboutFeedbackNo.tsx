import { Form, Button, Radio, Rate } from "antd";
import React, { useEffect } from "react";
import { IProviderRatingRequest } from "@/lib/pages/provider-search/provider-rating/type";

type Props = {
  dataRequestRating: IProviderRatingRequest;
  setDataRequestRating: React.Dispatch<React.SetStateAction<IProviderRatingRequest>>;
  handleSubmit: (payload: IProviderRatingRequest) => void;
  prevStep: () => void;
  loading?: boolean;
};

const AboutFeedbackNo = (props: Props) => {
  const { dataRequestRating, setDataRequestRating, handleSubmit, prevStep, loading = false } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      provided_feedback_after_function: dataRequestRating.provided_feedback_after_function,
      provider_applied_feedback: dataRequestRating.provider_applied_feedback,
      rating: dataRequestRating.rating || 0,
    });
  }, [dataRequestRating, form]);

  const onSubmit = (values: Record<string, unknown>) => {
    const next: IProviderRatingRequest = {
      ...dataRequestRating,
      provided_feedback_after_function: Boolean(values.provided_feedback_after_function),
      provider_applied_feedback: Boolean(values.provider_applied_feedback),
      rating: Number(values.rating) || 0,
    };
    setDataRequestRating(next);
    handleSubmit(next);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <div className="bg-white border border-solid border-gray-300 rounded-lg p-6">
        <div className="grid grid-cols-1 gap-6 max-w-2xl">
          <Form.Item
            name="provided_feedback_after_function"
            label="If no, did you provide feedback to the provider after function executed to help the function executed properly to solve the problem?"
            rules={[{ required: true, message: "Please select Yes or No" }]}
          >
            <Radio.Group>
              <Radio value={true}>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="provider_applied_feedback"
            label="Did the provider apply the feedback to help solve the problem?"
            rules={[{ required: true, message: "Please select Yes or No" }]}
          >
            <Radio.Group>
              <Radio value={true}>Yes</Radio>
              <Radio value={false}>No</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="rating"
            label="Rating By"
            rules={[{ required: true, message: "Please select a rating" }]}
          >
            <Rate
              allowHalf
              value={form.getFieldValue("rating")}
              onChange={(v) => form.setFieldsValue({ rating: v })}
              className="text-2xl"
            />
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

export default AboutFeedbackNo;
