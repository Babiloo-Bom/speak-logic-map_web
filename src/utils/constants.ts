import { Rule } from "antd/es/form";

export const getAuthToken = () => {
  return localStorage.getItem("accessToken");
};

export type FormFieldType = "input" | "email" | "phone" | "textarea" | "radio" | "date";

export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  rules?: Rule[];
  colSpan?: number; // dùng cho responsive grid
  validatoCustom?: any;
}

// Convert dataRequest object to query string params
export const buildQueryParams = (filters: Record<string, any>) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (!value) return;

    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });

  return params.toString();
};

export type FilterType = "checkbox" | "radio";

export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
}

export interface FilterSection {
  key: string;
  title: string;
  type: FilterType;
  options: FilterOption[];
}
