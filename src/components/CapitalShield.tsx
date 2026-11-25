import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Shield, ShieldAlert } from 'lucide-react';
import type {
  CurrencyPrecision,
  FinancialProfile,
  Language,
  Project,
} from '../types/mihak';
import { calculateFinancialMetrics, formatOMR } from '../engine/financialEngine';

interface CapitalShieldProps {
  project: Project;
  language: Language;
  precision: CurrencyPrecision;
  onUpdateFinancial: (patch: Partial<FinancialProfile>) => void;
  onNavigateReengineer: () => void;
}

export const CapitalShield: React.FC<CapitalShieldProps> = ({
  project,
  language,
  precision,
  onUpdateFinancial,
  onNavigateReengineer,
}) => {
  const isAr = language === 'ar';
  const fin = project.financial;

  const metrics = useMemo(
    () => calculateFinancialMetrics(project.twinControls, fin),
    [project.twinControls, fin]
  );

  const redLineLimit = Math.max(0, fin.availableCapital - fin.emergencyReserve);
  const redLineBreached = metrics.totalCashOutflow > redLineLimit;
  const shieldState: 'protected' | 'caution' | 'breach' =
    metrics.exceedsBudgetBy > 0 || metrics.breachesMaxLoss
      ? 'breach'
      : redLineBreached
        ? 'caution'
        : 'protected';

  const shieldPct = Math.min(
    100,
    Math.round((metrics.totalCashOutflow / Math.max(1, fin.availableCapital)) * 100)
  );
  const redLinePct = Math.min(
    100,
    Math.round((redLineLimit / Math.max(1, fin.availableCapital)) * 100)
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2C6E8A]">
            <Shield className="w-4 h-4" />
            <span>{isAr ? 'درع رأس المال' : 'Capital Shield'}</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#353B40] mt-1">
            {isAr
              ? 'حماية السيولة والخط الأحمر المالي'
              : 'Liquidity Protection & Financial Red Line'}
          </h1>
        </div>
        <button
          type="button"
          onClick={onNavigateReengineer}
          className="px-4 py-2.5 text-xs font-semibold text-white bg-[#2C6E8A] hover:bg-[#245B73] rounded-xl transition-colors cursor-pointer"
        >
          {isAr ? 'عرض بدائل تقليل الإنفاق' : 'View Lower-Cost Alternatives'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Shield Limits Controls */}
        <div className="lg:col-span-5 bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-base font-bold text-[#353B40]">
            {isAr ? 'حدود الأمان المالية الخاصة بك' : 'Your Financial Safety Limits'}
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold mb-1">
                {isAr ? 'إجمالي الميزانية المتاحة (ر.ع)' : 'Total Available Budget (OMR)'}
              </label>
              <input
                type="number"
                min={1}
                step="5"
                value={fin.availableCapital}
                onChange={(e) =>
                  onUpdateFinancial({ availableCapital: Math.max(1, Number(e.target.value)) })
                }
                className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl font-mono-num text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">
                {isAr ? 'الحد الأقصى للخسارة المقبولة (ر.ع)' : 'Max Acceptable Loss (OMR)'}
              </label>
              <input
                type="number"
                min={0}
                step="5"
                value={fin.maxAcceptableLoss}
                onChange={(e) =>
                  onUpdateFinancial({ maxAcceptableLoss: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl font-mono-num text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">
                {isAr ? 'احتياطي الطوارئ (ر.ع)' : 'Emergency Reserve (OMR)'}
              </label>
              <input
                type="number"
                min={0}
                step="5"
                value={fin.emergencyReserve}
                onChange={(e) =>
                  onUpdateFinancial({ emergencyReserve: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl font-mono-num text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">
                {isAr ? 'أقصى إنفاق للتجارب الأولية (ر.ع)' : 'Max Experiment Spending (OMR)'}
              </label>
              <input
                type="number"
                min={0}
                step="1"
                value={fin.maxExperimentSpending}
                onChange={(e) =>
                  onUpdateFinancial({ maxExperimentSpending: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl font-mono-num text-sm"
              />
            </div>
          </div>
        </div>

        {/* Visual Shield & Red Line Meter */}
        <div className="lg:col-span-7 bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border ${
                shieldState === 'protected'
                  ? 'bg-[#B5D8C5]/35 border-[#B5D8C5] text-[#23583D]'
                  : shieldState === 'caution'
                    ? 'bg-[#EBCB91]/40 border-[#EBCB91] text-[#7B4D0F]'
                    : 'bg-[#DC8983]/25 border-[#DC8983] text-[#8F2F29]'
              }`}
            >
              {shieldState === 'protected' ? (
                <Shield className="w-8 h-8" />
              ) : (
                <ShieldAlert className="w-8 h-8" />
              )}
            </div>
            <div>
              <p className="text-xs text-[#686E74]">{isAr ? 'حالة الدرع المالي' : 'Shield Status'}</p>
              <h2 className="font-display text-xl font-bold text-[#353B40]">
                {shieldState === 'protected'
                  ? isAr
                    ? 'محمي — ضمن حدود الأمان'
                    : 'Protected — Within Safety Limits'
                  : shieldState === 'caution'
                    ? isAr
                      ? 'تنبيه — اقترب من احتياطي الطوارئ'
                      : 'Caution — Approaching Emergency Reserve'
                    : isAr
                      ? 'تحذير — تم تجاوز الخط الأحمر المالي أو سقف الخسارة'
                      : 'Alert — Financial Red Line or Max Loss Breached'}
              </h2>
            </div>
          </div>

          {/* الخط الأحمر المالي Bar */}
          <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-2xl p-5 space-y-3">
            <div className="flex justify-between text-xs font-semibold">
              <span>{isAr ? 'مؤشر الخط الأحمر المالي' : 'Financial Red Line Meter'}</span>
              <span className="font-mono-num">
                {formatOMR(metrics.totalCashOutflow, language, precision)} /{' '}
                {formatOMR(redLineLimit, language, precision)}
              </span>
            </div>
            <div className="relative h-4 bg-[#E5DDD0]/60 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  shieldState === 'breach'
                    ? 'bg-[#DC8983]'
                    : shieldState === 'caution'
                      ? 'bg-[#EBCB91]'
                      : 'bg-[#B5D8C5]'
                }`}
                style={{ width: `${shieldPct}%` }}
              />
              {/* Red Line Vertical Marker */}
              <div
                title={isAr ? 'الخط الأحمر المالي' : 'Financial Red Line'}
                className="absolute top-0 bottom-0 w-1 bg-[#A9443E]"
                style={{ insetInlineStart: `${redLinePct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#686E74]">
              <span>
                {isAr
                  ? `الخط الأحمر (بعد استبعاد احتياطي الطوارئ): ${formatOMR(redLineLimit, language, precision)}`
                  : `Red Line (excluding reserve): ${formatOMR(redLineLimit, language, precision)}`}
              </span>
              <span>{shieldPct}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3.5">
              <p className="text-[#686E74]">{isAr ? 'الإنفاق المخطط' : 'Planned Spend'}</p>
              <p className="font-mono-num font-bold text-sm mt-1">
                {formatOMR(metrics.totalCashOutflow, language, precision)}
              </p>
            </div>
            <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3.5">
              <p className="text-[#686E74]">{isAr ? 'المتبقي قبل المبيعات' : 'Unallocated Budget'}</p>
              <p className="font-mono-num font-bold text-sm mt-1">
                {formatOMR(
                  Math.max(0, fin.availableCapital - metrics.totalCashOutflow),
                  language,
                  precision
                )}
              </p>
            </div>
            <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3.5">
              <p className="text-[#686E74]">{isAr ? 'رأس المال المعرض للخطر' : 'Capital at Risk'}</p>
              <p className="font-mono-num font-bold text-sm mt-1 text-[#A9443E]">
                {formatOMR(metrics.capitalAtRisk, language, precision)}
              </p>
            </div>
          </div>

          {/* Warnings & Expense Reduction Suggestions */}
          <div className="space-y-2 text-xs">
            {metrics.exceedsBudgetBy > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[#DC8983]/20 border border-[#DC8983] text-[#353B40]">
                <AlertTriangle className="w-4 h-4 text-[#8F2F29] shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? `يتجاوز الإنفاق الميزانية المتاحة بمقدار ${formatOMR(metrics.exceedsBudgetBy, language, precision)}.`
                    : `Planned spending exceeds available budget by ${formatOMR(metrics.exceedsBudgetBy, language, precision)}.`}
                </span>
              </div>
            )}
            {metrics.breachesMaxLoss && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[#EBCB91]/30 border border-[#EBCB91] text-[#353B40]">
                <AlertTriangle className="w-4 h-4 text-[#7B4D0F] shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? `الخسارة المحتملة في السيناريو الحالي تتجاوز سقف الخسارة المقبولة (${formatOMR(fin.maxAcceptableLoss, language, precision)}). الحل: خفض الدفعة إلى الحد الأدنى للمورد أو تفعيل الحجز المسبق.`
                    : `Scenario risk exceeds max acceptable loss (${formatOMR(fin.maxAcceptableLoss, language, precision)}). Consider starting at MOQ or pre-orders.`}
                </span>
              </div>
            )}
            {!metrics.breachesMaxLoss && metrics.exceedsBudgetBy === 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[#B5D8C5]/30 border border-[#B5D8C5] text-[#23583D]">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  {isAr
                    ? 'الميزانية الحالية تحفظ احتياطي الطوارئ ولا تتجاوز الخط الأحمر المالي.'
                    : 'Current plan preserves emergency reserve and stays inside your financial red line.'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
