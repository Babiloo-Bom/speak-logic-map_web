import { FormField } from "@/utils/constants";

export const FUNCTION_FORM_FIELDS: FormField[] = [
  {
    name: "function_name",
    label: "Function Name",
    type: "input",
    placeholder: "Enter Function Name",
    rules: [{ required: true, message: "Function name is required" }],
    colSpan: 1,
  },
  {
    name: "function_manager",
    label: "Function Manager",
    type: "input",
    placeholder: "Enter Function Manager",
    rules: [{ required: true, message: "Function manager is required" }],
    colSpan: 1,
  },
  {
    name: "used_function_from_manager",
    label: "Did you use the function from the Manager?",
    type: "radio",
    placeholder: "Enter Used Function From Manager",
    rules: [{ required: false, message: "Used function from manager is required" }],
    colSpan: 2,
  },
  {
    name: "function_execution_date",
    label: "Function Execution Date ",
    type: "date",
    placeholder: "dd/mm/yyyy",
    rules: [{ required: false, message: "Used function from manager is required" }],
    colSpan: 1,
    validatoCustom: {
      isCheckView: true,
    },
  },
  {
    name: "problem_solver_manager_name",
    label: "Manager name who helped you solve the problem?",
    type: "input",
    placeholder: "Enter Manager Name",
    rules: [{ required: false, message: "Used function from manager is required" }],
    colSpan: 1,
    validatoCustom: {
      isCheckView: true,
    },
  },
  {
    name: "problem_to_be_solved",
    label: "Problem to be solved by the function executed by the Manager?",
    type: "input",
    placeholder: "Problem to be solved",
    rules: [{ required: false, message: "Used function from manager is required" }],
    colSpan: 1,
    validatoCustom: {
      isCheckView: true,
    },
  },
  {
    name: "manager_helped_identify_problem",
    label: "Did the manager help you identify the problem properly?",
    type: "radio",
    placeholder: "",
    rules: [{ required: false, message: "Used function from manager is required" }],
    colSpan: 1,
    validatoCustom: {
      isCheckView: true,
    },
  },
  {
    name: "function_solved_problem",
    label: "Did the function solve the problem?",
    type: "radio",
    placeholder: "",
    rules: [{ required: false, message: "Used function from manager is required" }],
    colSpan: 1,
    validatoCustom: {
      isCheckView: true,
    },
  },
  {
    name: "problem_existed_before_function",
    label: "Did the problem exist before the function executed by the Manager?",
    type: "radio",
    placeholder: "",
    rules: [{ required: false, message: "Used function from manager is required" }],
    colSpan: 1,
    validatoCustom: {
      isCheckView: true,
    },
  },
  {
    name: "problem_existed_after_function",
    label: "Did the problem exist after the function executed by the Manager?",
    type: "radio",
    placeholder: "",
    rules: [{ required: false, message: "Used function from manager is required" }],
    colSpan: 1,
    validatoCustom: {
      isCheckView: true,
    },
  },
  {
    name: "function_provided_solved_problem",
    label: "Is the function provided by the Manager solved the problem?",
    type: "radio",
    placeholder: "",
    rules: [{ required: false, message: "Used function from manager is required" }],
    colSpan: 1,
    validatoCustom: {
      isCheckView: true,
    },
  },
];
