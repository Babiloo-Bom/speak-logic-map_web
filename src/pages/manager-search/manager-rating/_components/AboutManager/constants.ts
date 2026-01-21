import { FormField } from "@/utils/constants";

export const MANAGER_FORM_FIELDS: FormField[] = [
  {
    name: "manager_name",
    label: "Manager Name",
    type: "input",
    placeholder: "Enter Manager Name",
    rules: [{ required: true, message: "Manager name is required" }],
    colSpan: 1,
  },
  {
    name: "manager_user_name",
    label: "User Name",
    type: "input",
    placeholder: "Enter User Name",
    rules: [{ required: true, message: "User name is required" }],
    colSpan: 1,
  },
  {
    name: "manager_location",
    label: "Manager Location",
    type: "input",
    placeholder: "Enter Manager Location",
    rules: [{ required: true, message: "Manager location is required" }],
    colSpan: 1,
  },
  {
    name: "job_location",
    label: "Job Location",
    type: "input",
    placeholder: "Enter Job Location",
    rules: [{ required: true, message: "Job location is required" }],
    colSpan: 1,
  },
  {
    name: "manager_url",
    label: "Manager URL",
    type: "input",
    placeholder: "Enter Manager URL",
    colSpan: 1,
  },
];
