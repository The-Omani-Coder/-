import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Compass,
  Eye,
  FlaskConical,
  Layers,
  Plus,
  Radar,
  Shield,
  Sliders,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AppView, CurrencyPrecision, Language, Project, UserSession } from '../types/mihak';
import { calculateFinancialMetrics, formatOMR, getActiveProduct } from '../engine/financialEngine';
import { buildFinalRecommendation, generateOpportunities } from '../engine/riskEngine';
import { AnimatedCounter } from './AnimatedCounter';

interface DashboardHomeProps {
  project: Project;
  session: UserSession;
  language: Language;
  precision: CurrencyPrecision;
  onNavigate: (view: AppView) => void;
  onNewProject: () => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  project,
  session,
  language,
  precision,
  onNavigate,
  onNewProject,
}) => {
  const isAr = language === 'ar';
  const [selectedOppId, setSelectedOppId] = useState<string>('opp_cost');
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const product = getActiveProduct(project);
  const metrics = useMemo(
    () => calculateFinancialMetrics(project.twinControls, project.financial),
    [project.twinControls, project.financial]
  );
  const recommendation = useMemo(
    () => buildFinalRecommendation(project, metrics, language),
    [project, metrics, language]
  );
  const opportunities = useMemo(
    () => generateOpportunities(project, metrics, language),
    [project, metrics, language]
  );

  const selectedOpp =
    opportunities.find((o) => o.id === selectedOppId) ?? opportunities[0];

  const chartData = [
    {
      name: isAr ? 'رأس المال' : 'Capital',
      value: Number(project.financial.availableCapital.toFixed(precision)),
    },
    {
      name: isAr ? 'الإنفاق المخطط' : 'Planned Spend',
      value: Number(metrics.totalInitialSpending.toFixed(precision)),
    },
    {
      name: isAr ? 'الإيرادات المقدرة' : 'Est. Revenue',
      value: Number(metrics.potentialRevenue.toFixed(precision)),
    },
    {
      name: isAr ? 'صافي الربح' : 'Net Result',
      value: Number(metrics.netProfitEstimate.toFixed(precision)),
    },
  ];

  // Calculate journey completion based on real data present
  const journeySteps = [
    {
      label: isAr ? 'بيانات المشروع والمنتج' : 'Project & Product Data',
      done: project.products.length > 0 && project.financial.availableCapital > 0,
      view: 'wizard' as AppView,
    },
    {
      label: isAr ? 'فحص المنتج البصري' : 'Product Vision Scan',
      done: Boolean(product.visionNotes),
      view: 'vision' as AppView,
    },
    {
      label: isAr ? 'محاكاة التوأم التجاري' : 'Digital Twin Simulation',
      done: project.savedScenarios.length > 0,
      view: 'twin' as AppView,
    },
    {
      label: isAr ? 'اختبار العملاء الفعلي' : 'Customer Testing Lab',
      done: project.experiments.some((e) => e.responses.some((r) => !r.isDemo)),
      view: 'market-lab' as AppView,
    },
    {
      label: isAr ? 'بصمة القرار والتقرير' : 'Decision Fingerprint & Report',
      done: project.fingerprints.length > 0,
      view: 'reports' as AppView,
    },
  ];
  const completedCount = journeySteps.filter((s) => s.done).length;
  const journeyPct = Math.round((completedCount / journeySteps.length) * 100);

  const realResponsesCount = project.experiments.reduce(
    (acc, exp) => acc + exp.responses.filter((r) => !r.isDemo).length,
    0
  );

  return (
    <div className="space-y-6">
      {/* Welcome & Top Summary */}
      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#686E74]">
            <span>{isAr ? `مرحباً، ${session.name}` : `Welcome, ${session.name}`}</span>
            <span aria-hidden="true">·</span>
            <span>{project.city}, {project.country}</span>
            {project.isDemo && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-[#2C6E8A]">
                  {isAr ? 'مشروع عرض توضيحي تفاعلي' : 'Interactive Demo Project'}
                </span>
              </>
            )}
          </div>
          <h1 className="font-display text-2xl font-bold text-[#353B40]">{project.name}</h1>
          <p className="text-sm text-[#686E74] max-w-2xl">{project.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('twin')}
            className="px-4 py-2.5 text-sm font-semibold text-[#353B40] bg-[#FAF8F4] hover:bg-[#DCEEF8] border border-[#D8B98C] rounded-xl transition-colors cursor-pointer whitespace-nowrap"
          >
            {isAr ? 'فتح التوأم التجاري' : 'Open Digital Twin'}
          </button>
          <button
            type="button"
            onClick={onNewProject}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-[#2C6E8A] hover:bg-[#245B73] rounded-xl transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إنشاء مشروع جديد' : 'Create New Project'}</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5DDD0] rounded-2xl p-5">
          <p className="text-xs font-medium text-[#686E74]">
            {isAr ? 'الميزانية المتاحة' : 'Available Budget'}
          </p>
          <p className="text-2xl font-bold text-[#353B40] mt-2">
            <AnimatedCounter
              value={project.financial.availableCapital}
              decimals={precision}
              suffix={isAr ? 'ر.ع' : 'OMR'}
            />
          </p>
          <p className="text-xs text-[#686E74] mt-1.5 font-mono-num">
            {isAr ? 'الحد الأقصى للخسارة:' : 'Max Loss:'}{' '}
            {formatOMR(project.financial.maxAcceptableLoss, language, precision)}
          </p>
        </div>

        <div className="bg-white border border-[#E5DDD0] rounded-2xl p-5">
          <p className="text-xs font-medium text-[#686E74]">
            {isAr ? 'الاستثمار الأولي المخطط' : 'Planned Investment'}
          </p>
          <p className="text-2xl font-bold text-[#2C6E8A] mt-2">
            <AnimatedCounter
              value={metrics.totalInitialSpending}
              decimals={precision}
              suffix={isAr ? 'ر.ع' : 'OMR'}
            />
          </p>
          <p className="text-xs text-[#686E74] mt-1.5 font-mono-num">
            {metrics.budgetUsagePercent.toFixed(1)}%{' '}
            {isAr ? 'من رأس المال المتاح' : 'of available budget'}
          </p>
        </div>

        <div className="bg-white border border-[#E5DDD0] rounded-2xl p-5">
          <p className="text-xs font-medium text-[#686E74]">
            {isAr ? 'الإيرادات المقدرة (وفق الافتراضات)' : 'Est. Revenue (Assumed)'}
          </p>
          <p className="text-2xl font-bold text-[#353B40] mt-2">
            <AnimatedCounter
              value={metrics.potentialRevenue}
              decimals={precision}
              suffix={isAr ? 'ر.ع' : 'OMR'}
            />
          </p>
          <p className="text-xs text-[#686E74] mt-1.5 font-mono-num">
            {isAr
              ? `عند بيع ${metrics.effectiveUnitsSold} من ${metrics.orderQuantity} وحدة`
              : `Selling ${metrics.effectiveUnitsSold} of ${metrics.orderQuantity} units`}
          </p>
        </div>

        <div
          className={`border rounded-2xl p-5 ${
            metrics.breachesMaxLoss || metrics.exceedsBudgetBy > 0
              ? 'bg-[#DC8983]/15 border-[#DC8983]'
              : 'bg-[#B5D8C5]/25 border-[#B5D8C5]'
          }`}
        >
          <p className="text-xs font-medium text-[#353B40]">
            {isAr ? 'مؤشر المخاطر وحماية رأس المال' : 'Risk & Capital Shield'}
          </p>
          <p className="font-display text-lg font-bold text-[#353B40] mt-2">
            {metrics.exceedsBudgetBy > 0
              ? isAr
                ? 'تجاوز للميزانية'
                : 'Over Budget'
              : metrics.breachesMaxLoss
                ? isAr
                  ? 'يتجاوز حد الخسارة'
                  : 'Breaches Max Loss'
                : isAr
                  ? 'ضمن حدود الأمان'
                  : 'Within Risk Limits'}
          </p>
          <button
            type="button"
            onClick={() => onNavigate('capital-shield')}
            className="text-xs font-semibold text-[#2C6E8A] hover:underline mt-2 inline-flex items-center gap-1 cursor-pointer"
          >
            <span>{isAr ? 'فحص درع رأس المال' : 'Inspect Capital Shield'}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* What Will You Test Today? + Final Recommendation Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-bold text-[#353B40]">
              {isAr ? 'ماذا تختبر اليوم؟' : 'What Will You Test Today?'}
            </h2>
            <span className="text-xs text-[#686E74]">
              {isAr ? 'اختصارات تفاعلية مباشرة' : 'Interactive shortcuts'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                view: 'twin' as AppView,
                icon: <Sliders className="w-4 h-4 text-[#2C6E8A]" />,
                title: isAr ? 'اختبر تغيير السعر أو الكمية' : 'Test Price or Quantity Change',
                sub: isAr ? 'التوأم التجاري الرقمي' : 'Business Digital Twin',
              },
              {
                view: 'reverse-lab' as AppView,
                icon: <FlaskConical className="w-4 h-4 text-[#2C6E8A]" />,
                title: isAr ? 'اكتشف أسباب فشل القرار' : 'Uncover Failure Assumptions',
                sub: isAr ? 'المختبر العكسي للقرار' : 'Reverse Decision Lab',
              },
              {
                view: 'reengineer' as AppView,
                icon: <Layers className="w-4 h-4 text-[#2C6E8A]" />,
                title: isAr ? 'ولّد 3 خطط بديلة آمنة' : 'Generate 3 Alternative Plans',
                sub: isAr ? 'إعادة هندسة القرار' : 'Decision Re-engineering',
              },
              {
                view: 'market-lab' as AppView,
                icon: <Users className="w-4 h-4 text-[#2C6E8A]" />,
                title: isAr ? 'أنشئ استبيان عملاء و QR' : 'Launch Customer Survey & QR',
                sub: isAr ? 'مختبر العملاء المصغّر' : 'Micro Market Testing Lab',
              },
              {
                view: 'vision' as AppView,
                icon: <Eye className="w-4 h-4 text-[#2C6E8A]" />,
                title: isAr ? 'افحص تغليف المنتج بصرياً' : 'Scan Product Presentation',
                sub: isAr ? 'عين مِحَكّ البصرية' : 'MIHAK Product Vision',
              },
              {
                view: 'time-machine' as AppView,
                icon: <TrendingUp className="w-4 h-4 text-[#2C6E8A]" />,
                title: isAr ? 'حاكِ سيناريوهات 3–12 شهراً' : 'Simulate 3–12 Month Scenarios',
                sub: isAr ? 'آلة الزمن التجارية' : 'Commercial Time Machine',
              },
            ].map((shortcut) => (
              <button
                key={shortcut.view}
                type="button"
                onClick={() => onNavigate(shortcut.view)}
                className="p-4 bg-[#FAF8F4] hover:bg-[#DCEEF8]/50 border border-[#E5DDD0] rounded-xl text-start transition-colors flex items-start gap-3 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-[#E5DDD0] flex items-center justify-center shrink-0">
                  {shortcut.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#353B40] truncate">{shortcut.title}</p>
                  <p className="text-xs text-[#686E74] mt-0.5">{shortcut.sub}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Center Recommendation + Alerts + Journey */}
        <div className="lg:col-span-5 bg-white border border-[#E5DDD0] rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-[#686E74]">
              <span className="font-semibold text-[#2C6E8A]">
                {isAr ? 'توصية مركز القرار الحالية' : 'Current Final Decision Verdict'}
              </span>
              <span className="font-mono-num">
                {isAr ? `الاكتمال ${journeyPct}%` : `${journeyPct}% Journey`}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#DCEEF8]/45 border border-[#83BFD9]/50 space-y-2">
              <h3 className="font-display text-lg font-bold text-[#353B40]">
                {isAr ? recommendation.titleAr : recommendation.titleEn}
              </h3>
              <p className="text-xs text-[#353B40]/90 leading-relaxed">
                {isAr ? recommendation.summaryAr : recommendation.summaryEn}
              </p>
            </div>

            {/* Actionable Alerts */}
            <div className="space-y-2 pt-1">
              <p className="text-xs font-semibold text-[#686E74]">
                {isAr ? 'التنبيهات والتجارب المعلقة' : 'Active Alerts & Pending Tests'}
              </p>
              {metrics.breachesMaxLoss && (
                <div className="flex items-start gap-2 text-xs text-[#353B40] bg-[#EBCB91]/30 border border-[#EBCB91] rounded-xl p-3">
                  <AlertTriangle className="w-4 h-4 text-[#A96A1E] shrink-0 mt-0.5" />
                  <span>
                    {isAr
                      ? `رأس المال المعرض للخطر (${formatOMR(metrics.capitalAtRisk, language, precision)}) يتجاوز سقف الخسارة المقبولة (${formatOMR(project.financial.maxAcceptableLoss, language, precision)}).`
                      : `Capital at risk (${formatOMR(metrics.capitalAtRisk, language, precision)}) exceeds max acceptable loss.`}
                  </span>
                </div>
              )}
              {realResponsesCount === 0 && (
                <div className="flex items-start gap-2 text-xs text-[#353B40] bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3">
                  <Users className="w-4 h-4 text-[#2C6E8A] shrink-0 mt-0.5" />
                  <span>
                    {isAr
                      ? 'لا توجد استجابات عملاء حقيقية بعد (البيانات الحالية توضيحية). أطلق استبياناً من مختبر العملاء.'
                      : 'No real customer survey responses yet (current entries are demo data). Launch a live test in Customer Lab.'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5DDD0] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onNavigate('reports')}
              className="text-xs font-semibold text-[#2C6E8A] hover:underline cursor-pointer"
            >
              {isAr ? 'عرض مركز القرار وبصمة القرار' : 'Open Decision Center & Fingerprint'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('advisor')}
              className="px-3.5 py-2 text-xs font-semibold bg-[#2C6E8A] text-white hover:bg-[#245B73] rounded-xl transition-colors cursor-pointer"
            >
              {isAr ? 'اسأل مرشد مِحَكّ' : 'Ask Advisor'}
            </button>
          </div>
        </div>
      </div>

      {/* Financial Snapshot Chart + Opportunity Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-[#353B40]">
                {isAr ? 'الميزان المالي للسيناريو الحالي' : 'Current Scenario Financial Balance'}
              </h2>
              <p className="text-xs text-[#686E74]">
                {isAr ? 'مقارنة رأس المال والإنفاق والإيرادات المقدرة' : 'Capital vs planned spend & scenario revenue'}
              </p>
            </div>
            <span className="text-xs font-mono-num text-[#686E74]">OMR</span>
          </div>
          <div className="h-64 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5DDD0" />
                <XAxis dataKey="name" tick={{ fill: '#686E74', fontSize: 12 }} />
                <YAxis tick={{ fill: '#686E74', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5DDD0',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#83BFD9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-[#686E74]">
            {isAr
              ? 'ملاحظة: الأرقام محاكاة مبنية على افتراضات المستخدم وليست توقعات مضمونة.'
              : 'Note: Figures represent assumption-based simulation outputs, not guaranteed forecasts.'}
          </p>
        </div>

        {/* Opportunity Radar — رادار الفرص */}
        <div className="lg:col-span-6 bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radar className="w-5 h-5 text-[#2C6E8A]" />
              <div>
                <h2 className="font-display text-base font-bold text-[#353B40]">
                  {isAr ? 'رادار الفرص الذكي' : 'Opportunity Radar'}
                </h2>
                <p className="text-xs text-[#686E74]">
                  {isAr
                    ? 'فرص مشتقة من بيانات مشروعك فقط دون اختلاق اتجاهات سوقية'
                    : 'Opportunities derived strictly from your entered venture inputs'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {opportunities.map((opp) => (
              <button
                key={opp.id}
                type="button"
                onClick={() => setSelectedOppId(opp.id)}
                className={`p-3 rounded-xl border text-start transition-colors cursor-pointer ${
                  selectedOpp.id === opp.id
                    ? 'bg-[#DCEEF8]/60 border-[#2C6E8A] text-[#353B40]'
                    : 'bg-[#FAF8F4] border-[#E5DDD0] text-[#686E74] hover:text-[#353B40]'
                }`}
              >
                <p className="text-xs font-bold truncate">{opp.title}</p>
                <p className="text-[11px] mt-1">
                  {isAr ? 'صعوبة التنفيذ:' : 'Difficulty:'}{' '}
                  {opp.difficulty === 'low'
                    ? isAr
                      ? 'منخفضة'
                      : 'Low'
                    : opp.difficulty === 'medium'
                      ? isAr
                        ? 'متوسطة'
                        : 'Medium'
                      : isAr
                        ? 'عالية'
                        : 'High'}
                </p>
              </button>
            ))}
          </div>

          {selectedOpp && (
            <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-4 space-y-2 text-xs">
              <p className="font-bold text-[#353B40] text-sm">{selectedOpp.title}</p>
              <p className="text-[#686E74]">
                <strong className="text-[#353B40]">
                  {isAr ? 'لماذا اقترحناها:' : 'Why suggested:'}
                </strong>{' '}
                {selectedOpp.reason}
              </p>
              <p className="text-[#686E74]">
                <strong className="text-[#353B40]">
                  {isAr ? 'الافتراض المرتبط:' : 'Assumption:'}
                </strong>{' '}
                {selectedOpp.assumptions}
              </p>
              <p className="text-[#2C6E8A] font-medium">
                <strong>{isAr ? 'تجربة التحقق:' : 'Validation test:'}</strong>{' '}
                {selectedOpp.validationExperiment}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Journey Steps Bar */}
      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#2C6E8A]" />
            <h2 className="font-display text-sm font-bold text-[#353B40]">
              {isAr ? 'مسار القرار الكامل' : 'Full Decision Journey'}
            </h2>
          </div>
          <span className="text-xs font-mono-num text-[#686E74]">
            {completedCount} / {journeySteps.length}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {journeySteps.map((st, idx) => (
            <button
              key={st.view}
              type="button"
              onClick={() => onNavigate(st.view)}
              className={`p-3 rounded-xl border text-start transition-colors cursor-pointer ${
                st.done
                  ? 'bg-[#B5D8C5]/25 border-[#B5D8C5] text-[#353B40]'
                  : 'bg-[#FAF8F4] border-[#E5DDD0] text-[#686E74] hover:border-[#83BFD9]'
              }`}
            >
              <span className="font-mono-num text-[11px] font-semibold">0{idx + 1}</span>
              <p className="text-xs font-bold mt-0.5">{st.label}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
