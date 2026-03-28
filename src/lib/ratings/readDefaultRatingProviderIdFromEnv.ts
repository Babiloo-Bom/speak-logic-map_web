import fs from "fs";
import path from "path";
import { loadEnvConfig } from "@next/env";

const KEYS = ["RATING_DEFAULT_PROVIDER_ID", "DEFAULT_RATING_PROVIDER_ID", "NEXT_PUBLIC_DEFAULT_RATING_PROVIDER_ID"] as const;

let cachedNumber: number | undefined;

function findProjectRoot(start = process.cwd()): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 12; i++) {
    const hasNext =
      fs.existsSync(path.join(dir, "next.config.js")) ||
      fs.existsSync(path.join(dir, "next.config.mjs")) ||
      fs.existsSync(path.join(dir, "next.config.ts"));
    const hasPkg = fs.existsSync(path.join(dir, "package.json"));
    if (hasNext && hasPkg) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.resolve(start);
}

function normalizeRaw(v: string): string {
  let s = v.replace(/^\uFEFF/, "").trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function parseDotEnvFile(filePath: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return out;
  const text = fs.readFileSync(filePath, "utf8");
  for (const line of text.split(/\r\n|\n|\r/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key) out[key] = val;
  }
  return out;
}

function pickFromRecord(rec: Record<string, string | undefined>): number | null {
  for (const key of KEYS) {
    const raw = rec[key];
    if (raw == null || raw === "") continue;
    const s = normalizeRaw(String(raw));
    if (!/^\d+$/.test(s)) continue;
    const n = parseInt(s, 10);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

/**
 * Đọc id provider mặc định. Root project = walk-up từ cwd (tránh cwd sai).
 * next.config.js đã require scripts/ensure-rating-default-env.cjs → process.env thường đã có sẵn.
 */
export function getDefaultRatingProviderIdFromEnv(): number | null {
  if (cachedNumber !== undefined) return cachedNumber;

  const root = findProjectRoot();
  const isDev = process.env.NODE_ENV !== "production";

  const nFromProcess = pickFromRecord(process.env as Record<string, string | undefined>);
  if (nFromProcess != null) {
    cachedNumber = nFromProcess;
    return nFromProcess;
  }

  const { combinedEnv } = loadEnvConfig(root, isDev, console, true);
  const merged: Record<string, string | undefined> = { ...process.env };
  for (const [k, v] of Object.entries(combinedEnv)) {
    if (v !== undefined) merged[k] = v;
  }

  let n = pickFromRecord(merged as Record<string, string | undefined>);
  if (n != null) {
    cachedNumber = n;
    return n;
  }

  const fileCandidates = [
    path.join(root, ".env.local"),
    path.join(root, ".env"),
    path.join(root, isDev ? ".env.development.local" : ".env.production.local"),
    path.join(root, isDev ? ".env.development" : ".env.production"),
  ];

  for (const fp of fileCandidates) {
    const parsed = parseDotEnvFile(fp);
    n = pickFromRecord(parsed);
    if (n != null) {
      cachedNumber = n;
      return n;
    }
  }

  return null;
}
