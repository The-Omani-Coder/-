import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Compass,
  Eye,
  FlaskConical,
  Layers,
  Shield,
  Sliders,
  Users,
} from 'lucide-react';
import type { Language } from '../types/mihak';
import { DEMO_IMAGES } from '../data/demoProject';
import { t } from '../i18n/translations';
import { MihakLogo } from './MihakLogo';
import { AnimatedCounter } from './AnimatedCounter';

interface LandingPageProps {
  language: Language;
  onToggleLanguage: () => void;
  onStartJourney: () => void;
  onLaunchDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  onToggleLanguage,
  onStartJourney,
  onLaunchDemo,
}) => {
  const isAr = language === 'ar';
  const copy = t(language);

  // Interactive landing page live mini-simulator ("جرّب بنفسك")
  const [simQty, setSimQty] = useState(50);
  const [simPrice, setSimPrice] = useState(5.0);
  const [simSoldPct, setSimSoldPct] = useState(70);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const simResult = useMemo(() => {
    const unitCost = 2.0;
    const pkgCost = 0.3;
    const fixed = 20; // shipping 10 + marketing 10
    const budget = 150;
    const totalSpending = simQty * (unitCost + pkgCost) + fixed;
    const soldUnits = Math.round((simQty * simSoldPct) / 100);
    const revenue = soldUnits * simPrice;
    const cogsSold = soldUnits * (unitCost + pkgCost);
    const netProfit = revenue - cogsSold - fixed;
    const remainingCash = budget + revenue - totalSpending;
    const unsoldUnits = simQty - soldUnits;
    const margin = simPrice - (unitCost + pkgCost);
    const breakEven = margin > 0 ? Math.ceil(fixed / margin) : null;
    return {
      totalSpending,
      soldUnits,
      revenue,
      netProfit,
      remainingCash,
      unsoldUnits,
      breakEven,
    };
  }, [simQty, simPrice, simSoldPct]);

  const faqs = isAr
    ? [
        {
          q: 'هل مِحَكّ يقدم ضماناً للربح أو توقعات سوقية مضمونة؟',
          a: 'لا. مِحَكّ منصة محاكاة واختبار قرارات تعتمد على أرقامك الفعلية وافتراضاتك ونتائج تجاربك مع العملاء، لتكتشف المخاطر قبل دفع رأس مالك.',
        },
        {
          q: 'هل أحتاج إلى إنشاء حساب لتجربة المنصة في الهاكاثون؟',
          a: 'يمكنك استخدام وضع الضيف مباشرة عبر زر "جرّب مشروعًا افتراضيًا" للوصول الكامل إلى مشروع "لمسة" التفاعلي وتعديل كل القيم والمحاكاة.',
        },
        {
          q: 'ما الذي يميز مِحَكّ عن جداول الإكسل التقليدية؟',
          a: 'مِحَكّ يربط بين التوأم التجاري، والمختبر العكسي الذي يكشف أسباب فشل الفكرة المحتملة، ودرع رأس المال، وإعادة هندسة القرار مع احترام الحد الأدنى للمورد، ومختبر العملاء الفعلي.',
        },
        {
          q: 'هل تحفظ بيانات مشروعي بشكل آمن؟',
          a: 'يتم حفظ مشاريعك محلياً في متصفحك مع إمكانية حذفها أو إعادة تعيين العرض التجريبي في أي وقت، ولا يتم مشاركة أي بيانات مالية تلقائياً.',
        },
      ]
    : [
        {
          q: 'Does MIHAK guarantee profits or live market forecasts?',
          a: 'No. MIHAK is a transparent simulation and decision-testing workbench built strictly on your inputs, assumptions, and validated customer tests before you commit capital.',
        },
        {
          q: 'Can I explore the full platform without creating an account?',
          a: 'Yes. Guest Mode gives instant access to the complete interactive "Lamsa" demo project where you can adjust numbers, test risks, and generate alternatives.',
        },
        {
          q: 'How is MIHAK different from a basic spreadsheet?',
          a: 'It unifies a Business Digital Twin, a Reverse Decision Lab that surfaces failure assumptions, Capital Shield limits, MOQ-aware Decision Re-engineering, and a live Customer Testing Lab.',
        },
        {
          q: 'How is my project data stored?',
          a: 'Projects are persisted locally in your browser with full delete and reset controls, and no financial transactions are ever executed.',
        },
      ];

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen bg-[#F5EFE6] text-[#353B40]">
      {/* 3-Zone Top Bar Contract */}
      <header className="sticky top-0 z-30 bg-[#FAF8F4]/90 backdrop-blur-md border-b border-[#E5DDD0]">
        <div className="max-w-[1360px] mx-auto px-6 py-3.5 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#top"
            className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C6E8A] rounded-lg"
          >
            <MihakLogo size={32} />
            <span className="font-display text-lg font-bold tracking-tight text-[#353B40]">
              {copy.brandName} · {copy.brandLatin}
            </span>
          </a>

          {/* Zone 2: 4 Nav Links + Clean Language Switcher */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#686E74]">
            <a
              href="#what-is"
              className="hover:text-[#353B40] transition-colors whitespace-nowrap shrink-0"
            >
              {copy.nav.whatIs}
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#353B40] transition-colors whitespace-nowrap shrink-0"
            >
              {copy.nav.howItWorks}
            </a>
            <a
              href="#innovations"
              className="hover:text-[#353B40] transition-colors whitespace-nowrap shrink-0"
            >
              {copy.nav.innovations}
            </a>
            <a
              href="#faq"
              className="hover:text-[#353B40] transition-colors whitespace-nowrap shrink-0"
            >
              {copy.nav.faq}
            </a>
            <button
              type="button"
              onClick={onToggleLanguage}
              className="hover:text-[#2C6E8A] transition-colors whitespace-nowrap shrink-0 cursor-pointer font-semibold"
            >
              {isAr ? 'English' : 'العربية'}
            </button>
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onToggleLanguage}
              className="lg:hidden px-3 py-2 text-xs font-semibold text-[#353B40] hover:text-[#2C6E8A] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isAr ? 'EN' : 'عربي'}
            </button>
            <button
              type="button"
              onClick={onStartJourney}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#2C6E8A] hover:bg-[#245B73] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
            >
              {copy.primaryCta}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="top"
        className="relative overflow-hidden bg-gradient-to-b from-[#FAF8F4] via-[#F5EFE6] to-[#DCEEF8]/35 border-b border-[#E5DDD0]"
      >
        <div className="max-w-[1360px] mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <div className="text-xs font-medium text-[#686E74] flex items-center gap-2">
              <span>{copy.tagline}</span>
              <span aria-hidden="true">·</span>
              <span>{copy.secondaryTagline}</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-[46px] font-bold leading-[1.24] text-[#353B40] max-w-2xl">
              {copy.heroHeadline}
            </h1>

            <p className="text-base sm:text-lg text-[#686E74] leading-relaxed max-w-xl">
              {copy.heroSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="button"
                onClick={onStartJourney}
                className="px-6 py-3.5 text-sm sm:text-base font-semibold text-white bg-[#2C6E8A] hover:bg-[#245B73] rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
              >
                <span>{copy.primaryCta}</span>
                <ArrowIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onLaunchDemo}
                className="px-6 py-3.5 text-sm sm:text-base font-semibold text-[#353B40] bg-white hover:bg-[#DCEEF8]/60 border border-[#D8B98C] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {copy.secondaryCta}
              </button>
            </div>

            <div className="pt-4 border-t border-[#E5DDD0] flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#686E74]">
              <span>
                {isAr ? 'مُصمّم للمشاريع الصغيرة والمنزلية في عُمان' : 'Built for SMEs & home businesses in Oman'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{isAr ? 'حسابات دقيقة بالريال العُماني (OMR)' : 'Precision OMR financial modeling'}</span>
              <span aria-hidden="true">·</span>
              <span>{isAr ? 'وضع الضيف متاح فوراً' : 'Instant Guest Demo Mode'}</span>
            </div>
          </div>

          {/* Right/Left Hero Visual + Live Decision Preview */}
          <div className="lg:col-span-6 flex flex-col gap-5">
            <div className="relative rounded-2xl overflow-hidden border border-[#E5DDD0] bg-white shadow-sm flex-1 min-h-[260px]">
              {!heroImgFailed ? (
                <img
                  src={DEMO_IMAGES.heroStudio}
                  alt={isAr ? 'استوديو تخطيط المشاريع الصغيرة في عُمان' : 'Omani small business design studio'}
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgFailed(true)}
                  className="w-full h-full object-cover min-h-[260px]"
                />
              ) : (
                <div className="w-full h-full min-h-[260px] bg-gradient-to-br from-[#FAF8F4] to-[#DCEEF8] flex flex-col items-center justify-center p-8 text-center">
                  <Compass className="w-12 h-12 text-[#2C6E8A] mb-3" />
                  <p className="font-display font-semibold text-[#353B40]">{copy.tagline}</p>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#353B40]/85 via-[#353B40]/45 to-transparent p-5 text-white">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#DCEEF8]">
                      {isAr ? 'معاينة المشروع الافتراضي · لمسة للعطور والهدايا' : 'Virtual Sandbox Preview · Lamsa Gifts & Perfumes'}
                    </p>
                    <p className="font-display text-base font-semibold mt-0.5">
                      {isAr ? 'اختبار دفعة 50 وحدة بميزانية 150.000 ر.ع' : 'Testing a 50-unit batch with 150.000 OMR capital'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onLaunchDemo}
                    className="px-4 py-2 text-xs font-semibold bg-white text-[#353B40] hover:bg-[#DCEEF8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {copy.tryYourself}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What MIHAK Does + How It Works */}
      <section id="what-is" className="max-w-[1360px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs font-semibold text-[#2C6E8A]">
              {isAr ? '01. ماذا يفعل مِحَكّ؟' : '01. What MIHAK Does'}
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#353B40]">
              {isAr
                ? 'مركز قيادة قرارات يحمي رأس مالك قبل الشراء الأول'
                : 'A decision command center that protects your capital before your first order'}
            </h2>
            <p className="text-[#686E74] leading-relaxed">
              {isAr
                ? 'معظم المشاريع الصغيرة والمنزلية تخسر رأس مالها بسبب طلب كميات كبيرة دون اختبار السعر أو تجاهل تكاليف التغليف والشحن أو التفاؤل المفرط بحجم المبيعات. مِحَكّ يحوّل فكرتك إلى توأم رقمي قابل للاختبار قبل إنفاق ريال واحد.'
                : 'Most small and home-based businesses lose capital by over-ordering stock, overlooking packaging and shipping costs, or assuming demand without testing. MIHAK turns your idea into a testable digital twin before you spend.'}
            </p>
          </div>

          <div id="how-it-works" className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                num: '01',
                title: isAr ? 'صِف مشروعك وامسح منتجك' : 'Define Venture & Scan Product',
                desc: isAr
                  ? 'أدخل رأس مالك وسقف الخسارة المقبولة وتكاليف المنتج، أو التقط صورة لمنتجك عبر عين مِحَكّ لتحليل التغليف والتموضع.'
                  : 'Enter capital, max loss ceiling, and unit costs—or photograph your item in MIHAK Vision for presentation insights.',
              },
              {
                num: '02',
                title: isAr ? 'شغّل التوأم التجاري والمختبر العكسي' : 'Run Digital Twin & Reverse Lab',
                desc: isAr
                  ? 'جرّب تغيير الكمية والسعر ونسبة البيع لحظياً، واكتشف الافتراضات الخفية التي قد تفشل قرارك.'
                  : 'Adjust quantity, price, and sell-through live while uncovering the hidden assumptions that could break the plan.',
              },
              {
                num: '03',
                title: isAr ? 'أعد هندسة القرار واختبر العملاء' : 'Re-engineer & Test With Buyers',
                desc: isAr
                  ? 'احصل على 3 خطط بديلة تحترم الحد الأدنى للمورد، وأرسل رابط استبيان حقيقي لقياس نية الشراء قبل التوريد.'
                  : 'Compare 3 MOQ-compliant plans and share a live survey link & QR code to measure real customer demand first.',
              },
              {
                num: '04',
                title: isAr ? 'احصل على التوصية وبصمة القرار' : 'Receive Verdict & Decision Fingerprint',
                desc: isAr
                  ? 'يجمع مركز القرار كل الأدلة المالية والعملاء ليوصيك بالبدء أو التعديل أو التأجيل مع حفظ تقرير بصمة القرار.'
                  : 'The Final Decision Center combines financial math and buyer evidence into an actionable verdict and printable report.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-2"
              >
                <span className="font-mono-num text-xs font-semibold text-[#2C6E8A]">
                  {step.num}
                </span>
                <h3 className="font-display text-base font-bold text-[#353B40]">{step.title}</h3>
                <p className="text-sm text-[#686E74] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Innovations Bento Grid */}
      <section
        id="innovations"
        className="bg-[#FAF8F4] border-y border-[#E5DDD0] py-16"
      >
        <div className="max-w-[1360px] mx-auto px-6 space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[#2C6E8A]">
                {isAr ? '02. الابتكارات الجوهرية' : '02. Core Innovations'}
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#353B40] mt-1">
                {isAr
                  ? 'ست منظومات متكاملة في بيئة واحدة'
                  : 'Six integrated decision engines in one command center'}
              </h2>
            </div>
            <button
              type="button"
              onClick={onLaunchDemo}
              className="px-4 py-2 text-sm font-semibold text-[#2C6E8A] bg-[#DCEEF8] hover:bg-[#83BFD9]/40 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isAr ? 'استكشفها في مشروع لمسة' : 'Explore Inside Lamsa Demo'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* Marquee Card 1 */}
            <div className="md:col-span-3 bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#DCEEF8] flex items-center justify-center text-[#2C6E8A]">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold">
                {isAr ? 'التوأم التجاري الرقمي' : 'Business Digital Twin'}
              </h3>
              <p className="text-sm text-[#686E74] leading-relaxed">
                {isAr
                  ? 'نسخة افتراضية متفاعلة لمشروعك تحسب التدفق النقدي، نقطة التعادل، الأرباح الصافية، والمخزون غير المباع بشكل منفصل فور تحريك أي مؤشر.'
                  : 'A live virtual replica of your venture calculating cash flow, break-even units, net profit, and unsold inventory separately in real time.'}
              </p>
            </div>

            {/* Marquee Card 2 */}
            <div className="md:col-span-3 bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#EBCB91]/35 flex items-center justify-center text-[#353B40]">
                <FlaskConical className="w-5 h-5" />
              </div>
              <h3 className="font-display text-lg font-bold">
                {isAr ? 'المختبر العكسي للقرار' : 'Reverse Decision Lab'}
              </h3>
              <p className="text-sm text-[#686E74] leading-relaxed">
                {isAr
                  ? 'بدلاً من البحث عن أسباب النجاح فقط، يعكس مِحَكّ القرار ليكشف الافتراضات الحرجة التي قد تؤدي لفشل الدفعة، ويقترح تجربة عملية منخفضة التكلفة قبل الالتزام.'
                  : 'Instead of only cheering for success, MIHAK stress-tests why a decision could fail and maps a clear test tree before committing funds.'}
              </p>
            </div>

            {/* 4 Supporting Bento Cards */}
            <div className="md:col-span-2 bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#B5D8C5]/40 flex items-center justify-center text-[#353B40]">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold">
                {isAr ? 'درع رأس المال والخط الأحمر' : 'Capital Shield & Red Line'}
              </h3>
              <p className="text-sm text-[#686E74]">
                {isAr
                  ? 'يراقب سقف الخسارة المقبولة واحتياطي الطوارئ وينبّهك عند تجاوز الخط الأحمر المالي.'
                  : 'Monitors max acceptable loss and emergency reserves with clear visual alerts.'}
              </p>
            </div>

            <div className="md:col-span-2 bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#D8B98C]/30 flex items-center justify-center text-[#353B40]">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold">
                {isAr ? 'إعادة هندسة القرار' : 'Decision Re-engineering'}
              </h3>
              <p className="text-sm text-[#686E74]">
                {isAr
                  ? 'يولّد خطة آمنة ومتوازنة ونمو تحترم الحد الأدنى للمورد (MOQ) وتُطبّق بضغطة زر.'
                  : 'Builds Safe, Balanced, and Growth plans that respect supplier minimum order quantities.'}
              </p>
            </div>

            <div className="md:col-span-2 bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#DCEEF8] flex items-center justify-center text-[#2C6E8A]">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base font-bold">
                {isAr ? 'عين مِحَكّ ومختبر العملاء' : 'Product Vision & Customer Lab'}
              </h3>
              <p className="text-sm text-[#686E74]">
                {isAr
                  ? 'فحص بصري للتغليف والتموضع مع صفحات اختبار عملاء ورمز QR حقيقية قبل الشراء.'
                  : 'Visual packaging analysis paired with real shareable customer validation surveys.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Demonstration ("جرّب بنفسك") */}
      <section className="max-w-[1360px] mx-auto px-6 py-16">
        <div className="bg-white border border-[#E5DDD0] rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs font-semibold text-[#2C6E8A]">
                {isAr ? '03. جرّب بنفسك الآن' : '03. Try It Yourself Now'}
              </p>
              <h2 className="font-display text-2xl font-bold text-[#353B40]">
                {isAr
                  ? 'محاكاة حية لمشروع "لمسة — هدايا وعطور"'
                  : 'Live Simulation: "Lamsa — Gifts & Perfumes"'}
              </h2>
              <p className="text-sm text-[#686E74] leading-relaxed">
                {isAr
                  ? 'حرّك الكمية والسعر ونسبة المبيعات المتوقعة وشاهد كيف تتغير السيولة المتبقية ونقطة التعادل فوراً (رأس المال المتاح: 150.000 ر.ع).'
                  : 'Adjust order quantity, unit selling price, and expected sell-through to watch cash flow and break-even update live (Capital: 150.000 OMR).'}
              </p>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span>{isAr ? 'كمية الطلب (الحد الأدنى للمورد: 20)' : 'Order Quantity (MOQ: 20)'}</span>
                    <span className="font-mono-num font-bold text-[#2C6E8A]">{simQty}</span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={80}
                    step={5}
                    value={simQty}
                    onChange={(e) => setSimQty(Number(e.target.value))}
                    className="w-full mihak-slider"
                    aria-label={isAr ? 'كمية الطلب' : 'Order Quantity'}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span>{isAr ? 'سعر البيع للوحدة (ر.ع)' : 'Selling Price (OMR)'}</span>
                    <span className="font-mono-num font-bold text-[#2C6E8A]">{simPrice.toFixed(3)}</span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={9}
                    step={0.25}
                    value={simPrice}
                    onChange={(e) => setSimPrice(Number(e.target.value))}
                    className="w-full mihak-slider"
                    aria-label={isAr ? 'سعر البيع' : 'Selling Price'}
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span>{isAr ? 'نسبة البيع المتوقعة' : 'Expected Sell-Through'}</span>
                    <span className="font-mono-num font-bold text-[#2C6E8A]">{simSoldPct}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={5}
                    value={simSoldPct}
                    onChange={(e) => setSimSoldPct(Number(e.target.value))}
                    className="w-full mihak-slider"
                    aria-label={isAr ? 'نسبة البيع المتوقعة' : 'Expected Sell-Through'}
                  />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-2xl p-4">
                <p className="text-xs text-[#686E74]">{isAr ? 'الإنفاق الأولي' : 'Initial Spending'}</p>
                <p className="text-lg font-bold mt-1 text-[#353B40]">
                  <AnimatedCounter value={simResult.totalSpending} suffix={isAr ? 'ر.ع' : 'OMR'} />
                </p>
              </div>
              <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-2xl p-4">
                <p className="text-xs text-[#686E74]">{isAr ? 'الإيرادات المتوقعة' : 'Scenario Revenue'}</p>
                <p className="text-lg font-bold mt-1 text-[#2C6E8A]">
                  <AnimatedCounter value={simResult.revenue} suffix={isAr ? 'ر.ع' : 'OMR'} />
                </p>
              </div>
              <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-2xl p-4">
                <p className="text-xs text-[#686E74]">{isAr ? 'صافي الربح التقديري' : 'Estimated Net Result'}</p>
                <p
                  className={`text-lg font-bold mt-1 ${
                    simResult.netProfit >= 0 ? 'text-[#2E6B4E]' : 'text-[#A9443E]'
                  }`}
                >
                  <AnimatedCounter value={simResult.netProfit} suffix={isAr ? 'ر.ع' : 'OMR'} />
                </p>
              </div>
              <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-2xl p-4">
                <p className="text-xs text-[#686E74]">{isAr ? 'السيولة النقدية المتبقية' : 'Remaining Cash'}</p>
                <p className="text-lg font-bold mt-1 text-[#353B40]">
                  <AnimatedCounter value={simResult.remainingCash} suffix={isAr ? 'ر.ع' : 'OMR'} />
                </p>
              </div>
              <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-2xl p-4">
                <p className="text-xs text-[#686E74]">{isAr ? 'مخزون غير مباع' : 'Unsold Inventory'}</p>
                <p className="text-lg font-bold mt-1 font-mono-num tabular-nums text-[#353B40]">
                  {simResult.unsoldUnits} {isAr ? 'وحدة' : 'units'}
                </p>
              </div>
              <div className="bg-[#DCEEF8]/60 border border-[#83BFD9]/50 rounded-2xl p-4">
                <p className="text-xs text-[#2C6E8A]">{isAr ? 'نقطة التعادل' : 'Break-Even'}</p>
                <p className="text-lg font-bold mt-1 font-mono-num tabular-nums text-[#353B40]">
                  {simResult.breakEven !== null
                    ? `${simResult.breakEven} ${isAr ? 'وحدة' : 'units'}`
                    : isAr
                      ? 'غير محققة'
                      : 'N/A'}
                </p>
              </div>
              <div className="col-span-2 sm:col-span-3 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E5DDD0]">
                <p className="text-xs text-[#686E74]">{copy.simulationDisclaimer}</p>
                <button
                  type="button"
                  onClick={onLaunchDemo}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2C6E8A] hover:bg-[#245B73] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isAr ? 'افتح المختبر الكامل' : 'Open Full Workbench'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits for Small Businesses */}
      <section className="bg-[#FAF8F4] border-y border-[#E5DDD0] py-14">
        <div className="max-w-[1360px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <Users className="w-5 h-5 text-[#2C6E8A]" />,
              title: isAr ? 'للمشاريع المنزلية والناشئة' : 'For Home & Emerging Businesses',
              body: isAr
                ? 'وضوح مالي بلغة بسيطة دون تعقيد محاسبي، مهيأ للريال العُماني وطبيعة المبيعات عبر إنستغرام وواتساب.'
                : 'Clear financial clarity without accounting jargon, tailored for OMR and social commerce.',
            },
            {
              icon: <Shield className="w-5 h-5 text-[#2C6E8A]" />,
              title: isAr ? 'لرواد الأعمال الطلبة' : 'For Student Entrepreneurs',
              body: isAr
                ? 'حوّل مشروع التخرج أو الفكرة الأولية إلى خطة قابلة للاختبار بأقل مخاطرة ممكنة على الميزانية الصغيرة.'
                : 'Turn campus ventures into testable hypotheses without risking limited student savings.',
            },
            {
              icon: <Compass className="w-5 h-5 text-[#2C6E8A]" />,
              title: isAr ? 'قبل توقيع أي طلب توريد' : 'Before Any Supplier Purchase',
              body: isAr
                ? 'لا يقترح مِحَكّ كميات مستحيلة تخالف الحد الأدنى للمورد، بل يصمم بدائل ذكية تحترم واقع السوق.'
                : 'Never suggests unrealistic batches below MOQ—instead designs practical negotiation or pre-order paths.',
            },
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#DCEEF8] flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="font-display text-base font-bold text-[#353B40]">{item.title}</h3>
              <p className="text-sm text-[#686E74] leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-[960px] mx-auto px-6 py-16 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold text-[#2C6E8A]">
            {isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#353B40]">
            {isAr ? 'وضوح كامل حول طريقة عمل مِحَكّ' : 'Clear answers on how MIHAK works'}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-white border border-[#E5DDD0] rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between gap-4 text-start font-display font-semibold text-sm sm:text-base text-[#353B40] hover:bg-[#FAF8F4] transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-[#686E74] transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-4 text-sm text-[#686E74] leading-relaxed border-t border-[#F0EAE0] pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Quiet Footer */}
      <footer className="bg-[#FAF8F4] border-t border-[#E5DDD0] py-10">
        <div className="max-w-[1360px] mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#686E74]">
          <div className="flex items-center gap-2.5">
            <MihakLogo size={26} />
            <span className="font-display font-bold text-[#353B40]">
              {copy.brandName} · {copy.brandLatin}
            </span>
            <span aria-hidden="true">·</span>
            <span>{copy.tagline}</span>
          </div>
          <div className="flex items-center gap-5 text-xs">
            <button
              type="button"
              onClick={onStartJourney}
              className="hover:text-[#353B40] cursor-pointer"
            >
              {copy.primaryCta}
            </button>
            <button
              type="button"
              onClick={onLaunchDemo}
              className="hover:text-[#353B40] cursor-pointer"
            >
              {copy.secondaryCta}
            </button>
            <button
              type="button"
              onClick={onToggleLanguage}
              className="hover:text-[#353B40] cursor-pointer"
            >
              {isAr ? 'English' : 'العربية'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
