import type {
  CurrencyPrecision,
  FinancialMetrics,
  FinancialProfile,
  ProductItem,
  Project,
  TwinControls,
} from '../types/mihak';

export function safeNumber(val: number, fallback = 0): number {
  if (!Number.isFinite(val) || Number.isNaN(val)) return fallback;
  return Math.max(0, val);
}

export function formatOMR(
  amount: number,
  language: 'ar' | 'en' = 'ar',
  precision: CurrencyPrecision = 3
): string {
  const clean = Number.isFinite(amount) ? amount : 0;
  const formatted = clean.toFixed(precision);
  return language === 'ar' ? `${formatted} ر.ع` : `${formatted} OMR`;
}

export function createDefaultTwinControls(
  product: ProductItem,
  financial: FinancialProfile
): TwinControls {
  const orderQty = Math.max(0, Math.round(safeNumber(product.plannedOrderQty, 1)));
  const expectedSold = Math.min(
    orderQty,
    Math.max(0, Math.round(safeNumber(financial.expectedSalesQuantity, orderQty)))
  );
  const pct = orderQty > 0 ? Math.round((expectedSold / orderQty) * 100) : 0;

  return {
    orderQuantity: orderQty,
    unitCost: safeNumber(product.unitPurchaseCost + product.productionCost, 0),
    sellingPrice: safeNumber(product.sellingPrice, 0),
    marketingBudget: safeNumber(financial.marketingBudget, 0),
    shippingCost: safeNumber(product.totalShippingCost, 0),
    packagingCostPerUnit: safeNumber(product.packagingCostPerUnit, 0),
    expectedUnitsSold: expectedSold,
    expectedSalesPercentage: pct,
    operatingExpenses: safeNumber(financial.monthlyOperatingCosts, 0),
    otherExpenses: safeNumber(financial.otherExpenses, 0),
  };
}

export function calculateFinancialMetrics(
  controls: TwinControls,
  financial: FinancialProfile
): FinancialMetrics {
  const validationErrors: string[] = [];

  const orderQuantity = Math.max(0, Math.round(safeNumber(controls.orderQuantity)));
  const unitCost = safeNumber(controls.unitCost);
  const sellingPrice = safeNumber(controls.sellingPrice);
  const marketingBudget = safeNumber(controls.marketingBudget);
  const shippingCost = safeNumber(controls.shippingCost);
  const packagingCostPerUnit = safeNumber(controls.packagingCostPerUnit);
  const operatingExpenses = safeNumber(controls.operatingExpenses);
  const otherExpenses = safeNumber(controls.otherExpenses);
  const availableCapital = safeNumber(financial.availableCapital);
  const maxAcceptableLoss = safeNumber(financial.maxAcceptableLoss);
  const emergencyReserve = safeNumber(financial.emergencyReserve);

  if (orderQuantity <= 0) {
    validationErrors.push('كمية الطلب يجب أن تكون أكبر من صفر.');
  }
  if (sellingPrice <= 0) {
    validationErrors.push('سعر البيع يجب أن يكون أكبر من صفر.');
  }
  if (controls.expectedUnitsSold > orderQuantity) {
    validationErrors.push('الوحدات المتوقع بيعها لا يمكن أن تتجاوز كمية الطلب.');
  }

  const effectiveUnitsSold = Math.min(
    orderQuantity,
    Math.max(0, Math.round(safeNumber(controls.expectedUnitsSold)))
  );
  const unsoldUnits = Math.max(0, orderQuantity - effectiveUnitsSold);

  // Core exact financial calculations (Requirement 21)
  const inventoryAcquisitionCost = unitCost * orderQuantity;
  const totalPackagingCost = packagingCostPerUnit * orderQuantity;
  const totalInitialSpending =
    inventoryAcquisitionCost +
    totalPackagingCost +
    shippingCost +
    marketingBudget +
    otherExpenses;

  const totalCashOutflow = totalInitialSpending + operatingExpenses;
  const potentialRevenue = effectiveUnitsSold * sellingPrice;

  // COGS corresponds to units actually sold in the scenario (inventory + packaging per sold unit)
  const cogsSold = effectiveUnitsSold * (unitCost + packagingCostPerUnit);
  const grossProfit = potentialRevenue - cogsSold;
  const netProfitEstimate =
    grossProfit - shippingCost - marketingBudget - operatingExpenses - otherExpenses;

  // Cash flow tracked separately from profit (initial capital + cash received - cash paid)
  const remainingCash = availableCapital + potentialRevenue - totalCashOutflow;
  const unsoldInventoryCostValue = unsoldUnits * (unitCost + packagingCostPerUnit);

  const contributionMarginPerUnit = sellingPrice - (unitCost + packagingCostPerUnit);
  const fixedExpenses =
    shippingCost + marketingBudget + operatingExpenses + otherExpenses;

  // Break-even units (only when contribution margin > 0, no division by zero)
  const breakEvenUnits =
    contributionMarginPerUnit > 0
      ? Math.ceil(fixedExpenses / contributionMarginPerUnit)
      : null;

  // Cash recovery units (units needed to recover total cash outflow at selling price)
  const capitalRecoveryUnits =
    sellingPrice > 0 ? Math.ceil(totalCashOutflow / sellingPrice) : null;

  const budgetUsagePercent =
    availableCapital > 0 ? (totalCashOutflow / availableCapital) * 100 : 100;

  // Capital at risk = cash spent upfront minus cash collected in scenario (worst-case or scenario net cash outflow)
  const capitalAtRisk = Math.max(0, totalCashOutflow - potentialRevenue);
  const exceedsBudgetBy = Math.max(0, totalCashOutflow - availableCapital);

  const worstCaseOutflowExceedsMaxLoss = totalCashOutflow > maxAcceptableLoss;
  const scenarioLoss = netProfitEstimate < 0 ? Math.abs(netProfitEstimate) : 0;
  const breachesMaxLoss =
    scenarioLoss > maxAcceptableLoss ||
    (effectiveUnitsSold === 0 && worstCaseOutflowExceedsMaxLoss) ||
    capitalAtRisk > maxAcceptableLoss;

  const usableBudgetBeforeReserve = Math.max(0, availableCapital - emergencyReserve);
  const touchesEmergencyReserve =
    emergencyReserve > 0 && totalCashOutflow > usableBudgetBeforeReserve;

  return {
    orderQuantity,
    effectiveUnitsSold,
    unsoldUnits,
    inventoryAcquisitionCost,
    totalPackagingCost,
    totalInitialSpending,
    totalCashOutflow,
    potentialRevenue,
    cogsSold,
    grossProfit,
    netProfitEstimate,
    remainingCash,
    unsoldInventoryCostValue,
    contributionMarginPerUnit,
    breakEvenUnits,
    capitalRecoveryUnits,
    budgetUsagePercent,
    capitalAtRisk,
    exceedsBudgetBy,
    breachesMaxLoss,
    touchesEmergencyReserve,
    isValid: validationErrors.length === 0,
    validationErrors,
  };
}

export function getActiveProduct(project: Project): ProductItem {
  return (
    project.products.find((p) => p.id === project.activeProductId) ??
    project.products[0]
  );
}
