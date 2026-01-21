import { FormField } from "@/utils/constants";

export const USER_FORM_FIELDS: FormField[] = [
  {
    name: "reviewer_name",
    label: "User Name",
    type: "input",
    placeholder: "Enter User Name",
    rules: [{ required: true, message: "User name is required" }],
    colSpan: 1,
  },
  {
    name: "reviewer_full_name",
    label: "Full Name",
    type: "input",
    placeholder: "Enter Full Name",
    rules: [{ required: true, message: "Full name is required" }],
    colSpan: 1,
  },
  {
    name: "reviewer_email",
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
    name: "reviewer_phone",
    label: "Phone Number",
    type: "phone",
    placeholder: "Enter Phone Number",
    rules: [{ required: true, message: "Phone number is required" }],
    colSpan: 1,
  },
  {
    name: "reviewer_address",
    label: "Address (Optional)",
    type: "textarea",
    placeholder: "Enter Address",
    colSpan: 2,
  },
];
