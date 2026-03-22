import type { NextApiResponse } from "next";
import { requireAuth, type AuthenticatedRequest } from "@/lib/auth";
import { createProvider } from "@/lib/providers";
import { getOrCreateFunction, getOrCreateProblem } from "@/lib/catalogEntities";
import type { ProviderWizardSubmitBody } from "@/types/providerWizard";
import type { ProviderCreateInput } from "@/types/provider";

function buildFunctionDescription(s2: ProviderWizardSubmitBody["step2"]): string {
  const parts: string[] = [];
  if (s2.functionDescription?.trim()) parts.push(s2.functionDescription.trim());
  if (s2.functionLocation?.trim()) parts.push(`Location: ${s2.functionLocation.trim()}`);
  if (s2.keywords?.trim()) parts.push(`Keywords: ${s2.keywords.trim()}`);
  if (s2.functionUrl?.trim()) parts.push(`Function URL: ${s2.functionUrl.trim()}`);
  return parts.join("\n\n") || "—";
}

function buildProviderDescription(
  mode: ProviderWizardSubmitBody["mode"],
  s1: ProviderWizardSubmitBody["step1"],
  s2: ProviderWizardSubmitBody["step2"]
): string | undefined {
  const lines: string[] = [];
  if (mode === "xml" && s1.xmlLocation?.trim()) {
    lines.push(`Provider XML location: ${s1.xmlLocation.trim()}`);
  }
  if (s1.contactName?.trim()) lines.push(`Contact: ${s1.contactName.trim()}`);
  if (s1.numFunctions?.trim()) lines.push(`Number of functions (declared): ${s1.numFunctions.trim()}`);
  lines.push(`Function provided address (declared): ${s2.functionProvidedAddress ? "Yes" : "No"}`);
  return lines.length ? lines.join("\n") : undefined;
}

const handler = async (req: AuthenticatedRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body as ProviderWizardSubmitBody;
    const s1 = body?.step1;
    const s2 = body?.step2;
    const mode = body?.mode;

    if (!s1 || !s2 || (mode !== "manual" && mode !== "xml")) {
      return res.status(400).json({ error: "Invalid wizard payload" });
    }

    if (!s1.providerName?.trim()) {
      return res.status(400).json({ error: "Provider name is required" });
    }

    if (mode === "xml" && !s1.xmlLocation?.trim()) {
      return res.status(400).json({ error: "Provider XML location is required in XML Loaded mode" });
    }

    if (!s2.functionName?.trim()) {
      return res.status(400).json({ error: "Function name is required" });
    }
    if (!s2.problemSolved?.trim()) {
      return res.status(400).json({ error: "Problem solved is required" });
    }

    const userId = req.user!.id;

    const funcDesc = buildFunctionDescription(s2);
    const functionId = await getOrCreateFunction(s2.functionName, funcDesc);
    const problemId = await getOrCreateProblem(s2.problemSolved, undefined);

    const providerDesc = buildProviderDescription(mode, s1, s2);

    const input: ProviderCreateInput = {
      user_id: userId,
      name: s1.providerName.trim(),
      address: s1.providerAddress?.trim() || undefined,
      website_url: s1.websiteUrl?.trim() || undefined,
      url: s1.websiteUrl?.trim() || undefined,
      near_city: s1.nearCity?.trim() || undefined,
      contact_number: s1.phone?.trim() || undefined,
      description: providerDesc,
      is_applicable: s2.givenSetApplicable,
      location_by: s2.requiresPhysicalAddress,
      status: "active",
      function_ids: [functionId],
      problem_ids: [problemId],
    };

    const provider = await createProvider(input);
    return res.status(201).json(provider);
  } catch (error: unknown) {
    console.error("Wizard create provider error:", error);
    const msg = error instanceof Error ? error.message : "Internal server error";
    if (msg.includes("required")) {
      return res.status(400).json({ error: msg });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default requireAuth()(handler);
