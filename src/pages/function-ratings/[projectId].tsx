import { Button, Card, Rate, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAuthToken } from "@/utils/constants";

const { Text } = Typography;

interface ViewRatingItem {
  type: "manager" | "provider" | null;
  project_id: string;
  used?: boolean;
  manager_id?: number;
  manager_name?: string;
  manager_user_name?: string;
  manager_location?: string;
  job_location?: string;
  manager_url?: string;
  reviewer_phone?: string;
  function_name?: string;
  function_manager?: string;
  problem_to_be_solved?: string;
  problem_solver_manager_name?: string;
  manager_helped_identify_problem?: boolean;
  function_solved_problem?: boolean;
  problem_existed_before_function?: boolean;
  problem_existed_after_function?: boolean;
  function_provided_solved_problem?: boolean;
  provided_feedback_after_function?: boolean;
  manager_applied_feedback?: boolean;
  rating?: number;
  comment?: string;
  is_given_set?: boolean;
  provider_id?: number;
  provider_name?: string;
}

interface ViewRatingResponse {
  items: ViewRatingItem[];
}

const yesNo = (v: boolean | undefined) => (v === true ? "Yes" : v === false ? "No" : "--");

const FunctionRatingDetailPage = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const [items, setItems] = useState<ViewRatingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId || typeof projectId !== "string") return;
    const token = getAuthToken();
    if (!token) return;
    fetch(`/api/ratings/view-rating/${encodeURIComponent(projectId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: ViewRatingResponse | null) => {
        if (json && Array.isArray(json.items)) {
          setItems(json.items);
        } else {
          setItems([]);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center">
        <Text type="secondary">Loading...</Text>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 text-center">
        <Text type="secondary">Project identification or rating not found.</Text>
        <Button type="link" onClick={() => router.push("/function-ratings")} className="ml-2">
          Back to Function Ratings
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold text-center mb-8">View Rating</h1>
      {items.map((data, index) => {
        const isManager = data.type === "manager";
        const hasNoRating = data.type == null;

        return (
          <div key={index} className="mb-10">
            {/* Info box: Manager or Provider details */}
            <Card className="rounded-xl mb-4">
              {isManager ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm mb-1" style={{ color: "#324899" }}>Manager name</p>
                    <p className="font-medium text-primary mb-3">{data.manager_name || "--"}</p>
                    <p className="text-sm mb-1" style={{ color: "#324899" }}>Function Name</p>
                    <p className="font-medium">{data.function_name || "--"}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: "#324899" }}>Manager Address</p>
                    <p className="font-medium mb-3">{data.manager_location || data.job_location || "--"}</p>
                    <p className="text-sm mb-1" style={{ color: "#324899" }}>Problem Solved</p>
                    <p className="font-medium">{data.problem_to_be_solved || "--"}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: "#324899" }}>Phone Number</p>
                    <p className="font-medium mb-3">{data.reviewer_phone || "--"}</p>
                    <p className="text-sm mb-1" style={{ color: "#324899" }}>The Given Set Applicable</p>
                    <p className="font-medium">{data.is_given_set != null ? (data.is_given_set ? "Yes" : "No") : "--"}</p>
                  </div>
                </div>
              ) : data.type === "provider" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm mb-1" style={{ color: "#324899" }}>Provider name</p>
                    <p className="font-medium text-primary">{data.provider_name || "--"}</p>
                  </div>
                  <div>
                    <p className="text-sm mb-1" style={{ color: "#324899" }}>Rating</p>
                    <p className="font-medium">{(data.rating ?? 0).toFixed(1)}</p>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-2">This Project ID has not been used for a rating yet.</p>
                  <p className="text-sm text-gray-500">
                    To see rating details here, use this Project Identification when you submit a Manager rating or Provider rating. You can copy it from My Ratings and paste it when rating.
                  </p>
                </>
              )}
            </Card>

            {hasNoRating ? null : (
              <Card className="rounded-xl mb-4">
                <div className="text-center mb-6 py-4 px-4 bg-gray-50 rounded-lg">
                  <h2 className="text-2xl font-semibold mb-2" style={{ color: "#324899" }}>Function Rating</h2>
                  <p className="text-sm mb-3" style={{ color: "#324899" }}>Đánh giá (số sao)</p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Rate disabled value={data.rating ?? 0} allowHalf style={{ fontSize: 32 }} className="[&_.ant-rate-star]:mr-1" />
                    <span className="text-xl font-semibold">{(data.rating ?? 0).toFixed(1)}</span>
                  </div>
                </div>
                {isManager ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm mb-1" style={{ color: "#324899" }}>Manager name who helped you solve the problem?</p>
                      <p className="font-medium">{data.problem_solver_manager_name || "--"}</p>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: "#324899" }}>Problem to be solved by the function executed by the Manager</p>
                      <p className="font-medium">{data.problem_to_be_solved || "--"}</p>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: "#324899" }}>Did the manager help you identify the problem properly?</p>
                      <p className="font-medium">{yesNo(data.manager_helped_identify_problem)}</p>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: "#324899" }}>Did the function solve the problem?</p>
                      <p className="font-medium">{yesNo(data.function_solved_problem)}</p>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: "#324899" }}>Did the problem exist before the function executed by the Manager?</p>
                      <p className="font-medium">{yesNo(data.problem_existed_before_function)}</p>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: "#324899" }}>Did the problem exist after the function executed by the Manager?</p>
                      <p className="font-medium">{yesNo(data.problem_existed_after_function)}</p>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: "#324899" }}>Is the function provided by the Manager solved the problem?</p>
                      <p className="font-medium">{yesNo(data.function_provided_solved_problem)}</p>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: "#324899" }}>
                        If no, did you provide feedback to the Manager after function executed to help the function executed properly to solve the problem?
                      </p>
                      <p className="font-medium">{yesNo(data.provided_feedback_after_function)}</p>
                    </div>
                    <div>
                      <p className="text-sm mb-1" style={{ color: "#324899" }}>Did the Manager apply the feedback to help solve the problem?</p>
                      <p className="font-medium">{yesNo(data.manager_applied_feedback)}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Provider rating — no detailed Q&A.</p>
                )}
                {data.comment && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm mb-1" style={{ color: "#324899" }}>Comment</p>
                    <p className="font-medium">{data.comment}</p>
                  </div>
                )}
              </Card>
            )}
          </div>
        );
      })}

      <div className="text-center">
        <Button type="primary" className="bg-primary border-primary" onClick={() => router.push("/function-ratings")}>
          Back to Function Ratings
        </Button>
      </div>
    </div>
  );
};

export default FunctionRatingDetailPage;
