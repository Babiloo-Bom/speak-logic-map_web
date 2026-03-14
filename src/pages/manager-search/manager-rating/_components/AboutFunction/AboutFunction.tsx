import { Form, Input, Button, Radio, DatePicker } from "antd";
import React, { useEffect } from "react";
import { IDataRequestRating } from "@/lib/pages/manager-search/manager-rating/type";
import { FormField } from "@/utils/constants";
import { FUNCTION_FORM_FIELDS } from "@/lib/pages/manager-search/manager-rating/_components/AboutFunction/constants";

type ManagerData = {
  name?: string;
  function?: string;
  functions?: Array<{ id?: number; name: string }>;
};

type Props = {
  dataRequestRating: IDataRequestRating;
  setDataRequestRating: React.Dispatch<React.SetStateAction<IDataRequestRating>>;
  nextStep: () => void;
  prevStep: () => void;
  managerData?: ManagerData | null;
};

const AboutFunction = (props: Props) => {
  const { dataRequestRating, setDataRequestRating, nextStep, prevStep, managerData } = props;
  const [form] = Form.useForm();
  const usedFunctionValue = Form.useWatch("used_function_from_manager", form);

  const defaultFunctionName =
    dataRequestRating.function_name ||
    managerData?.function ||
    (managerData?.functions && managerData.functions[0]?.name) ||
    "";
  const defaultFunctionManager = dataRequestRating.function_manager || managerData?.name || "";

  useEffect(() => {
    form.setFieldsValue({
      function_name: defaultFunctionName,
      function_manager: defaultFunctionManager,
      used_function_from_manager: dataRequestRating.used_function_from_manager ?? false,
      function_execution_date: dataRequestRating.function_execution_date || undefined,
      problem_solver_manager_name: dataRequestRating.problem_solver_manager_name || "",
      problem_to_be_solved: dataRequestRating.problem_to_be_solved || "",
      manager_helped_identify_problem: dataRequestRating.manager_helped_identify_problem,
      function_solved_problem: dataRequestRating.function_solved_problem,
      problem_existed_before_function: dataRequestRating.problem_existed_before_function,
      problem_existed_after_function: dataRequestRating.problem_existed_after_function,
      function_provided_solved_problem: dataRequestRating.function_provided_solved_problem,
    });
  }, [dataRequestRating, managerData, defaultFunctionName, defaultFunctionManager, form]);

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
