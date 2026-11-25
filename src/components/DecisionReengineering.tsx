import React, { useMemo, useState } from 'react';
import { Check, Layers, RefreshCw } from 'lucide-react';
import type {
  CurrencyPrecision,
  Language,
  Project,
  TwinControls,
} from '../types/mihak';
import {
  calculateFinancialMetrics,
  formatOMR,
  getActiveProduct,
} from '../engine/financialEngine';
import { generateReengineeredPlans } from '../engine/riskEngine';

interface DecisionReengineeringProps {
  project: Project;
  language: Language;
  precision: CurrencyPrecision;
  onApplyToTwin: (controls: TwinControls, planName: string) => void;
}

export const DecisionReengineering: React.FC<DecisionReengineeringProps> = ({
  project,
  language,
  precision,
  onApplyToTwin,
}) => {
  const isAr = language === 'ar';
  const product = getActiveProduct(project);
  const [appliedId, setAppliedId] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const plans = useMemo(() => {
    void refreshTick;
    return generateReengineeredPlans(project, language);
  }, [project, language, refreshTick]);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2C6E8A]">
            <Layers className="w-4 h-4" />
            <span>{isAr ? 'إعادة هندسة القرار' : 'Decision Re-engineering Engine'}</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#353B40] mt-1">
            {isAr
              ? 'بدائل استراتيجية تحترم الحد الأدنى للمورد وتحمي رأس المال'
              : 'MOQ-Compliant Alternative Strategies'}
          </h1>
          <p className="text-xs text-[#686E74] mt-1">
            {isAr
              ? `الحد الأدنى للمورد المسجل: ${product.supplierMinOrderQty} وحدة. لا يقترح مِحَكّ كمية أقل من ذلك دون تفاوض أو مورد بديل أو حجز مسبق.`
              : `Recorded supplier MOQ: ${product.supplierMinOrderQty} units. MIHAK never recommends ordering below MOQ without negotiation, an alternative supplier, or pre-orders.`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setRefreshTick((t) => t + 1);
            setAppliedId(null);
          }}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2C6E8A] hover:bg-[#245B73] rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{isAr ? 'أعد هندسة قراري' : 'Re-engineer My Decision'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {plans.map((plan) => {
          const m = calculateFinancialMetrics(plan.controls, project.financial);
          const isApplied = appliedId === plan.id;

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl p-6 border flex flex-col justify-between space-y-5 ${
                plan.id === 'safe'
                  ? 'border-[#B5D8C5]'
                  : plan.id === 'balanced'
                    ? 'border-[#83BFD9]'
                    : 'border-[#D8B98C]'
              }`}
            >
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold text-[#2C6E8A]">
                    {plan.id === 'safe'
                      ? isAr
                        ? 'أقل مخاطرة'
                        : 'Lowest Exposure'
                      : plan.id === 'balanced'
                        ? isAr
                          ? 'توازن العائد والأمان'
                          : 'Balanced Margin'
                        : isAr
                          ? 'توسع مشروط'
                          : 'Conditional Scale'}
                  </span>
                  <h2 className="font-display text-xl font-bold text-[#353B40] mt-1">
                    {isAr ? plan.nameAr : plan.nameEn}
                  </h2>
                  <p className="text-xs text-[#686E74] mt-1 leading-relaxed">
                    {isAr ? plan.summaryAr : plan.summaryEn}
                  </p>
                </div>

                {/* Key Financial Numbers */}
                <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-4 space-y-2 text-xs font-mono-num">
                  <div className="flex justify-between">
                    <span className="text-[#686E74]">
                      {isAr ? 'الكمية / المبيعات المفترضة:' : 'Order / Sold:'}
                    </span>
                    <strong className="text-[#353B40]">
                      {plan.controls.orderQuantity} / {m.effectiveUnitsSold}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#686E74]">{isAr ? 'الاستثمار المطلوب:' : 'Required Spend:'}</span>
                    <strong className="text-[#2C6E8A]">
                      {formatOMR(m.totalInitialSpending, language, precision)}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#686E74]">{isAr ? 'الإيرادات المحتملة:' : 'Est. Revenue:'}</span>
                    <strong className="text-[#353B40]">
                      {formatOMR(m.potentialRevenue, language, precision)}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#686E74]">{isAr ? 'صافي النتيجة:' : 'Net Result:'}</span>
                    <strong className={m.netProfitEstimate >= 0 ? 'text-[#2E6B4E]' : 'text-[#A9443E]'}>
                      {formatOMR(m.netProfitEstimate, language, precision)}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#686E74]">{isAr ? 'الميزانية المتبقية:' : 'Remaining Cash:'}</span>
                    <strong className="text-[#353B40]">
                      {formatOMR(m.remainingCash, language, precision)}
                    </strong>
                  </div>
                </div>

                {/* MOQ Compliance */}
                <p className="text-[11px] bg-[#DCEEF8]/45 border border-[#83BFD9]/40 rounded-xl p-3 text-[#353B40]">
                  {plan.moqNote}
                </p>

                {/* Pros, Cons, Assumptions */}
                <div className="space-y-2.5 text-xs">
                  <div>
                    <p className="font-bold text-[#353B40] mb-1">
                      {isAr ? 'الافتراضات:' : 'Assumptions:'}
                    </p>
                    <ul className="list-disc list-inside text-[#686E74] space-y-0.5">
                      {plan.assumptions.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-[#2E6B4E] mb-1">
                      {isAr ? 'المزايا:' : 'Advantages:'}
                    </p>
                    <ul className="list-disc list-inside text-[#686E74] space-y-0.5">
                      {plan.advantages.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="font-bold text-[#A9443E] mb-1">
                      {isAr ? 'العيوب / القيود:' : 'Disadvantages:'}
                    </p>
                    <ul className="list-disc list-inside text-[#686E74] space-y-0.5">
                      {plan.disadvantages.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2 border-t border-[#F0EAE0]">
                    <p className="font-bold text-[#2C6E8A]">
                      {isAr ? 'الخطوة التالية الموصى بها:' : 'Recommended Next Step:'}
                    </p>
                    <p className="text-[#353B40] mt-0.5">{plan.recommendedNextStep}</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onApplyToTwin(plan.controls, isAr ? plan.nameAr : plan.nameEn);
                  setAppliedId(plan.id);
                }}
                className={`w-full py-2.5 px-4 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                  isApplied
                    ? 'bg-[#B5D8C5] text-[#23583D]'
                    : 'bg-[#2C6E8A] text-white hover:bg-[#245B73]'
                }`}
              >
                {isApplied && <Check className="w-4 h-4" />}
                <span>
                  {isApplied
                    ? isAr
                      ? 'تم التطبيق في التوأم التجاري'
                      : 'Applied to Digital Twin'
                    : isAr
                      ? 'تطبيق الخطة في التوأم التجاري'
                      : 'Apply Plan to Digital Twin'}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
