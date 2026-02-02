import { Form, Input, Button, Rate, message } from "antd";
import React from "react";
import { IProviderRatingRequest } from "@/lib/pages/provider-search/provider-rating/type";

type Props = {
  dataRequestRating: IProviderRatingRequest;
  setDataRequestRating: React.Dispatch<React.SetStateAction<IProviderRatingRequest>>;
  handleSubmit: () => void;
  prevStep: () => void;
  loading?: boolean;
};

const RatingForm = (props: Props) => {
  const { dataRequestRating, setDataRequestRating, handleSubmit, prevStep, loading = false } = props;
  const [form] = Form.useForm();

  const onSubmit = (data: IProviderRatingRequest) => {
    // Validate rating
    if (!data.rating || data.rating < 1 || data.rating > 5) {
      message.error("Please select a rating between 1 and 5 stars");
      return;
    }

    const newDataRequest = {
      ...dataRequestRating,
      ...data,
    };
    setDataRequestRating(newDataRequest);
    handleSubmit();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={{
        rating: dataRequestRating.rating || 0,
        comment: dataRequestRating.comment || "",
      }}
    >
      <div className="bg-white border border-solid border-gray-300 rounded-lg p-6">
        <div className="max-w-2xl mx-auto">
          {/* Rating Section */}
          <div className="mb-8">
            <Form.Item
              name="rating"
              label={<span className="text-xl font-semibold">Your Rating</span>}
              rules={[
                { required: true, message: "Please select a rating" },
                {
                  validator: (_, value) => {
                    if (value && value >= 1 && value <= 5) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Rating must be between 1 and 5"));
                  },
                },
              ]}
              className="text-center"
            >
              <div className="flex flex-col items-center">
                <Rate
                  allowHalf
                  value={form.getFieldValue("rating")}
                  onChange={(value) => form.setFieldsValue({ rating: value })}
                  className="text-4xl mb-4"
                />
                <p className="text-gray-500 text-sm mt-2">
                  {form.getFieldValue("rating")
                    ? `${form.getFieldValue("rating")} out of 5 stars`
                    : "Click to rate"}
                </p>
              </div>
            </Form.Item>
          </div>

          {/* Comment Section */}
          <div className="mb-6">
            <Form.Item
              name="comment"
              label={<span className="text-lg font-medium">Your Review (Optional)</span>}
              rules={[
                {
                  max: 1000,
                  message: "Comment must not exceed 1000 characters",
                },
              ]}
            >
              <Input.TextArea
                rows={6}
                className="bg-[#F5F6FA]"
                placeholder="Share your experience with this provider. What did you like? What could be improved?"
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              size="large"
              className="bg-white border border-primary border-solid px-8 py-2 text-primary hover:bg-primary hover:text-white"
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
              Submit Rating
            </Button>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default RatingForm;

