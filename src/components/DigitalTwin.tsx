import React, { useMemo, useState } from 'react';
import {
  GitCompare,
  Plus,
  RotateCcw,
  Save,
  Sliders,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type {
  CurrencyPrecision,
  Language,
  Project,
  SavedScenario,
  TwinControls,
} from '../types/mihak';
import {
  calculateFinancialMetrics,
  createDefaultTwinControls,
  formatOMR,
  getActiveProduct,
} from '../engine/financialEngine';
import { AnimatedCounter } from './AnimatedCounter';

interface DigitalTwinProps {
  project: Project;
  language: Language;
  precision: CurrencyPrecision;
  onUpdateTwin: (controls: TwinControls) => void;
  onSaveScenario: (scenario: SavedScenario) => void;
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({
  project,
  language,
  precision,
  onUpdateTwin,
  onSaveScenario,
}) => {
  const isAr = language === 'ar';
  const product = getActiveProduct(project);
  const controls = project.twinControls;

  const originalControls = useMemo(
    () =>
      project.savedScenarios[0]?.controls ??
      createDefaultTwinControls(product, project.financial),
    [project.savedScenarios, product, project.financial]
  );

  const [compareMode, setCompareMode] = useState(true);
  const [compareScenarioId, setCompareScenarioId] = useState<string>(
    project.savedScenarios[0]?.id || 'original'
  );
  const [scenarioName, setScenarioName] = useState('');
  const [saveToast, setSaveToast] = useState('');

  const modifiedMetrics = useMemo(
    () => calculateFinancialMetrics(controls, project.financial),
    [controls, project.financial]
  );

  const baselineControls = useMemo(() => {
    const found = project.savedScenarios.find((s) => s.id === compareScenarioId);
    return found ? found.controls : originalControls;
  }, [project.savedScenarios, compareScenarioId, originalControls]);

  const baselineMetrics = useMemo(
    () => calculateFinancialMetrics(baselineControls, project.financial),
    [baselineControls, project.financial]
  );

  const updateField = (patch: Partial<TwinControls>) => {
    const next = { ...controls, ...patch };
    if (patch.orderQuantity !== undefined) {
      next.orderQuantity = Math.max(1, Math.round(patch.orderQuantity));
      next.expectedUnitsSold = Math.min(
        next.orderQuantity,
        Math.round((next.orderQuantity * next.expectedSalesPercentage) / 100)
      );
    } else if (patch.expectedSalesPercentage !== undefined) {
      const pct = Math.min(100, Math.max(0, patch.expectedSalesPercentage));
      next.expectedSalesPercentage = pct;
      next.expectedUnitsSold = Math.round((next.orderQuantity * pct) / 100);
    } else if (patch.expectedUnitsSold !== undefined) {
      const sold = Math.min(next.orderQuantity, Math.max(0, Math.round(patch.expectedUnitsSold)));
      next.expectedUnitsSold = sold;
      next.expectedSalesPercentage =
        next.orderQuantity > 0 ? Math.round((sold / next.orderQuantity) * 100) : 0;
    }
    onUpdateTwin(next);
  };

  // Break-even curve points from 0 to orderQuantity
  const breakEvenSeries = useMemo(() => {
    const steps = 6;
    const arr = [];
    for (let i = 0; i <= steps; i++) {
      const units = Math.round((controls.orderQuantity * i) / steps);
      const rev = units * controls.sellingPrice;
      const totalCostAtUnits =
        controls.shippingCost +
        controls.marketingBudget +
        controls.operatingExpenses +
        controls.otherExpenses +
        units * (controls.unitCost + controls.packagingCostPerUnit);
      arr.push({
        units,
        revenue: Number(rev.toFixed(precision)),
        cost: Number(totalCostAtUnits.toFixed(precision)),
      });
    }
    return arr;
  }, [controls, precision]);

  const handleSave = () => {
    const label =
      scenarioName.trim() ||
      `${isAr ? 'سيناريو' : 'Scenario'} (${controls.orderQuantity} × ${controls.sellingPrice.toFixed(precision)})`;
    onSaveScenario({
      id: `scen_${Date.now().toString(36)}`,
      name: label,
      controls: { ...controls },
      notes: isAr ? 'تم حفظه من التوأم التجاري الرقمي' : 'Saved from Business Digital Twin',
      createdAt: new Date().toISOString(),
    });
    setScenarioName('');
    setSaveToast(isAr ? 'تم حفظ السيناريو للمقارنة.' : 'Scenario saved.');
    setTimeout(() => setSaveToast(''), 3000);
  };

  const handleReset = () => {
    onUpdateTwin(createDefaultTwinControls(product, project.financial));
  };

  const handleTryNewDecision = () => {
    // Sets a leaner MOQ test baseline so user sees immediate contrast
    const moq = Math.max(1, product.supplierMinOrderQty);
    const sold = Math.round(moq * 0.85);
    onUpdateTwin({
      ...controls,
      orderQuantity: moq,
      expectedUnitsSold: sold,
      expectedSalesPercentage: Math.round((sold / moq) * 100),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header + Actions */}
      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2C6E8A]">
            <Sliders className="w-4 h-4" />
            <span>{isAr ? 'التوأم التجاري الرقمي' : 'Business Digital Twin'}</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#353B40] mt-1">
            {isAr ? `محاكاة: ${product.name}` : `Simulating: ${product.name}`}
          </h1>
          <p className="text-xs text-[#686E74] mt-1">
            {isAr
              ? 'جميع النتائج هي محاكاة حسابية مبنية على افتراضاتك وليست توقعات مضمونة. الحد الأدنى للمورد:'
              : 'All figures are assumption-based simulations, not guaranteed forecasts. Supplier MOQ:'}{' '}
            <span className="font-mono-num font-bold text-[#353B40]">
              {product.supplierMinOrderQty}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleTryNewDecision}
            className="px-3.5 py-2 text-xs font-semibold text-[#353B40] bg-[#DCEEF8] hover:bg-[#83BFD9]/40 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAr ? 'جرّب قرارًا جديدًا' : 'Try New Decision'}</span>
          </button>
          <button
            type="button"
            onClick={() => setCompareMode((v) => !v)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 cursor-pointer ${
              compareMode
                ? 'bg-[#2C6E8A] text-white border-[#2C6E8A]'
                : 'bg-[#FAF8F4] text-[#353B40] border-[#E5DDD0]'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{isAr ? 'قارن السيناريوهات' : 'Compare Scenarios'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 text-xs font-semibold text-[#686E74] bg-[#FAF8F4] hover:text-[#353B40] border border-[#E5DDD0] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'أعد ضبط المحاكاة' : 'Reset Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Main Split: Interactive Sliders + Live KPI Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls */}
        <div className="lg:col-span-5 bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-[#353B40]">
            {isAr ? 'متغيرات القرار التفاعلية' : 'Interactive Decision Variables'}
          </h2>

          {controls.orderQuantity < product.supplierMinOrderQty && (
            <div className="p-3 rounded-xl bg-[#EBCB91]/30 border border-[#EBCB91] text-xs text-[#353B40]">
              {isAr
                ? `ملاحظة: الكمية المختارة (${controls.orderQuantity}) أقل من الحد الأدنى للمورد (${product.supplierMinOrderQty}). يتطلب ذلك تفاوضاً أو مورداً بديلاً.`
                : `Note: Selected quantity (${controls.orderQuantity}) is below supplier MOQ (${product.supplierMinOrderQty}), requiring negotiation or an alternative supplier.`}
            </div>
          )}

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>{isAr ? 'كمية الطلب (وحدة)' : 'Product Quantity'}</span>
                <span className="font-mono-num text-[#2C6E8A]">{controls.orderQuantity}</span>
              </div>
              <input
                type="range"
                min={1}
                max={Math.max(150, product.plannedOrderQty * 2)}
                value={controls.orderQuantity}
                onChange={(e) => updateField({ orderQuantity: Number(e.target.value) })}
                className="w-full mihak-slider"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>{isAr ? 'نسبة المبيعات المتوقعة (%)' : 'Expected Sales %'}</span>
                <span className="font-mono-num text-[#2C6E8A]">
                  {controls.expectedSalesPercentage}% ({controls.expectedUnitsSold}{' '}
                  {isAr ? 'وحدة' : 'units'})
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={controls.expectedSalesPercentage}
                onChange={(e) =>
                  updateField({ expectedSalesPercentage: Number(e.target.value) })
                }
                className="w-full mihak-slider"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-semibold mb-1">
                  {isAr ? 'تكلفة الوحدة (ر.ع)' : 'Unit Cost (OMR)'}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.100"
                  value={controls.unitCost}
                  onChange={(e) => updateField({ unitCost: Math.max(0, Number(e.target.value)) })}
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl font-mono-num"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  {isAr ? 'سعر البيع (ر.ع)' : 'Selling Price (OMR)'}
                </label>
                <input
                  type="number"
                  min={0.1}
                  step="0.100"
                  value={controls.sellingPrice}
                  onChange={(e) =>
                    updateField({ sellingPrice: Math.max(0.1, Number(e.target.value)) })
                  }
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl font-mono-num"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  {isAr ? 'التغليف / وحدة (ر.ع)' : 'Packaging / Unit'}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.050"
                  value={controls.packagingCostPerUnit}
                  onChange={(e) =>
                    updateField({ packagingCostPerUnit: Math.max(0, Number(e.target.value)) })
                  }
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl font-mono-num"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  {isAr ? 'الشحن الإجمالي (ر.ع)' : 'Shipping (OMR)'}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.500"
                  value={controls.shippingCost}
                  onChange={(e) =>
                    updateField({ shippingCost: Math.max(0, Number(e.target.value)) })
                  }
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl font-mono-num"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  {isAr ? 'ميزانية التسويق (ر.ع)' : 'Marketing (OMR)'}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.500"
                  value={controls.marketingBudget}
                  onChange={(e) =>
                    updateField({ marketingBudget: Math.max(0, Number(e.target.value)) })
                  }
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl font-mono-num"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  {isAr ? 'مصاريف تشغيلية (ر.ع)' : 'Operating Exp. (OMR)'}
                </label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={controls.operatingExpenses}
                  onChange={(e) =>
                    updateField({ operatingExpenses: Math.max(0, Number(e.target.value)) })
                  }
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl font-mono-num"
                />
              </div>
            </div>

            {/* Save Scenario Bar */}
            <div className="pt-3 border-t border-[#E5DDD0] flex items-center gap-2">
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder={isAr ? 'اسم السيناريو للحفظ...' : 'Scenario name...'}
                className="flex-1 px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 text-xs font-semibold bg-[#2C6E8A] text-white hover:bg-[#245B73] rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isAr ? 'احفظ السيناريو' : 'Save Scenario'}</span>
              </button>
            </div>
            {saveToast && <p className="text-xs font-semibold text-[#2E6B4E]">{saveToast}</p>}
          </div>
        </div>

        {/* Metrics & Chart */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              {
                label: isAr ? 'الاستثمار الأولي المطلوب' : 'Required Initial Investment',
                value: modifiedMetrics.totalInitialSpending,
                suffix: isAr ? 'ر.ع' : 'OMR',
              },
              {
                label: isAr ? 'رأس المال المتبقي (بعد المبيعات)' : 'Remaining Cash Flow',
                value: modifiedMetrics.remainingCash,
                suffix: isAr ? 'ر.ع' : 'OMR',
              },
              {
                label: isAr ? 'الإيرادات المحتملة' : 'Potential Revenue',
                value: modifiedMetrics.potentialRevenue,
                suffix: isAr ? 'ر.ع' : 'OMR',
              },
              {
                label: isAr ? 'إجمالي الربح (Gross)' : 'Estimated Gross Profit',
                value: modifiedMetrics.grossProfit,
                suffix: isAr ? 'ر.ع' : 'OMR',
              },
              {
                label: isAr ? 'صافي النتيجة التقديرية' : 'Estimated Net Result',
                value: modifiedMetrics.netProfitEstimate,
                suffix: isAr ? 'ر.ع' : 'OMR',
                tone: modifiedMetrics.netProfitEstimate >= 0 ? 'good' : 'bad',
              },
              {
                label: isAr ? 'استخدام الميزانية' : 'Budget Usage',
                value: modifiedMetrics.budgetUsagePercent,
                decimals: 1,
                suffix: '%',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E5DDD0] rounded-2xl p-4"
              >
                <p className="text-[11px] text-[#686E74]">{item.label}</p>
                <p
                  className={`text-lg font-bold mt-1 ${
                    item.tone === 'bad'
                      ? 'text-[#A9443E]'
                      : item.tone === 'good'
                        ? 'text-[#2E6B4E]'
                        : 'text-[#353B40]'
                  }`}
                >
                  <AnimatedCounter
                    value={item.value}
                    decimals={item.decimals ?? precision}
                    suffix={item.suffix}
                  />
                </p>
              </div>
            ))}
          </div>

          {/* Separate Unsold Inventory & Break-even */}
          <div className="bg-white border border-[#E5DDD0] rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-[#686E74]">
                {isAr ? 'المخزون غير المباع (منفصل عن الربح)' : 'Unsold Inventory (Separate)'}
              </p>
              <p className="font-mono-num font-bold text-base text-[#353B40] mt-1">
                {modifiedMetrics.unsoldUnits} {isAr ? 'وحدة' : 'units'} (
                {formatOMR(modifiedMetrics.unsoldInventoryCostValue, language, precision)})
              </p>
            </div>
            <div>
              <p className="text-[#686E74]">{isAr ? 'نقطة التعادل' : 'Break-Even Point'}</p>
              <p className="font-mono-num font-bold text-base text-[#2C6E8A] mt-1">
                {modifiedMetrics.breakEvenUnits !== null
                  ? `${modifiedMetrics.breakEvenUnits} ${isAr ? 'وحدة' : 'units'}`
                  : isAr
                    ? 'غير محققة (هامش سالب)'
                    : 'Not feasible'}
              </p>
            </div>
            <div>
              <p className="text-[#686E74]">
                {isAr ? 'وحدات استرداد السيولة الكاملة' : 'Cash Recovery Units'}
              </p>
              <p className="font-mono-num font-bold text-base text-[#353B40] mt-1">
                {modifiedMetrics.capitalRecoveryUnits ?? '—'} {isAr ? 'وحدة' : 'units'}
              </p>
            </div>
          </div>

          {/* Break-Even Chart */}
          <div className="bg-white border border-[#E5DDD0] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-[#353B40]">
                {isAr ? 'منحنى الإيرادات مقابل التكلفة الإجمالية' : 'Revenue vs Total Cost Curve'}
              </h3>
              <span className="text-[11px] text-[#686E74]">
                {isAr ? 'محاكاة حسب عدد الوحدات المباعة' : 'By units sold'}
              </span>
            </div>
            <div className="h-56 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={breakEvenSeries} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5DDD0" />
                  <XAxis dataKey="units" tick={{ fill: '#686E74', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#686E74', fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name={isAr ? 'الإيرادات' : 'Revenue'}
                    stroke="#2C6E8A"
                    fill="#DCEEF8"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    name={isAr ? 'التكلفة' : 'Cost'}
                    stroke="#D8B98C"
                    fill="#EBCB91"
                    fillOpacity={0.25}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Split-Screen Comparison */}
      {compareMode && (
        <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-[#353B40]">
                {isAr
                  ? 'مقارنة الشاشة المنقسمة: القرار الأصلي مقابل المعدّل'
                  : 'Split-Screen Comparison: Original vs Modified'}
              </h2>
              <p className="text-xs text-[#686E74]">
                {isAr
                  ? 'اختر سيناريو مرجعياً لمقارنته بنتائجك الحالية.'
                  : 'Select a saved baseline to compare against your live simulation.'}
              </p>
            </div>

            {project.savedScenarios.length > 0 && (
              <select
                value={compareScenarioId}
                onChange={(e) => setCompareScenarioId(e.target.value)}
                className="px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-xs font-semibold"
              >
                {project.savedScenarios.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Baseline Column */}
            <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-2xl p-5 space-y-3">
              <p className="text-xs font-bold text-[#686E74]">
                {isAr ? 'السيناريو المرجعي' : 'Baseline Decision'}
              </p>
              <div className="space-y-2 text-xs font-mono-num">
                <div className="flex justify-between">
                  <span>{isAr ? 'الكمية / المبيعات:' : 'Qty / Sold:'}</span>
                  <strong>
                    {baselineControls.orderQuantity} / {baselineMetrics.effectiveUnitsSold}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>{isAr ? 'الإنفاق المطلوب:' : 'Required Spend:'}</span>
                  <strong>{formatOMR(baselineMetrics.totalInitialSpending, language, precision)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{isAr ? 'الإيرادات:' : 'Revenue:'}</span>
                  <strong>{formatOMR(baselineMetrics.potentialRevenue, language, precision)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{isAr ? 'صافي النتيجة:' : 'Net Result:'}</span>
                  <strong>{formatOMR(baselineMetrics.netProfitEstimate, language, precision)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{isAr ? 'رأس المال المعرض للخطر:' : 'Capital at Risk:'}</span>
                  <strong>{formatOMR(baselineMetrics.capitalAtRisk, language, precision)}</strong>
                </div>
              </div>
            </div>

            {/* Modified Live Column */}
            <div className="bg-[#DCEEF8]/35 border border-[#83BFD9] rounded-2xl p-5 space-y-3">
              <p className="text-xs font-bold text-[#2C6E8A]">
                {isAr ? 'القرار المعدّل حالياً' : 'Current Modified Decision'}
              </p>
              <div className="space-y-2 text-xs font-mono-num">
                <div className="flex justify-between">
                  <span>{isAr ? 'الكمية / المبيعات:' : 'Qty / Sold:'}</span>
                  <strong>
                    {controls.orderQuantity} / {modifiedMetrics.effectiveUnitsSold}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>{isAr ? 'الإنفاق المطلوب:' : 'Required Spend:'}</span>
                  <strong>{formatOMR(modifiedMetrics.totalInitialSpending, language, precision)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{isAr ? 'الإيرادات:' : 'Revenue:'}</span>
                  <strong>{formatOMR(modifiedMetrics.potentialRevenue, language, precision)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{isAr ? 'صافي النتيجة:' : 'Net Result:'}</span>
                  <strong>{formatOMR(modifiedMetrics.netProfitEstimate, language, precision)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>{isAr ? 'رأس المال المعرض للخطر:' : 'Capital at Risk:'}</span>
                  <strong>{formatOMR(modifiedMetrics.capitalAtRisk, language, precision)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
