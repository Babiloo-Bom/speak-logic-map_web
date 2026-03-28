/** Next.js `router.query` values are often `string | string[] | undefined`. */
export function firstQueryParam(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  const s = Array.isArray(v) ? v[0] : v;
  const t = typeof s === "string" ? s.trim() : "";
  return t.length > 0 ? t : undefined;
}
