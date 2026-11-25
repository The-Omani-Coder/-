import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  FlaskConical,
  GitBranch,
  HelpCircle,
  XCircle,
} from 'lucide-react';
import type { AssumptionRisk, CurrencyPrecision, Language, Project } from '../types/mihak';
import { calculateFinancialMetrics, formatOMR } from '../engine/financialEngine';
import { generateReverseAssumptions } from '../engine/riskEngine';

interface ReverseDecisionLabProps {
  project: Project;
  language: Language;
  precision: CurrencyPrecision;
  onUpdateAssumptions: (assumptions: AssumptionRisk[]) => void;
}

export const ReverseDecisionLab: React.FC<ReverseDecisionLabProps> = ({
  project,
  language,
  precision,
  onUpdateAssumptions,
}) => {
  const isAr = language === 'ar';
  const metrics = useMemo(
    () => calculateFinancialMetrics(project.twinControls, project.financial),
    [project.twinControls, project.financial]
  );

  const computedAssumptions = useMemo(() => {
    const fresh = generateReverseAssumptions(project, metrics, language);
    return fresh.map((item) => {
      const existing = project.assumptions.find((a) => a.id === item.id);
      return existing ? { ...item, testStatus: existing.testStatus } : item;
    });
  }, [project, metrics, language]);

  const [selectedId, setSelectedId] = useState<string>(computedAssumptions[0]?.id || 'assume_price');
  const [reverseStressActive, setReverseStressActive] = useState(false);

  const selected =
    computedAssumptions.find((a) => a.id === selectedId) ?? computedAssumptions[0];

  const handleStatusChange = (id: string, status: AssumptionRisk['testStatus']) => {
    const next = computedAssumptions.map((a) =>
      a.id === id ? { ...a, testStatus: status } : a
    );
    onUpdateAssumptions(next);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2C6E8A]">
            <FlaskConical className="w-4 h-4" />
            <span>{isAr ? 'المختبر العكسي للقرار' : 'Reverse Decision Lab'}</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#353B40] mt-1">
            {isAr
              ? 'اكتشف ما قد يُفشل فكرتك قبل أن تدفع المال'
              : 'Uncover What Could Break Your Decision Before Spending'}
          </h1>
          <p className="text-xs text-[#686E74] mt-1">
            {isAr
              ? 'تصنيف الخطورة مبني على قواعد مالية شفافة وتوفر الأدلة الفعلية، وليس على نسب احتمالية عشوائية.'
              : 'Risk severity uses transparent financial & evidence rules—no arbitrary probability percentages.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setReverseStressActive((v) => !v)}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2C6E8A] hover:bg-[#245B73] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {isAr ? 'اختبر عكس فكرتك' : 'Stress-Test Reverse Case'}
        </button>
      </div>

      {reverseStressActive && (
        <div className="bg-[#EBCB91]/25 border border-[#EBCB91] rounded-2xl p-5 space-y-2 text-xs">
          <p className="font-display font-bold text-sm text-[#353B40]">
            {isAr
              ? 'سيناريو عكس الفكرة: ماذا لو تحقق نصف المبيعات المتوقعة فقط؟'
              : 'Reverse Stress Test: What if only 50% of planned sales occur?'}
          </p>
          <p className="text-[#353B40]/90">
            {isAr
              ? `في حالة بيع ${Math.round(project.twinControls.expectedUnitsSold * 0.5)} وحدة فقط، سيبلغ المخزون غير المباع ${project.twinControls.orderQuantity - Math.round(project.twinControls.expectedUnitsSold * 0.5)} وحدة، ويصل رأس المال المعرض للخطر إلى ${formatOMR(
                  Math.max(
                    0,
                    metrics.totalCashOutflow -
                      Math.round(project.twinControls.expectedUnitsSold * 0.5) *
                        project.twinControls.sellingPrice
                  ),
                  language,
                  precision
                )}.`
              : `If only ${Math.round(project.twinControls.expectedUnitsSold * 0.5)} units sell, unsold inventory reaches ${project.twinControls.orderQuantity - Math.round(project.twinControls.expectedUnitsSold * 0.5)} units and capital at risk rises accordingly.`}
          </p>
        </div>
      )}

      {/* Assumption Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {computedAssumptions.map((item) => {
          const isSelected = selected?.id === item.id;
          const severityLabel =
            item.severity === 'high'
              ? isAr
                ? 'خطورة مرتفعة'
                : 'High Severity'
              : item.severity === 'medium'
                ? isAr
                  ? 'خطورة متوسطة'
                  : 'Medium Severity'
                : isAr
                  ? 'خطورة منخفضة'
                  : 'Low Severity';

          const severityBg =
            item.severity === 'high'
              ? 'bg-[#DC8983]/20 text-[#8F2F29] border-[#DC8983]'
              : item.severity === 'medium'
                ? 'bg-[#EBCB91]/35 text-[#7B4D0F] border-[#EBCB91]'
                : 'bg-[#B5D8C5]/35 text-[#23583D] border-[#B5D8C5]';

          return (
            <div
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`bg-white rounded-2xl p-6 border transition-colors cursor-pointer space-y-3 ${
                isSelected ? 'border-[#2C6E8A] ring-1 ring-[#2C6E8A]/20' : 'border-[#E5DDD0]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-base font-bold text-[#353B40]">{item.title}</h2>
                <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border shrink-0 ${severityBg}`}>
                  {severityLabel}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#686E74]">
                <p>
                  <strong className="text-[#353B40]">
                    {isAr ? 'سيناريو الفشل المحتمل:' : 'Potential Failure:'}
                  </strong>{' '}
                  {item.failureScenario}
                </p>
                <p>
                  <strong className="text-[#353B40]">
                    {isAr ? 'الأثر المالي المقدر:' : 'Est. Financial Impact:'}
                  </strong>{' '}
                  <span className="font-mono-num font-semibold text-[#353B40]">
                    {formatOMR(item.estimatedFinancialImpact, language, precision)}
                  </span>
                </p>
                <p>
                  <strong className="text-[#353B40]">
                    {isAr ? 'سبب التصنيف:' : 'Rule Explanation:'}
                  </strong>{' '}
                  {item.severityReason}
                </p>
              </div>

              <div className="pt-3 border-t border-[#F0EAE0] space-y-2 text-xs">
                <p className="text-[#2C6E8A] font-semibold">
                  {isAr ? 'التجربة العملية المقترحة:' : 'Recommended Experiment:'}{' '}
                  {item.recommendedExperiment} ({formatOMR(item.estimatedExperimentCost, language, precision)})
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {(['untested', 'testing', 'validated', 'invalidated'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusChange(item.id, st);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border cursor-pointer ${
                        item.testStatus === st
                          ? 'bg-[#2C6E8A] text-white border-[#2C6E8A]'
                          : 'bg-[#FAF8F4] text-[#686E74] border-[#E5DDD0]'
                      }`}
                    >
                      {st === 'untested'
                        ? isAr
                          ? 'لم يُختبر'
                          : 'Untested'
                        : st === 'testing'
                          ? isAr
                            ? 'قيد الاختبار'
                            : 'Testing'
                          : st === 'validated'
                            ? isAr
                              ? 'ثبت نجاحه'
                              : 'Validated'
                            : isAr
                              ? 'فشل الافتراض'
                              : 'Invalidated'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Decision Tree for Selected Assumption */}
      {selected && (
        <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#2C6E8A]" />
            <h2 className="font-display text-lg font-bold text-[#353B40]">
              {isAr
                ? 'شجرة القرار التفاعلية للافتراض المختار'
                : 'Interactive Decision Tree for Selected Assumption'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch text-xs">
            {/* Root Node */}
            <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#353B40]">
                <HelpCircle className="w-4 h-4 text-[#2C6E8A]" />
                <span>{isAr ? 'الافتراض والدليل الناقص' : 'Assumption & Missing Evidence'}</span>
              </div>
              <p className="font-semibold text-[#353B40]">{selected.title}</p>
              <p className="text-[#686E74]">
                <strong>{isAr ? 'الأدلة الحالية:' : 'Evidence:'}</strong> {selected.supportingEvidence}
              </p>
              <p className="text-[#686E74]">
                <strong>{isAr ? 'المعلومة الناقصة:' : 'Missing:'}</strong> {selected.missingInformation}
              </p>
              <p className="text-[#2C6E8A] font-medium">
                <strong>{isAr ? 'الدليل المطلوب قبل التنفيذ:' : 'Required Proof:'}</strong>{' '}
                {selected.evidenceNeeded}
              </p>
            </div>

            {/* Branch A: Test Succeeded */}
            <div className="bg-[#B5D8C5]/25 border border-[#B5D8C5] rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#23583D]">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isAr ? 'المسار أ: نجح الاختبار' : 'Outcome A: Test Passed'}</span>
              </div>
              <p className="text-[#353B40] leading-relaxed">{selected.branchPassedAction}</p>
            </div>

            {/* Branch B: Test Failed */}
            <div className="bg-[#DC8983]/20 border border-[#DC8983] rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#8F2F29]">
                <XCircle className="w-4 h-4" />
                <span>{isAr ? 'المسار ب: فشل الاختبار' : 'Outcome B: Test Failed'}</span>
              </div>
              <p className="text-[#353B40] leading-relaxed">{selected.branchFailedAction}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
