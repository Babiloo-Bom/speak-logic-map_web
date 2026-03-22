export type ProviderWizardMode = "manual" | "xml";

export interface ProviderWizardStep1 {
  providerName: string;
  providerAddress: string;
  websiteUrl: string;
  nearCity: string;
  contactName: string;
  phone: string;
  numFunctions: string;
  /** XML Loaded mode — path or URL to provider XML */
  xmlLocation: string;
}

export interface ProviderWizardStep2 {
  functionName: string;
  functionLocation: string;
  keywords: string;
  functionDescription: string;
  requiresPhysicalAddress: boolean;
  problemSolved: string;
  functionUrl: string;
  givenSetApplicable: boolean;
  functionProvidedAddress: boolean;
}

export interface ProviderWizardSubmitBody {
  mode: ProviderWizardMode;
  step1: ProviderWizardStep1;
  step2: ProviderWizardStep2;
}
