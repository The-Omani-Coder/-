export type Language = 'ar' | 'en';

export type AppView =
  | 'landing'
  | 'auth'
  | 'onboarding'
  | 'dashboard'
  | 'projects'
  | 'wizard'
  | 'vision'
  | 'twin'
  | 'reverse-lab'
  | 'capital-shield'
  | 'market-lab'
  | 'reengineer'
  | 'time-machine'
  | 'competitors'
  | 'marketing'
  | 'reports'
  | 'advisor'
  | 'settings';

export type ProjectStage = 'idea' | 'prototype' | 'existing' | 'scaling';
export type BusinessModelType = 'online' | 'physical' | 'hybrid';
export type CurrencyPrecision = 2 | 3;

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  description: string;
  images: string[];
  unitPurchaseCost: number;
  productionCost: number;
  sellingPrice: number;
  packagingCostPerUnit: number;
  totalShippingCost: number;
  supplierMinOrderQty: number;
  plannedOrderQty: number;
  supplierName: string;
  deliveryDays: number;
  hasAlternativeSupplier: boolean;
  seasonality: 'year_round' | 'seasonal' | 'occasions';
  estimatedInventoryCapacity: number;
  visionNotes?: VisionAnalysisResult;
}

export interface VisionAnalysisResult {
  suggestedCategory: string;
  packagingCharacteristics: string[];
  designObservations: string[];
  presentationImprovements: string[];
  positioningIdeas: string[];
  suggestedCustomerSegments: string[];
  questionsForConfirmation: string[];
  source: 'gemini' | 'demo_sample' | 'manual';
  analyzedAt: string;
}

export interface FinancialProfile {
  availableCapital: number;
  maxAcceptableLoss: number;
  monthlyOperatingCosts: number;
  marketingBudget: number;
  emergencyReserve: number;
  otherExpenses: number;
  maxExperimentSpending: number;
  expectedSalesQuantity: number;
  timePeriodMonths: 1 | 3 | 6 | 12;
  currency: 'OMR';
}

export interface CustomerMarketInfo {
  targetAgeGroup: string;
  customerPreferences: string;
  customerNeeds: string;
  salesChannels: string[];
  existingCustomerEvidence: string;
  productDifferentiation: string;
  expectedDemandAssumptions: string;
}

export interface CompetitorEntry {
  id: string;
  name: string;
  product: string;
  price: number;
  strengths: string;
  weaknesses: string;
  salesChannels: string;
  sourceLink: string;
  dateCollected: string;
  isDemo?: boolean;
}

export interface TwinControls {
  orderQuantity: number;
  unitCost: number;
  sellingPrice: number;
  marketingBudget: number;
  shippingCost: number;
  packagingCostPerUnit: number;
  expectedUnitsSold: number;
  expectedSalesPercentage: number;
  operatingExpenses: number;
  otherExpenses: number;
}

export interface FinancialMetrics {
  orderQuantity: number;
  effectiveUnitsSold: number;
  unsoldUnits: number;
  inventoryAcquisitionCost: number;
  totalPackagingCost: number;
  totalInitialSpending: number;
  totalCashOutflow: number;
  potentialRevenue: number;
  cogsSold: number;
  grossProfit: number;
  netProfitEstimate: number;
  remainingCash: number;
  unsoldInventoryCostValue: number;
  contributionMarginPerUnit: number;
  breakEvenUnits: number | null;
  capitalRecoveryUnits: number | null;
  budgetUsagePercent: number;
  capitalAtRisk: number;
  exceedsBudgetBy: number;
  breachesMaxLoss: boolean;
  touchesEmergencyReserve: boolean;
  isValid: boolean;
  validationErrors: string[];
}

