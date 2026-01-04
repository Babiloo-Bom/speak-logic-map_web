export const getAuthToken = () => {
  return localStorage.getItem("accessToken");
};

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
