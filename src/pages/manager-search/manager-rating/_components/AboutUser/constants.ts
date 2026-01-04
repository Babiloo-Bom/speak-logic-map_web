import { Rule } from "antd/es/form";

export type FormFieldType = "input" | "email" | "phone" | "textarea";

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  rules?: Rule[];
  colSpan?: number; // dùng cho responsive grid
}

export const USER_FORM_FIELDS: FormField[] = [
  {
    name: "username",
    label: "User Name",
    type: "input",
    placeholder: "Enter username",
    rules: [{ required: true, message: "User name is required" }],
    colSpan: 1,
  },
  {
    name: "fullName",
    label: "Full Name",
    type: "input",
    placeholder: "Enter full name",
    rules: [{ required: true, message: "Full name is required" }],
    colSpan: 1,
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "Enter email",
    rules: [
      { required: true, message: "Email is required" },
      { type: "email", message: "Invalid email format" },
    ],
    colSpan: 1,
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "phone",
    placeholder: "Enter phone number",
    rules: [{ required: true, message: "Phone number is required" }],
    colSpan: 1,
  },
  {
    name: "address",
    label: "Address (Optional)",
    type: "textarea",
    placeholder: "Enter address",
    colSpan: 2,
  },
];
