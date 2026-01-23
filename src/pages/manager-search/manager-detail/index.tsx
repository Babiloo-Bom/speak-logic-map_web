/* eslint-disable react-hooks/exhaustive-deps */
import { getAuthToken } from "@/utils/constants";
import { Card, Avatar, Rate, Divider, theme, message } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IManagerDetailWithRating } from "./type";

export default function ManagerDetail() {
  const router = useRouter();
  const { managerId } = router.query;

  const [managerData, setManagerData] = useState<IManagerDetailWithRating | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchManagerDetail = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        message.error("No authentication token found");
        return null;
      }

      const url = `/api/managers/${managerId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Failed to fetch managers");
        return null;
      }
    } catch (error) {
      message.error(String(error));
      return null;
    }
  };

  const fetchManagerDetailRating = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        message.error("No authentication token found");
        return null;
      }

      const url = `/api/managers/${managerId}/rating?my_rating=true`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Failed to fetch managers");
        return null;
      }
    } catch (error) {
      message.error(String(error));
      return null;
    }
  };

  useEffect(() => {
    if (managerId) {
      const fetchAllData = async () => {
        setIsLoading(true);
        try {
          // Fetch both API calls in parallel
          const [detailData, ratingData] = await Promise.all([fetchManagerDetail(), fetchManagerDetailRating()]);

          // Merge data from both API calls
          if (detailData) {
            setManagerData({ ...detailData, ...ratingData });
          }
        } finally {
          setIsLoading(false);
        }
      };

      fetchAllData();
    }
  }, [managerId]);

  console.log("Manager Data:", managerData);
  return (
    <div className="w-full bg-white min-h-screen">
      {/* Banner */}
      <div className="px-6 md:px-12 pt-8">
        <div
          className="h-[220px] md:h-[240px] bg-cover bg-center rounded-2xl"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d')",
          }}
        >
          <h1 className="text-white text-4xl md:text-4xl font-semibold flex items-center justify-center h-full">Manager Rating</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 mt-8 pb-12">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading manager details...</p>
          </div>
        ) : (
          <>
            {/* Avatar */}
            <div className="flex flex-col items-center">
              <Avatar size={200} src={managerData?.avatar || ""} alt={managerData?.name || "Manager Avatar"} />
              <h2 className="mt-4 text-2xl font-semibold">{managerData?.name || "--"}</h2>
            </div>

            {/* Info Card */}
            <Card className="mt-6 rounded-xl shadow-sm border border-solid border-primary">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-gray-500 text-2xl">Function Provided</p>
                  <p className="text-primary font-medium text-xl">{managerData?.function || "--"}</p>

                  <p className="mt-4 text-gray-500 text-xl">Project Identification</p>
                  <Link href={`/manager-search/manager-rating?managerId=${managerId}`} className="text-primary break-all text-xl">
                    277CA003-0610-478F-9385-4D2732771EBE
                  </Link>
                </div>

                <div>
                  <p className="text-gray-500 text-xl">Expertise</p>
                  <p className="font-medium text-xl text-primary">{managerData?.expertise || "--"}</p>

                  <p className="mt-4 text-gray-500 text-xl">The Given Set Applicable</p>
                  <p className="font-medium text-xl text-primary">{managerData?.is_given_set ? "Yes" : "No"}</p>
                </div>
              </div>
            </Card>

            {/* Rating Card */}
            <Card className="mt-6 rounded-xl border border-solid border-primary">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-semibold mb-2">Function Rating</h3>
                <Rate disabled value={managerData?.rating || 0} />
                <span className="ml-2 font-medium">{managerData?.rating || "--"}</span>
              </div>

              <div className="space-y-4 text-sm">
                <QA q="Manager name who helped you solve the problem?" a={managerData?.manager_name || "--"} />
                <QA q="Problem to be solved by the function executed by the Manager" a={managerData?.problem_to_be_solved || "--"} />
                <QA q="Did the manager help you identify the problem properly?" a={managerData?.manager_helped_identify_problem ? "Yes" : "No"} />
                <QA q="Did the function solve the problem?" a={managerData?.function_solved_problem ? "Yes" : "No"} />
                <QA q="Did the problem exist before the function executed by the Manager?" a={managerData?.problem_existed_before_function ? "Yes" : "No"} />
                <QA q="Did the problem exist after the function executed by the Manager?" a={managerData?.problem_existed_after_function ? "Yes" : "No"} />
                <QA q="Is the function provided by the Manager solved the problem?" a={managerData?.function_provided_solved_problem ? "Yes" : "No"} />
                <QA q="Did the Manager apply the feedback to help solve the problem?" a={managerData?.manager_applied_feedback ? "Yes" : "No"} />
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

/* Helper component */
function QA({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <p className="text-primary font-medium">{q}</p>
      <p className="mt-1 text-gray-800 font-bold">{a}</p>
    </div>
  );
}