export interface SavedScenario {
  id: string;
  name: string;
  controls: TwinControls;
  notes: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface AssumptionRisk {
  id: string;
  title: string;
  category: 'pricing' | 'demand' | 'supply' | 'capital' | 'differentiation';
  supportingEvidence: string;
  missingInformation: string;
  failureScenario: string;
  estimatedFinancialImpact: number;
  severity: 'high' | 'medium' | 'low';
  severityReason: string;
  recommendedExperiment: string;
  estimatedExperimentCost: number;
  evidenceNeeded: string;
  testStatus: 'untested' | 'testing' | 'validated' | 'invalidated';
  branchPassedAction: string;
  branchFailedAction: string;
}

export interface SurveyResponse {
  id: string;
  chosenVariant: 'A' | 'B' | 'neither';
  preferredPrice: number;
  purchaseIntent: 'high' | 'medium' | 'low';
  objection: string;
  comment: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface MarketExperiment {
  id: string;
  title: string;
  type:
    | 'product_interest'
    | 'price_comparison'
    | 'packaging_comparison'
    | 'name_comparison'
    | 'purchase_intention'
    | 'reservation_interest'
    | 'customer_preference';
  question: string;
  variantA: { label: string; price: number; image?: string; description?: string };
  variantB?: { label: string; price: number; image?: string; description?: string };
  targetAudience: string;
  budget: number;
  minAcceptableResult: string;
  shareUrl?: string;
  isPublishedToServer?: boolean;
  isDemo?: boolean;
  createdAt: string;
  responses: SurveyResponse[];
}

export interface ReengineeredPlan {
  id: 'safe' | 'balanced' | 'growth';
  nameAr: string;
  nameEn: string;
  summaryAr: string;
  summaryEn: string;
  controls: TwinControls;
  moqCompliant: boolean;
  moqNote: string;
  assumptions: string[];
  advantages: string[];
  disadvantages: string[];
  recommendedNextStep: string;
}

export interface DecisionFingerprint {
  id: string;
  version: number;
  date: string;
  originalDecision: string;
  financialCommitment: number;
  mainAssumptions: string[];
  supportingEvidence: string[];
  missingEvidence: string[];
  risks: string[];
  alternativeDecisions: string[];
  selectedExperiment: string;
  finalOutcome: string;
  recommendationCode: 'limited_trial' | 'adjust_then_start' | 'test_more' | 'postpone';
  changedFromPrevious?: string[];
}

export interface OpportunityItem {
  id: string;
  area: 'cost' | 'segment' | 'differentiation' | 'channel' | 'cross_sell' | 'missing_info';
  title: string;
  reason: string;
  assumptions: string;
  difficulty: 'low' | 'medium' | 'high';
  validationExperiment: string;
}

export interface MarketingSavedAsset {
  id: string;
  title: string;
  campaignConcept: string;
  productDescription: string;
  captions: string[];
  suggestedChannels: string[];
  personaSummary: string;
  abTestIdeas: string[];
  contentCalendar: string[];
  promotionalIdeas: string[];
  createdAt: string;
  source: 'gemini' | 'template';
}

export interface Project {
  id: string;
  isDemo?: boolean;
  name: string;
  logoText?: string;
  category: string;
  description: string;
  stage: ProjectStage;
  targetMarket: string;
  country: string;
  city: string;
  targetAudience: string;
  mainGoal: string;
  challenges: string;
  businessType: BusinessModelType;
  products: ProductItem[];
  activeProductId: string;
  financial: FinancialProfile;
  customerMarket: CustomerMarketInfo;
  twinControls: TwinControls;
  savedScenarios: SavedScenario[];
  competitors: CompetitorEntry[];
  experiments: MarketExperiment[];
  assumptions: AssumptionRisk[];
  fingerprints: DecisionFingerprint[];
  marketingAssets: MarketingSavedAsset[];
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  name: string;
  email: string;
  isGuest: boolean;
  onboarded: boolean;
  onboardingAnswers?: {
    projectType: string;
    stage: string;
    mainGoal: string;
    biggestChallenge: string;
    approxBudget: string;
  };
}
