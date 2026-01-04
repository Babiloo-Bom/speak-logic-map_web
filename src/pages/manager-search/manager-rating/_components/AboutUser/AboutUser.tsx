import { Form, Input } from "antd";
import React from "react";
import { USER_FORM_FIELDS } from "./constants";
import { Controller, useForm } from "react-hook-form";

type Props = {};

const AboutUser = (props: Props) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    console.log("Form Data:", data);
  };

  const renderInput = (field: any) => {
    switch (field.type) {
      case "textarea":
        return <Input.TextArea rows={4} />;
      default:
        return <Input />;
    }
  };
  return (
    <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {USER_FORM_FIELDS.map((field) => (
          <div key={field.name} className={field.colSpan === 2 ? "md:col-span-2" : ""}>
            <Form.Item label={field.label} validateStatus={errors[field.name] ? "error" : ""} help={errors[field.name]?.message as string}>
              <Controller
                name={field.name}
                control={control}
                // rules={field.rules}
                render={({ field: controllerField }) => (
                  <div className="border border-dashed border-blue-400 rounded-lg p-1">
                    {renderInput({
                      ...field,
                      ...controllerField,
                    })}
                  </div>
                )}
              />
            </Form.Item>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
          Submit
        </button>
      </div>
    </Form>
  );
};

export default AboutUser;
