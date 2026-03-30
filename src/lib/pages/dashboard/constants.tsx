import { FilterSection } from "@/utils/constants";

export const itemsTabs = [
  {
    field: "provider",
    label: "Providers",
  },
  {
    field: "manager",
    label: "Managers",
  },
  {
    field: "new",
    label: "News",
  },
];

/** Nút lọc dưới hero — khớp provider-search `sortBy` / sort_by */
export const DASHBOARD_HEADER_TABS = [
  { field: "provider", label: "Providers", href: "/provider-search" },
  { field: "functions", label: "Functions", href: "/provider-search" },
  { field: "description", label: "Descriptions", href: "/provider-search" },
  { field: "problems", label: "Problems", href: "/provider-search" },
  { field: "all", label: "All", href: "/provider-search" },
];

/**
 * Nút lọc dưới khi tab Managers — khớp manager-search `sort_by`
 * (Managers → name, Expertise → expertise, …)
 */
export const DASHBOARD_MANAGER_FILTER_TABS = [
  { field: "name", label: "Managers", href: "/manager-search" },
  { field: "expertise", label: "Expertise", href: "/manager-search" },
  { field: "functions", label: "Functions", href: "/manager-search" },
  { field: "problems", label: "Problems", href: "/manager-search" },
  { field: "description", label: "Descriptions", href: "/manager-search" },
  { field: "all", label: "All", href: "/manager-search" },
];

export const ADVANCE_SEARCH_FILTERS: FilterSection[] = [
  {
    key: "browse",
    title: "BROWSE",
    type: "checkbox",
    options: [
      { label: "Managers", value: "managers", count: 94 },
      { label: "Problems", value: "problems", count: 1820 },
      { label: "Functions", value: "functions", count: 673 },
      { label: "Expertise", value: "expertise", count: 94 },
      { label: "Descriptions", value: "descriptions", count: 155 },
    ],
  },
  {
    key: "operation",
    title: "Operations",
    type: "radio",
    options: [
      { label: "Exact Phrase", value: "exact" },
      { label: "AND", value: "and" },
      { label: "OR", value: "or" },
    ],
  },
  {
    key: "rating",
    title: "Ratings",
    type: "radio",
    options: [
      { label: "5 Star", value: 5 },
      { label: "4 Star", value: 4 },
      { label: "3 Star", value: 3 },
      { label: "Below 2 Star", value: 2 },
    ],
  },
  {
    key: "given_set",
    title: "The Given Set",
    type: "radio",
    options: [{ label: "Manager using the Given Set", value: "using_given_set" }],
  },
  {
    key: "near_city",
    title: "Location By",
    type: "radio",
    options: [{ label: "Near by City", value: "near_city" }],
  },
];
