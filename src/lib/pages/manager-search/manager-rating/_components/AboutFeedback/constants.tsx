import { FormField } from "@/utils/constants";

export const FEEDBACK_FORM_FIELDS: FormField[] = [
  {
    name: "provided_feedback_after_function",
    label: "If no, did you provide feedback to the Manager after function executed to help the function executed properly to solve the problem?",
    type: "radio",
    placeholder: "",
    rules: [{ required: false, message: "Used function from manager is required" }],
    colSpan: 1,
    validatoCustom: {
      isCheckView: true,
    },
  },
  {
    name: "manager_applied_feedback",
    label: "Did the Manager apply the feedback to help solve the problem?",
    type: "radio",
    placeholder: "",
    rules: [{ required: false, message: "Used function from manager is required" }],
    colSpan: 1,
    validatoCustom: {
      isCheckView: true,
    },
  },
];
