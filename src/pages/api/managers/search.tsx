import type { NextApiRequest, NextApiResponse } from "next";
import { requireAuth } from "@/lib/auth";
import { searchManagers } from "@/lib/managers";
import type { ManagerSearchParams } from "@/types/manager";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      // BROWSE Section - Text search
      q,
      managers,
      problems,
      functions,
      expertise,
      descriptions,
      
      // Operations Section
      operation,
      
      // Ratings Section
      rating,
      rating_min,
      rating_max,
      
      // The Given Set Section
      given_set,
      
      // Location By Section
      near_city,
      city_id,
      lat,
      lng,
      radius,
      
      // Alphabet Filter
      starts_with,
      
      // Pagination & Sorting
      page,
      limit,
      sort_by,
      sort_order,
      
      // Other
      status,
      include_functions,
      include_problems,
    } = req.query;

    const params: ManagerSearchParams = {
      // Text search
      q: typeof q === "string" ? q : undefined,
      managers: typeof managers === "string" ? managers : undefined,
      problems: typeof problems === "string" ? problems : undefined,
      functions: typeof functions === "string" ? functions : undefined,
      expertise: typeof expertise === "string" ? expertise : undefined,
      descriptions: typeof descriptions === "string" ? descriptions : undefined,
      
      // Operation
      operation: typeof operation === "string" && ['exact', 'and', 'or'].includes(operation)
        ? operation as 'exact' | 'and' | 'or'
        : undefined,
      
      // Rating
      rating: typeof rating === "string" && ['5', '4', '3', 'below2'].includes(rating)
        ? rating as '5' | '4' | '3' | 'below2'
        : undefined,
      rating_min: typeof rating_min === "string" ? parseFloat(rating_min) : undefined,
      rating_max: typeof rating_max === "string" ? parseFloat(rating_max) : undefined,
      
      // Given Set
      given_set: typeof given_set === "string" 
        ? given_set === 'true' || given_set === '1'
        : undefined,
      
      // Location
      near_city: typeof near_city === "string" ? near_city : undefined,
      city_id: typeof city_id === "string" ? parseInt(city_id, 10) : undefined,
      lat: typeof lat === "string" ? parseFloat(lat) : undefined,
      lng: typeof lng === "string" ? parseFloat(lng) : undefined,
      radius: typeof radius === "string" ? parseFloat(radius) : undefined,
      
      // Alphabet
      starts_with: typeof starts_with === "string" ? starts_with : undefined,
      
      // Pagination
      page: typeof page === "string" ? parseInt(page, 10) || 1 : 1,
      limit: typeof limit === "string" ? parseInt(limit, 10) || 20 : 20,
      
      // Sorting (UI: functions, problems, providers, description, all)
      sort_by: (() => {
        const v = Array.isArray(sort_by) ? sort_by[0] : sort_by;
        return typeof v === "string" && ['name', 'rating', 'created_at', 'distance', 'functions', 'problems', 'providers', 'description', 'all'].includes(v)
          ? v as 'name' | 'rating' | 'created_at' | 'distance' | 'functions' | 'problems' | 'providers' | 'description' | 'all'
          : "all";
      })(),
      sort_order: (() => {
        const v = Array.isArray(sort_order) ? sort_order[0] : sort_order;
        return typeof v === "string" && ['asc', 'desc'].includes(v) ? v as 'asc' | 'desc' : "desc";
      })(),
      
      // Status
      status: typeof status === "string" ? status : undefined,
      
      // Include related data
      include_functions: typeof include_functions === "string"
        ? include_functions === 'true' || include_functions === '1'
        : undefined,
      include_problems: typeof include_problems === "string"
        ? include_problems === 'true' || include_problems === '1'
        : undefined,
    };

    const result = await searchManagers(params);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error searching managers:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Cho phép tất cả user đã đăng nhập tìm kiếm managers (không giới hạn admin)
export default requireAuth()(handler);
