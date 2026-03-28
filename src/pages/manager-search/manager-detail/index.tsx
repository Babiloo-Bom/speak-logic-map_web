/* eslint-disable react-hooks/exhaustive-deps */
import { getAuthToken } from "@/utils/constants";
import { firstQueryParam } from "@/utils/router-query";
import { Button, Card, Rate, message } from "antd";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IManagerDetail } from "@/lib/pages/manager-search/manager-detail/type";
import DEFAULT_AVATAR from "@/assets/images/user.jpg";

export default function ManagerDetail() {
  const router = useRouter();
  const managerId = router.isReady ? firstQueryParam(router.query.managerId) : undefined;
  const routeProjectId = router.isReady ? firstQueryParam(router.query.projectId) : undefined;
  const routePiId = router.isReady ? firstQueryParam(router.query.piId) : undefined;

  const [managerData, setManagerData] = useState<IManagerDetail | null>(null);
  const [avatarSrc, setAvatarSrc] = useState<string | typeof DEFAULT_AVATAR>(DEFAULT_AVATAR);
  const [latestProjectId, setLatestProjectId] = useState<string | null>(null);

  const fetchLatestProjectId = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const res = await fetch("/api/ratings/project-identification?limit=1", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const id = data?.items?.[0]?.project_id;
        if (id) setLatestProjectId(id);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchLatestProjectId();
  }, []);

  const fetchManagerDetail = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        message.error("No authentication token found");
        return;
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
        setManagerData(result);
        const avatarUrl = result?.avatar || result?.image_url || result?.avatar_url;
        setAvatarSrc(avatarUrl ? avatarUrl : DEFAULT_AVATAR);
      } else {
        const errorData = await response.json();
        message.error(errorData.error || "Failed to fetch managers");
      }
    } catch (error) {
      message.error(String(error));
    }
  };

  useEffect(() => {
    if (managerId && !Number.isNaN(Number(managerId))) {
      fetchManagerDetail();
    }
  }, [managerId]);

  useEffect(() => {
    const url = managerData?.avatar ?? (managerData as any)?.image_url ?? (managerData as any)?.avatar_url;
    setAvatarSrc(url ? url : DEFAULT_AVATAR);
  }, [managerData]);

  const functionProvided =
    (managerData as any)?.function ||
    ((managerData as any)?.functions?.length
      ? (managerData as any).functions.map((f: { name: string }) => f.name).join(", ")
      : null);

  const ratingHref =
    managerId != null
      ? (() => {
          const q = new URLSearchParams({ managerId: String(managerId) });
          const pid = routeProjectId || latestProjectId;
          if (pid) q.set("projectId", pid);
          if (routePiId) q.set("piId", routePiId);
          return `/manager-search/manager-rating?${q.toString()}`;
        })()
      : "#";

  if (!router.isReady) {
    return (
      <div className="w-full bg-white min-h-screen flex items-center justify-center text-gray-600">Loading...</div>
    );
  }

  if (!managerId || Number.isNaN(Number(managerId))) {
    return (
      <div className="w-full bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Invalid manager</p>
          <Button type="primary" className="mt-4" onClick={() => router.push("/manager-search")}>
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

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
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="relative w-[200px] h-[200px] rounded-full overflow-hidden bg-gray-200">
            <Image
              src={avatarSrc}
              alt={managerData?.name || "Manager Avatar"}
              fill
              className="object-cover"
              onError={() => setAvatarSrc(DEFAULT_AVATAR)}
            />
          </div>
          <h2 className="mt-4 text-2xl font-semibold">{managerData?.name || "--"}</h2>
        </div>

        {/* Info Card */}
        <Card className="mt-6 rounded-xl shadow-sm border border-solid border-primary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-gray-500 text-2xl">Function Provided</p>
              <p className="text-primary font-medium text-xl">{functionProvided || "--"}</p>

              <p className="mt-4 text-gray-500 text-xl">Rate this Manager</p>
              <Link href={ratingHref} className="text-primary break-all text-xl hover:underline">
                Go to Manager Rating
              </Link>
            </div>

            <div>
              <p className="text-gray-500 text-xl">Expertise</p>
              <p className="font-medium text-xl text-primary">{(managerData as any)?.expertise || "--"}</p>

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
            <QA q="Manager name who helped you solve the problem?" a="Michael David" />
            <QA q="Problem to be solved by the function executed by the Manager" a="Dirty Oil" />
            <QA q="Did the manager help you identify the problem properly?" a="Yes" />
            <QA q="Did the function solve the problem?" a="Yes" />
            <QA q="Did the problem exist before the function executed by the Manager?" a="Yes" />
            <QA q="Did the problem exist after the function executed by the Manager?" a="Yes" />
            <QA q="Is the function provided by the Manager solved the problem?" a="Yes" />
            <QA q="Did the Manager apply the feedback to help solve the problem?" a="Yes" />
          </div>
        </Card>
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
