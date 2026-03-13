import { Button, Card, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAuthToken } from "@/utils/constants";

const { Text } = Typography;

const FunctionRatingDetailPage = () => {
  const router = useRouter();
  const { projectId } = router.query;
  const [detail, setDetail] = useState<{ project_id: string; created_at: string; used: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId || typeof projectId !== "string") return;
    const token = getAuthToken();
    if (!token) return;
    fetch(`/api/ratings/project-identification/${encodeURIComponent(projectId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then(setDetail)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading || !detail) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-12 text-center">
        {loading ? <Text type="secondary">Loading...</Text> : <Text type="secondary">Project identification not found.</Text>}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12">
      <Card className="rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Rating for this project</h2>
        <p className="font-mono text-primary break-all mb-2">{detail.project_id}</p>
        <p className="text-gray-600 mb-4">Date: {new Date(detail.created_at).toLocaleDateString()}</p>
        <p className="text-gray-600 mb-6">Used: {detail.used ? "Yes" : "No"}</p>
        <Button type="primary" className="bg-primary border-primary" onClick={() => router.push("/function-ratings")}>
          Back to Function Ratings
        </Button>
      </Card>
    </div>
  );
};

export default FunctionRatingDetailPage;
