import { FilterSection } from "./types";

export const ADVANCE_SEARCH_FILTERS: FilterSection[] = [
  {
    key: "browse",
    title: "BROWSE",
    type: "checkbox",
    options: [
      { label: "Providers", value: "providers", count: 94 },
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
    options: [{ label: "Provider using the Given Set", value: "using_given_set" }],
  },
  {
    key: "location",
    title: "Location By",
    type: "radio",
    options: [{ label: "Near by City", value: "near_city" }],
  },
];
