function apiBase(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin;
}

/**
 * Thứ tự: dòng PI (piId) → GET /api/ratings/default-provider-public (env server, không cần Bearer) → NEXT_PUBLIC trên client.
 */
export async function resolveRatingProviderId(
  token: string,
  piId: string | undefined
): Promise<number | undefined> {
  const base = apiBase();

  if (piId && /^\d+$/.test(piId)) {
    try {
      const res = await fetch(`${base}/api/ratings/project-identification/row/${piId}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (res.ok) {
        const row = (await res.json()) as Record<string, unknown>;
        const raw =
          (row.provider_id as number | null | undefined) ??
          (row.sender_provider_id as number | null | undefined) ??
          (row.providerId as number | null | undefined) ??
          (row.senderProviderId as number | null | undefined);
        if (raw != null && String(raw).trim() !== "") {
          const n = Number(raw);
          if (!Number.isNaN(n)) return n;
        }
      }
    } catch {
      // continue
    }
  }

  try {
    const res = await fetch(`${base}/api/ratings/default-provider-public`, { cache: "no-store" });
    if (res.ok) {
      const j = (await res.json()) as { providerId: number | null };
      if (j.providerId != null && !Number.isNaN(Number(j.providerId))) {
        return Number(j.providerId);
      }
    }
  } catch {
    // continue
  }

  const envRaw =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_DEFAULT_RATING_PROVIDER_ID?.trim() : undefined;
  if (envRaw && /^\d+$/.test(envRaw)) {
    const n = parseInt(envRaw, 10);
    if (!Number.isNaN(n)) return n;
  }

  return undefined;
}
