import React, { useMemo, useState } from 'react';
import {
  Check,
  Compass,
  Download,
  FileText,
  Fingerprint,
  Printer,
  Share2,
} from 'lucide-react';
import type {
  CurrencyPrecision,
  DecisionFingerprint,
  Language,
  Project,
} from '../types/mihak';
import {
  calculateFinancialMetrics,
  formatOMR,
  getActiveProduct,
} from '../engine/financialEngine';
import {
  buildFinalRecommendation,
  createDecisionFingerprintSnapshot,
  generateReengineeredPlans,
  generateReverseAssumptions,
} from '../engine/riskEngine';
import { MihakLogo } from './MihakLogo';

interface ReportsAndDecisionCenterProps {
  project: Project;
  language: Language;
  precision: CurrencyPrecision;
  onSaveFingerprint: (fp: DecisionFingerprint) => void;
}

export const ReportsAndDecisionCenter: React.FC<ReportsAndDecisionCenterProps> = ({
  project,
  language,
  precision,
  onSaveFingerprint,
}) => {
  const isAr = language === 'ar';
  const product = getActiveProduct(project);
  const [savedNotice, setSavedNotice] = useState('');

  const metrics = useMemo(
    () => calculateFinancialMetrics(project.twinControls, project.financial),
    [project.twinControls, project.financial]
  );

  const recommendation = useMemo(
    () => buildFinalRecommendation(project, metrics, language),
    [project, metrics, language]
  );

  const assumptions = useMemo(
    () => generateReverseAssumptions(project, metrics, language),
    [project, metrics, language]
  );

  const plans = useMemo(
    () => generateReengineeredPlans(project, language),
    [project, language]
  );

  const latestFp = project.fingerprints[project.fingerprints.length - 1];

  const handleStampFingerprint = () => {
    const fp = createDecisionFingerprintSnapshot(
      project,
      metrics,
      latestFp,
      language
    );
    onSaveFingerprint(fp);
    setSavedNotice(
      isAr
        ? `تم تسجيل بصمة القرار رقم ${fp.version} في السجل الزمني.`
        : `Saved Decision Fingerprint v${fp.version}.`
    );
    setTimeout(() => setSavedNotice(''), 3500);
  };

  const handleDownloadCSV = () => {
    const rows = [
      ['Metric', 'Value', 'Currency/Unit'],
      ['Project Name', project.name, ''],
      ['Product Name', product.name, ''],
      ['Available Capital', project.financial.availableCapital.toFixed(precision), 'OMR'],
      ['Max Acceptable Loss', project.financial.maxAcceptableLoss.toFixed(precision), 'OMR'],
      ['Order Quantity', String(project.twinControls.orderQuantity), 'Units'],
      ['Supplier MOQ', String(product.supplierMinOrderQty), 'Units'],
      ['Unit Cost', project.twinControls.unitCost.toFixed(precision), 'OMR'],
      ['Packaging Cost / Unit', project.twinControls.packagingCostPerUnit.toFixed(precision), 'OMR'],
      ['Selling Price', project.twinControls.sellingPrice.toFixed(precision), 'OMR'],
      ['Shipping Cost', project.twinControls.shippingCost.toFixed(precision), 'OMR'],
      ['Marketing Budget', project.twinControls.marketingBudget.toFixed(precision), 'OMR'],
      ['Initial Spending', metrics.totalInitialSpending.toFixed(precision), 'OMR'],
      ['Expected Units Sold', String(metrics.effectiveUnitsSold), 'Units'],
      ['Scenario Revenue', metrics.potentialRevenue.toFixed(precision), 'OMR'],
      ['Gross Profit', metrics.grossProfit.toFixed(precision), 'OMR'],
      ['Net Profit Estimate', metrics.netProfitEstimate.toFixed(precision), 'OMR'],
      ['Remaining Cash', metrics.remainingCash.toFixed(precision), 'OMR'],
      ['Unsold Units', String(metrics.unsoldUnits), 'Units'],
      ['Break-Even Units', String(metrics.breakEvenUnits ?? 'N/A'), 'Units'],
      ['Final Recommendation', isAr ? recommendation.titleAr : recommendation.titleEn, ''],
    ];

    const csv = '\uFEFF' + rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mihak_report_${project.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleShareSummary = async () => {
    const text = `${project.name}\n${isAr ? 'التوصية:' : 'Verdict:'} ${
      isAr ? recommendation.titleAr : recommendation.titleEn
    }\n${isAr ? 'الإنفاق:' : 'Initial Spend:'} ${formatOMR(
      metrics.totalInitialSpending,
      language,
      precision
    )}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: project.name, text });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(text);
    setSavedNotice(
      isAr ? 'تم نسخ ملخص التقرير للمشاركة.' : 'Report summary copied to clipboard.'
    );
    setTimeout(() => setSavedNotice(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Action Header (hidden when printing) */}
      <div className="no-print bg-white border border-[#E5DDD0] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2C6E8A]">
            <FileText className="w-4 h-4" />
            <span>
              {isAr
                ? 'مركز القرار النهائي وبصمة القرار والتقارير'
                : 'Final Decision Center, Fingerprint & Reports'}
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#353B40] mt-1">
            {project.name}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleStampFingerprint}
            className="px-3.5 py-2 text-xs font-semibold bg-[#DCEEF8] text-[#2C6E8A] hover:bg-[#83BFD9]/40 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Fingerprint className="w-4 h-4" />
            <span>{isAr ? 'حفظ بصمة القرار الحالية' : 'Stamp Decision Fingerprint'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-[#FAF8F4] border border-[#E5DDD0] hover:bg-[#DCEEF8]/50 rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
          </button>
          <button
            type="button"
            onClick={handlePrintPdf}
            className="px-3.5 py-2 text-xs font-semibold bg-[#2C6E8A] text-white hover:bg-[#245B73] rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isAr ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
          </button>
          <button
            type="button"
            onClick={handleShareSummary}
            className="px-3.5 py-2 text-xs font-semibold bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{isAr ? 'مشاركة' : 'Share'}</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="no-print p-3 rounded-xl bg-[#B5D8C5]/35 border border-[#B5D8C5] text-xs font-semibold text-[#23583D] flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Printable Report Header */}
      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-6 print-break-avoid">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5DDD0] pb-4">
          <div className="flex items-center gap-3">
            <MihakLogo size={36} />
            <div>
              <p className="font-display font-bold text-lg text-[#353B40]">
                مِحَكّ · MIHAK — {isAr ? 'تقرير ذكاء القرار التجاري' : 'Decision Intelligence Report'}
              </p>
              <p className="text-xs text-[#686E74]">
                {project.name} · {project.city}, {project.country} ·{' '}
                {new Date().toLocaleDateString(isAr ? 'ar-OM' : 'en-US')}
              </p>
            </div>
          </div>
          {product.images[0] && (
            <img
              src={product.images[0]}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-xl object-cover border border-[#E5DDD0]"
            />
          )}
        </div>

        {/* Final Decision Center Verdict */}
        <div className="bg-[#DCEEF8]/45 border border-[#83BFD9] rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2C6E8A]">
            <Compass className="w-4 h-4" />
            <span>{isAr ? 'توصية مركز القرار النهائي' : 'Final Decision Center Verdict'}</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#353B40]">
            {isAr ? recommendation.titleAr : recommendation.titleEn}
          </h2>
          <p className="text-sm text-[#353B40] leading-relaxed">
            {isAr ? recommendation.summaryAr : recommendation.summaryEn}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="bg-white/80 rounded-xl p-3.5 space-y-1">
              <p className="font-bold text-[#353B40]">{isAr ? 'لماذا صدرت هذه التوصية:' : 'Why Selected:'}</p>
              <ul className="list-disc list-inside text-[#686E74] space-y-0.5">
                {recommendation.whySelected.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
              <p className="font-bold text-[#353B40] pt-2">{isAr ? 'الأدلة الداعمة:' : 'Supporting Evidence:'}</p>
              <ul className="list-disc list-inside text-[#686E74] space-y-0.5">
                {recommendation.supportingEvidence.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white/80 rounded-xl p-3.5 space-y-1">
              <p className="font-bold text-[#353B40]">{isAr ? 'المعلومات الناقصة:' : 'Missing Information:'}</p>
              <ul className="list-disc list-inside text-[#686E74] space-y-0.5">
                {recommendation.missingInformation.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
              <p className="font-bold text-[#2C6E8A] pt-2">{isAr ? 'الخطوة التالية والشروط المغيِّرة:' : 'Next Steps & Pivot Conditions:'}</p>
              <ul className="list-disc list-inside text-[#353B40] space-y-0.5">
                {[...recommendation.nextSteps, ...recommendation.conditionsToChange].map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Financial Summary Table */}
        <div className="space-y-2">
          <h3 className="font-display text-base font-bold text-[#353B40]">
            {isAr ? 'الملخص المالي للسيناريو الحالي' : 'Current Scenario Financial Table'}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-num">
            <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3">
              <span className="text-[#686E74] block">{isAr ? 'رأس المال المتاح' : 'Available Capital'}</span>
              <strong className="text-sm">{formatOMR(project.financial.availableCapital, language, precision)}</strong>
            </div>
            <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3">
              <span className="text-[#686E74] block">{isAr ? 'الإنفاق الأولي' : 'Initial Spend'}</span>
              <strong className="text-sm text-[#2C6E8A]">{formatOMR(metrics.totalInitialSpending, language, precision)}</strong>
            </div>
            <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3">
              <span className="text-[#686E74] block">{isAr ? 'الإيرادات المقدرة' : 'Est. Revenue'}</span>
              <strong className="text-sm">{formatOMR(metrics.potentialRevenue, language, precision)}</strong>
            </div>
            <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3">
              <span className="text-[#686E74] block">{isAr ? 'صافي النتيجة / التعادل' : 'Net / Break-Even'}</span>
              <strong className="text-sm">
                {formatOMR(metrics.netProfitEstimate, language, precision)} · {metrics.breakEvenUnits ?? '—'}
              </strong>
            </div>
          </div>
        </div>

        {/* Original vs Re-engineered Plans Summary */}
        <div className="space-y-2 print-break-avoid">
          <h3 className="font-display text-base font-bold text-[#353B40]">
            {isAr ? 'مقارنة الخطط البديلة المتاحة' : 'Original & Alternative Plans Summary'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {plans.map((pl) => {
              const pm = calculateFinancialMetrics(pl.controls, project.financial);
              return (
                <div key={pl.id} className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3.5 space-y-1">
                  <p className="font-bold text-[#353B40]">{isAr ? pl.nameAr : pl.nameEn}</p>
                  <p className="font-mono-num text-[#2C6E8A]">
                    {isAr ? 'الإنفاق:' : 'Spend:'} {formatOMR(pm.totalInitialSpending, language, precision)}
                  </p>
                  <p className="font-mono-num text-[#686E74]">
                    {isAr ? 'الكمية:' : 'Qty:'} {pl.controls.orderQuantity} · {isAr ? 'الصافي:' : 'Net:'}{' '}
                    {formatOMR(pm.netProfitEstimate, language, precision)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Risks Snapshot */}
        <div className="space-y-2 print-break-avoid">
          <h3 className="font-display text-base font-bold text-[#353B40]">
            {isAr ? 'تقييم المخاطر العكسية' : 'Reverse Risk Assessment'}
          </h3>
          <ul className="space-y-1.5 text-xs text-[#686E74]">
            {assumptions.map((a) => (
              <li key={a.id} className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3">
                <strong className="text-[#353B40]">{a.title}:</strong> {a.failureScenario} ({a.severityReason})
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Decision Fingerprint & Version Timeline */}
      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-5 print-break-avoid">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-[#2C6E8A]" />
            <h2 className="font-display text-lg font-bold text-[#353B40]">
              {isAr ? 'بصمة القرار والسجل الزمني' : 'Decision Fingerprint & History Timeline'}
            </h2>
          </div>
          <span className="text-xs font-mono-num text-[#686E74]">
            {project.fingerprints.length} {isAr ? 'نسخ محفوظة' : 'Saved Versions'}
          </span>
        </div>

        {latestFp && (
          <div className="bg-gradient-to-br from-[#FAF8F4] to-[#DCEEF8]/45 border border-[#D8B98C] rounded-2xl p-5 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5DDD0] pb-2">
              <span className="font-display font-bold text-sm text-[#353B40]">
                {isAr ? `بطاقة بصمة القرار #${latestFp.version}` : `Decision Fingerprint Card #${latestFp.version}`}
              </span>
              <span className="font-mono-num text-[#686E74]">
                {new Date(latestFp.date).toLocaleString(isAr ? 'ar-OM' : 'en-US')}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p>
                  <strong>{isAr ? 'القرار الأصلي:' : 'Original Decision:'}</strong> {latestFp.originalDecision}
                </p>
                <p className="mt-1 font-mono-num">
                  <strong>{isAr ? 'الالتزام المالي:' : 'Financial Commitment:'}</strong>{' '}
                  {formatOMR(latestFp.financialCommitment, language, precision)}
                </p>
                <p className="mt-1">
                  <strong>{isAr ? 'التجربة المختارة:' : 'Selected Experiment:'}</strong> {latestFp.selectedExperiment}
                </p>
              </div>
              <div>
                <p>
                  <strong>{isAr ? 'النتيجة والتوصية:' : 'Final Outcome:'}</strong>{' '}
                  <span className="text-[#2C6E8A] font-bold">{latestFp.finalOutcome}</span>
                </p>
                {latestFp.changedFromPrevious && (
                  <div className="mt-2 p-2.5 bg-white/80 rounded-xl border border-[#83BFD9]/50">
                    <p className="font-bold text-[#2C6E8A]">
                      {isAr ? 'ما الذي تغير عن النسخة السابقة:' : 'What changed from previous version:'}
                    </p>
                    <ul className="list-disc list-inside text-[#353B40] mt-1">
                      {latestFp.changedFromPrevious.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="space-y-2 text-xs">
          {project.fingerprints
            .slice()
            .reverse()
            .map((fp) => (
              <div
                key={fp.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl"
              >
                <div>
                  <span className="font-mono-num font-bold text-[#2C6E8A]">v{fp.version}</span>
                  <span className="mx-2 text-[#686E74]">·</span>
                  <span className="font-semibold text-[#353B40]">{fp.originalDecision}</span>
                  <span className="mx-2 text-[#686E74]">·</span>
                  <span className="text-[#2C6E8A] font-semibold">{fp.finalOutcome}</span>
                </div>
                <span className="font-mono-num text-[#686E74]">
                  {formatOMR(fp.financialCommitment, language, precision)}
                </span>
              </div>
            ))}
        </div>

        <p className="text-[11px] text-[#686E74] border-t border-[#E5DDD0] pt-3">
          {isAr
            ? 'المصادر والقيود: يعتمد هذا التقرير على مدخلات المستخدم وافتراضات التوأم التجاري، ويميز بوضوح بين بيانات العرض التوضيحي واستجابات العملاء الفعلية، ولا يُعد ضماناً للأرباح.'
            : 'Sources & Limitations: This report relies strictly on user-entered figures, simulation assumptions, and recorded market test responses. Demo samples are labeled separately, and profits are never guaranteed.'}
        </p>
      </div>
    </div>
  );
};
