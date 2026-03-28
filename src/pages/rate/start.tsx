import { Alert, Button, Spin } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { getAuthToken } from "@/utils/constants";
import { firstQueryParam } from "@/utils/router-query";
import { resolveRatingProviderId } from "@/lib/ratings/resolveRatingProviderId";

/**
 * Luồng mặc định Provider: PI / env server (RATING_DEFAULT_PROVIDER_ID) / NEXT_PUBLIC → provider-rating hoặc /provider-search.
 */
export default function RateStartPage() {
  const router = useRouter();
  const projectId = router.isReady ? firstQueryParam(router.query.projectId) : undefined;
  const piId = router.isReady ? firstQueryParam(router.query.piId) : undefined;

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!router.isReady || !projectId) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void (async () => {
        const token = getAuthToken();
        if (!token) {
          if (!cancelled) setError("Vui lòng đăng nhập để tiếp tục.");
          return;
        }

        setError(null);
        const providerNum = await resolveRatingProviderId(token, piId);
        if (cancelled) return;

        const qs = new URLSearchParams({ projectId });
        if (piId) qs.set("piId", piId);
        const qstr = qs.toString();

        if (providerNum != null) {
          window.location.replace(`/provider-search/provider-rating?providerId=${providerNum}&${qstr}`);
          return;
        }

        window.location.replace(`/provider-search?${qstr}`);
      })();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [router.isReady, projectId, piId]);

  if (!router.isReady) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-500">
        <Spin size="large" tip="Đang chuyển…" />
      </div>
    );
  }

  if (!projectId) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4">
        <Alert type="error" message="Thiếu mã dự án (projectId)." showIcon />
        <Link href="/my-rating" className="inline-block mt-4">
          <Button type="primary">Về My Ratings</Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4">
        <Alert type="error" message={error} showIcon />
        <Link href="/my-rating" className="inline-block mt-4">
          <Button type="primary">Về My Ratings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 px-4">
      <Spin size="large" />
      <p className="text-gray-600 text-center">Đang mở đánh giá provider…</p>
      <Link href="/my-rating">
        <Button type="link">Hủy — về My Ratings</Button>
      </Link>
    </div>
  );
}
