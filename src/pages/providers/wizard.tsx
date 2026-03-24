import React, { useMemo, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { message } from "antd";
import { getAuthToken } from "@/utils/constants";
import type { ProviderWizardMode, ProviderWizardStep1, ProviderWizardStep2 } from "@/types/providerWizard";

const primary = "#2d4096";
const inputClass =
  "w-full rounded-lg bg-gray-100 border border-transparent px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2d4096]/35";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-900 mb-1.5">{children}</label>;
}

/** Label + Yes/No: cùng chiều cao vùng điều khiển với `<input className={inputClass} />` (~48px) */
function RadioYesNo({
  label,
  name,
  value,
  onYes,
  onNo,
}: {
  label: string;
  name: string;
  value: boolean;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <div className="min-h-[48px] flex items-center">
        <div className="flex flex-wrap gap-x-10 gap-y-2 items-center">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name={name}
              checked={value}
              onChange={onYes}
              className="accent-[#2d4096] w-4 h-4 shrink-0"
            />
            <span className="text-sm text-gray-900">Yes</span>
          </label>
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name={name}
              checked={!value}
              onChange={onNo}
              className="accent-[#2d4096] w-4 h-4 shrink-0"
            />
            <span className="text-sm text-gray-900">No</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildProviderWizardXml(
  mode: ProviderWizardMode,
  s1: ProviderWizardStep1,
  s2: ProviderWizardStep2
): string {
  const lines = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<ProviderWizard mode="${escapeXml(mode)}">`,
    `  <AboutProvider>`,
    `    <ProviderName>${escapeXml(s1.providerName)}</ProviderName>`,
    `    <ProviderAddress>${escapeXml(s1.providerAddress)}</ProviderAddress>`,
    `    <WebsiteUrl>${escapeXml(s1.websiteUrl)}</WebsiteUrl>`,
    `    <NearCity>${escapeXml(s1.nearCity)}</NearCity>`,
    `    <ContactName>${escapeXml(s1.contactName)}</ContactName>`,
    `    <Phone>${escapeXml(s1.phone)}</Phone>`,
    `    <NumFunctionsDeclared>${escapeXml(s1.numFunctions)}</NumFunctionsDeclared>`,
    `    <ProviderXmlLocation>${escapeXml(s1.xmlLocation)}</ProviderXmlLocation>`,
    `  </AboutProvider>`,
    `  <AboutFunctionAndProblem>`,
    `    <FunctionName>${escapeXml(s2.functionName)}</FunctionName>`,
    `    <FunctionLocation>${escapeXml(s2.functionLocation)}</FunctionLocation>`,
    `    <Keywords>${escapeXml(s2.keywords)}</Keywords>`,
    `    <FunctionDescription>${escapeXml(s2.functionDescription)}</FunctionDescription>`,
    `    <RequiresPhysicalAddress>${s2.requiresPhysicalAddress}</RequiresPhysicalAddress>`,
    `    <ProblemSolved>${escapeXml(s2.problemSolved)}</ProblemSolved>`,
    `    <FunctionUrl>${escapeXml(s2.functionUrl)}</FunctionUrl>`,
    `    <GivenSetApplicable>${s2.givenSetApplicable}</GivenSetApplicable>`,
    `    <FunctionProvidedAddress>${s2.functionProvidedAddress}</FunctionProvidedAddress>`,
    `  </AboutFunctionAndProblem>`,
    `</ProviderWizard>`,
  ];
  return lines.join("\n");
}

function downloadXml(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const emptyS1: ProviderWizardStep1 = {
  providerName: "",
  providerAddress: "",
  websiteUrl: "",
  nearCity: "",
  contactName: "",
  phone: "",
  numFunctions: "",
  xmlLocation: "",
};

const emptyS2: ProviderWizardStep2 = {
  functionName: "",
  functionLocation: "",
  keywords: "",
  functionDescription: "",
  requiresPhysicalAddress: true,
  problemSolved: "",
  functionUrl: "",
  givenSetApplicable: true,
  functionProvidedAddress: true,
};

export default function ProviderWizardPage() {
  const router = useRouter();
  const [mode, setMode] = useState<ProviderWizardMode>("manual");
  const [step, setStep] = useState<1 | 2>(1);
  const [s1, setS1] = useState<ProviderWizardStep1>({ ...emptyS1 });
  const [s2, setS2] = useState<ProviderWizardStep2>({ ...emptyS2 });
  const [submitting, setSubmitting] = useState(false);

  const updateS1 = (patch: Partial<ProviderWizardStep1>) => setS1((p) => ({ ...p, ...patch }));
  const updateS2 = (patch: Partial<ProviderWizardStep2>) => setS2((p) => ({ ...p, ...patch }));

  const canStep1Next = useMemo(() => {
    if (!s1.providerName.trim()) return false;
    if (mode === "xml" && !s1.xmlLocation.trim()) return false;
    return true;
  }, [s1.providerName, s1.xmlLocation, mode]);

  const canSubmit = useMemo(() => {
    return s2.functionName.trim().length > 0 && s2.problemSolved.trim().length > 0;
  }, [s2.functionName, s2.problemSolved]);

  const handleNext = () => {
    if (!canStep1Next) {
      message.warning(
        mode === "xml"
          ? "Please enter provider name and XML location."
          : "Please enter provider name."
      );
      return;
    }
    setStep(2);
  };

  const handleBack = () => setStep(1);

  const handleGenerateXml = () => {
    const xml = buildProviderWizardXml(mode, s1, s2);
    downloadXml("provider-wizard-export.xml", xml);
    message.success("XML file downloaded.");
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      message.warning("Function name and problem solved are required.");
      return;
    }
    const token = getAuthToken();
    if (!token) {
      message.error("Please sign in to submit.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await fetch("/api/providers/wizard", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mode, step1: s1, step2: s2 }),
      });
      if (res.ok) {
        message.success("Provider created successfully.");
        router.push("/provider-search");
      } else {
        const err = await res.json().catch(() => ({}));
        message.error(err.error || "Failed to create provider.");
      }
    } catch {
      message.error("Network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBtn = (active: boolean) =>
    `flex-1 rounded-xl px-6 py-3 text-center font-semibold transition border-2 ${
      active
        ? "text-white border-[#2d4096]"
        : "bg-white text-[#2d4096] border-[#2d4096] hover:bg-blue-50"
    }`;

  return (
    <>
      <Head>
        <title>Provider Wizard | Function Provider</title>
      </Head>
      <div className="min-h-[70vh] bg-[#f5f6f8] py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-center text-3xl md:text-4xl font-semibold text-gray-900 mb-8">
            Provider Wizard
          </h1>

          {/* Manual / XML Loaded */}
          <div className="flex justify-center gap-3 max-w-xl mx-auto mb-10">
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={toggleBtn(mode === "manual")}
              style={mode === "manual" ? { backgroundColor: primary, borderColor: primary } : undefined}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => setMode("xml")}
              className={toggleBtn(mode === "xml")}
              style={mode === "xml" ? { backgroundColor: primary, borderColor: primary } : undefined}
            >
              XML Loaded
            </button>
          </div>

          {/* Stepper: circles + dashed line on one row (vertically centered), labels below */}
          <div className="mb-10 max-w-2xl mx-auto px-2">
            <div className="flex items-center w-full">
              <div className="flex justify-center shrink-0 w-[112px] sm:w-[128px]">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2"
                  style={{
                    borderColor: primary,
                    background: primary,
                    color: "#fff",
                  }}
                >
                  1
                </div>
              </div>
              <div className="flex-1 min-w-[1.5rem] h-0 self-center border-t-2 border-dashed border-gray-300" />
              <div className="flex justify-center shrink-0 w-[112px] sm:w-[148px]">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 bg-white"
                  style={{
                    borderColor: step === 2 ? primary : "#d1d5db",
                    background: step === 2 ? primary : "white",
                    color: step === 2 ? "#fff" : "#9ca3af",
                  }}
                >
                  2
                </div>
              </div>
            </div>
            <div className="flex w-full mt-2">
              <div
                className="shrink-0 w-[112px] sm:w-[128px] text-center text-xs sm:text-sm font-medium px-1 leading-tight"
                style={{ color: primary }}
              >
                About Provider
              </div>
              <div className="flex-1 min-w-[1.5rem]" />
              <div
                className="shrink-0 w-[112px] sm:w-[148px] text-center text-xs sm:text-sm font-medium px-1 leading-tight"
                style={{ color: step === 2 ? primary : "#94a3b8" }}
              >
                About Function And Problem
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-10">
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                {mode === "xml" ? (
                  <>
                    <div>
                      <Label>Provider XML Location</Label>
                      <input
                        className={inputClass}
                        placeholder="Provider XML Location"
                        value={s1.xmlLocation}
                        onChange={(e) => updateS1({ xmlLocation: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Provider name</Label>
                      <input
                        className={inputClass}
                        placeholder="Provider name"
                        value={s1.providerName}
                        onChange={(e) => updateS1({ providerName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Contact name</Label>
                      <input
                        className={inputClass}
                        placeholder="Name"
                        value={s1.contactName}
                        onChange={(e) => updateS1({ contactName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Provider address</Label>
                      <input
                        className={inputClass}
                        placeholder="Physical Address"
                        value={s1.providerAddress}
                        onChange={(e) => updateS1({ providerAddress: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <input
                        className={inputClass}
                        placeholder="Phone Number"
                        value={s1.phone}
                        onChange={(e) => updateS1({ phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Provide URL</Label>
                      <input
                        className={inputClass}
                        placeholder="URL"
                        value={s1.websiteUrl}
                        onChange={(e) => updateS1({ websiteUrl: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>No of Function Provided</Label>
                      <input
                        className={inputClass}
                        placeholder="Enter the Number"
                        value={s1.numFunctions}
                        onChange={(e) => updateS1({ numFunctions: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Provider Location (Optional)</Label>
                      <input
                        className={inputClass}
                        placeholder="Enter the country"
                        value={s1.nearCity}
                        onChange={(e) => updateS1({ nearCity: e.target.value })}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label>Provider name</Label>
                      <input
                        className={inputClass}
                        placeholder="Name"
                        value={s1.providerName}
                        onChange={(e) => updateS1({ providerName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Contact name</Label>
                      <input
                        className={inputClass}
                        placeholder="Contact name"
                        value={s1.contactName}
                        onChange={(e) => updateS1({ contactName: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Provider address</Label>
                      <input
                        className={inputClass}
                        placeholder="Provider address"
                        value={s1.providerAddress}
                        onChange={(e) => updateS1({ providerAddress: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Phone Number</Label>
                      <input
                        className={inputClass}
                        placeholder="Phone Number"
                        value={s1.phone}
                        onChange={(e) => updateS1({ phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Provide URL</Label>
                      <input
                        className={inputClass}
                        placeholder="Website"
                        value={s1.websiteUrl}
                        onChange={(e) => updateS1({ websiteUrl: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>No of Function Provided</Label>
                      <input
                        className={inputClass}
                        placeholder="Enter the Number"
                        value={s1.numFunctions}
                        onChange={(e) => updateS1({ numFunctions: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Provider Location (Optional)</Label>
                      <input
                        className={inputClass}
                        placeholder="Enter the country"
                        value={s1.nearCity}
                        onChange={(e) => updateS1({ nearCity: e.target.value })}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 md:items-start gap-x-10 gap-y-5">
                {/* Hàng 1 */}
                <div>
                  <Label>Function Name</Label>
                  <input
                    className={inputClass}
                    placeholder="Function provided by the Provider"
                    value={s2.functionName}
                    onChange={(e) => updateS2({ functionName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Problem Solved</Label>
                  <input
                    className={inputClass}
                    placeholder="Problem Solved by the Function"
                    value={s2.problemSolved}
                    onChange={(e) => updateS2({ problemSolved: e.target.value })}
                  />
                </div>
                {/* Hàng 2 */}
                <div>
                  <Label>Function Location</Label>
                  <input
                    className={inputClass}
                    placeholder="Enter Location"
                    value={s2.functionLocation}
                    onChange={(e) => updateS2({ functionLocation: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Function URL</Label>
                  <input
                    className={inputClass}
                    placeholder="Function URL"
                    value={s2.functionUrl}
                    onChange={(e) => updateS2({ functionUrl: e.target.value })}
                  />
                </div>
                {/* Hàng 3: Keyword | The Given Set (cùng baseline) */}
                <div>
                  <Label>Function Keyword</Label>
                  <input
                    className={inputClass}
                    placeholder="Add Tags"
                    value={s2.keywords}
                    onChange={(e) => updateS2({ keywords: e.target.value })}
                  />
                </div>
                <RadioYesNo
                  label="The Given Set Applicable"
                  name="wizard-given-set"
                  value={s2.givenSetApplicable}
                  onYes={() => updateS2({ givenSetApplicable: true })}
                  onNo={() => updateS2({ givenSetApplicable: false })}
                />
                {/* Hàng 4: Description | Function Provided Address (căn đỉnh cùng hàng) */}
                <div className="md:row-span-1">
                  <Label>Function Description</Label>
                  <textarea
                    className={`${inputClass} min-h-[120px] resize-y`}
                    placeholder="Function Description"
                    value={s2.functionDescription}
                    onChange={(e) => updateS2({ functionDescription: e.target.value })}
                  />
                </div>
                <div className="md:self-start">
                  <RadioYesNo
                    label="Function Provided Address"
                    name="wizard-provided-addr"
                    value={s2.functionProvidedAddress}
                    onYes={() => updateS2({ functionProvidedAddress: true })}
                    onNo={() => updateS2({ functionProvidedAddress: false })}
                  />
                </div>
                {/* Hàng 5: chỉ cột trái */}
                <div className="md:col-span-2 max-w-full md:max-w-[calc(50%-1.25rem)]">
                  <RadioYesNo
                    label="Function requires Physical Address/Location"
                    name="wizard-physical"
                    value={s2.requiresPhysicalAddress}
                    onYes={() => updateS2({ requiresPhysicalAddress: true })}
                    onNo={() => updateS2({ requiresPhysicalAddress: false })}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-10 flex flex-wrap items-center gap-3 justify-end">
              {step === 2 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="mr-auto rounded-lg border-2 border-[#2d4096] text-[#2d4096] px-6 py-2.5 font-semibold bg-white hover:bg-blue-50"
                >
                  Back
                </button>
              )}
              {step === 1 && (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canStep1Next}
                  className="rounded-lg text-white px-8 py-2.5 font-semibold disabled:opacity-50"
                  style={{ backgroundColor: primary }}
                >
                  Next
                </button>
              )}
              {step === 2 && mode === "manual" && (
                <button
                  type="button"
                  onClick={handleGenerateXml}
                  className="rounded-lg border-2 border-[#2d4096] text-[#2d4096] px-5 py-2.5 font-semibold bg-white hover:bg-blue-50"
                >
                  Generate XML
                </button>
              )}
              {step === 2 && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !canSubmit}
                  className="rounded-lg text-white px-8 py-2.5 font-semibold disabled:opacity-50"
                  style={{ backgroundColor: primary }}
                >
                  {submitting ? "Submitting…" : "Submit"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
