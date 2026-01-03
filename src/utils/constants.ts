export const getAuthToken = () => {
  return localStorage.getItem("accessToken");
};

// Convert dataRequest object to query string params
export const buildQueryParams = (params: any): string => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    // Only add non-empty values to query string
    if (value !== "" && value !== null && value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  return queryParams.toString();
};
