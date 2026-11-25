import React, { useState } from 'react';
import {
  BarChart3,
  Check,
  Copy,
  Megaphone,
  Plus,
  RefreshCw,
  Trash2,
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
import type {
  CompetitorEntry,
  CurrencyPrecision,
  Language,
  MarketingSavedAsset,
  Project,
} from '../types/mihak';
import { formatOMR, getActiveProduct } from '../engine/financialEngine';

interface CompetitorsViewProps {
  project: Project;
  language: Language;
  precision: CurrencyPrecision;
  onAddCompetitor: (c: CompetitorEntry) => void;
  onDeleteCompetitor: (id: string) => void;
}

export const CompetitorsView: React.FC<CompetitorsViewProps> = ({
  project,
  language,
  precision,
  onAddCompetitor,
  onDeleteCompetitor,
}) => {
  const isAr = language === 'ar';
  const product = getActiveProduct(project);
  const [name, setName] = useState('');
  const [prodName, setProdName] = useState('');
  const [price, setPrice] = useState<string>('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [channels, setChannels] = useState('Instagram');
  const [sourceLink, setSourceLink] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !prodName.trim()) return;
    onAddCompetitor({
      id: `comp_${Date.now().toString(36)}`,
      name: name.trim(),
      product: prodName.trim(),
      price: Math.max(0, Number(price) || 0),
      strengths: strengths.trim(),
      weaknesses: weaknesses.trim(),
      salesChannels: channels.trim(),
      sourceLink: sourceLink.trim(),
      dateCollected: new Date().toISOString().slice(0, 10),
      isDemo: false,
    });
    setName('');
    setProdName('');
    setPrice('');
    setStrengths('');
    setWeaknesses('');
    setSourceLink('');
  };

  const chartData = [
    {
      name: isAr ? 'منتجك الحالي' : 'Your Product',
      price: Number(project.twinControls.sellingPrice.toFixed(precision)),
    },
    ...project.competitors.map((c) => ({
      name: c.name.slice(0, 18),
      price: Number(c.price.toFixed(precision)),
    })),
  ];

  const avgCompPrice =
    project.competitors.length > 0
      ? project.competitors.reduce((s, c) => s + c.price, 0) / project.competitors.length
      : project.twinControls.sellingPrice;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#2C6E8A]">
          <BarChart3 className="w-4 h-4" />
          <span>{isAr ? 'ذكاء المنافسين' : 'Competitor Intelligence'}</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-[#353B40] mt-1">
          {isAr
            ? 'تحليل المنافسين المسجلين يدوياً'
            : 'Manually Documented Competitor Benchmarking'}
        </h1>
        <p className="text-xs text-[#686E74] mt-1">
          {isAr
            ? 'لا يختلق مِحَكّ أسماء منافسين أو أسعاراً غير موثقة. أضف المنافسين الذين لاحظتهم في السوق مع تاريخ ومصدر المعلومة.'
            : 'MIHAK never fabricates competitor names or live prices. Log real observed competitors with source links and collection dates.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Manual Entry Form */}
        <form
          onSubmit={handleAdd}
          className="lg:col-span-5 bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-3 text-xs"
        >
          <h2 className="font-display text-base font-bold text-[#353B40]">
            {isAr ? 'إضافة منافس جديد' : 'Add Competitor Entry'}
          </h2>
          <div>
            <label className="block font-semibold mb-1">{isAr ? 'اسم المنافس *' : 'Competitor Name *'}</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">{isAr ? 'المنتج *' : 'Product *'}</label>
              <input
                type="text"
                required
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">{isAr ? 'السعر (ر.ع)' : 'Price (OMR)'}</label>
              <input
                type="number"
                step="0.1"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl font-mono-num text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">{isAr ? 'نقاط القوة' : 'Strengths'}</label>
            <input
              type="text"
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">{isAr ? 'نقاط الضعف' : 'Weaknesses'}</label>
            <input
              type="text"
              value={weaknesses}
              onChange={(e) => setWeaknesses(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">{isAr ? 'قنوات البيع' : 'Sales Channels'}</label>
              <input
                type="text"
                value={channels}
                onChange={(e) => setChannels(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">{isAr ? 'رابط المصدر (اختياري)' : 'Source URL'}</label>
              <input
                type="url"
                value={sourceLink}
                onChange={(e) => setSourceLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 text-xs font-semibold bg-[#2C6E8A] text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة للمقارنة' : 'Add to Comparison'}</span>
          </button>
        </form>

        {/* Chart & Differentiation */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-3">
            <h2 className="font-display text-base font-bold text-[#353B40]">
              {isAr ? 'مقارنة الأسعار (ر.ع)' : 'Price Positioning Comparison (OMR)'}
            </h2>
            <div className="h-52 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5DDD0" />
                  <XAxis dataKey="name" tick={{ fill: '#686E74', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#686E74', fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="price" fill="#83BFD9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#DCEEF8]/45 border border-[#83BFD9]/50 rounded-2xl p-5 text-xs space-y-1.5">
            <p className="font-bold text-[#2C6E8A]">
              {isAr ? 'مقترحات التميز بناءً على البيانات المدخلة' : 'Differentiation Suggestions'}
            </p>
            <p className="text-[#353B40]">
              {project.twinControls.sellingPrice <= avgCompPrice
                ? isAr
                  ? `سعرك الحالي (${formatOMR(project.twinControls.sellingPrice, language, precision)}) أقل أو مساوٍ لمتوسط المنافسين المسجلين (${formatOMR(avgCompPrice, language, precision)}). يمكنك التميز بسرعة التسليم والتغليف الجاهز للإهداء.`
                  : `Your price (${formatOMR(project.twinControls.sellingPrice, language, precision)}) sits at or below logged average (${formatOMR(avgCompPrice, language, precision)}). Differentiate via ready-to-gift packaging and faster delivery.`
                : isAr
                  ? `سعرك (${formatOMR(project.twinControls.sellingPrice, language, precision)}) أعلى من المتوسط المسجل (${formatOMR(avgCompPrice, language, precision)}). تأكد من إبراز القيمة المضافة لـ "${product.name}" بوضوح.`
                  : `Your price is above logged competitor average. Highlight clear added value for "${product.name}".`}
            </p>
          </div>
        </div>
      </div>

      {/* Competitors Table */}
      <div className="bg-white border border-[#E5DDD0] rounded-2xl overflow-x-auto">
        <table className="w-full text-xs text-start">
          <thead className="bg-[#FAF8F4] border-b border-[#E5DDD0] text-[#686E74]">
            <tr>
              <th className="p-3.5 text-start">{isAr ? 'المنافس' : 'Competitor'}</th>
              <th className="p-3.5 text-start">{isAr ? 'المنتج' : 'Product'}</th>
              <th className="p-3.5 text-start">{isAr ? 'السعر' : 'Price'}</th>
              <th className="p-3.5 text-start">{isAr ? 'نقاط القوة' : 'Strengths'}</th>
              <th className="p-3.5 text-start">{isAr ? 'نقاط الضعف' : 'Weaknesses'}</th>
              <th className="p-3.5 text-start">{isAr ? 'التاريخ' : 'Date'}</th>
              <th className="p-3.5 text-start"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EAE0]">
            {project.competitors.map((c) => (
              <tr key={c.id} className="hover:bg-[#FAF8F4]/70">
                <td className="p-3.5 font-semibold text-[#353B40]">
                  {c.name}
                  {c.isDemo && (
                    <span className="block text-[10px] text-[#2C6E8A]">
                      {isAr ? 'مثال توضيحي' : 'Demo'}
                    </span>
                  )}
                </td>
                <td className="p-3.5 text-[#686E74]">{c.product}</td>
                <td className="p-3.5 font-mono-num font-bold text-[#2C6E8A]">
                  {formatOMR(c.price, language, precision)}
                </td>
                <td className="p-3.5 text-[#686E74]">{c.strengths}</td>
                <td className="p-3.5 text-[#686E74]">{c.weaknesses}</td>
                <td className="p-3.5 font-mono-num text-[#686E74]">{c.dateCollected}</td>
                <td className="p-3.5">
                  <button
                    type="button"
                    onClick={() => onDeleteCompetitor(c.id)}
                    className="p-1.5 text-[#A9443E] hover:bg-[#DC8983]/20 rounded-lg cursor-pointer"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface SmartMarketingViewProps {
  project: Project;
  language: Language;
  onSaveAsset: (asset: MarketingSavedAsset) => void;
}

export const SmartMarketingView: React.FC<SmartMarketingViewProps> = ({
  project,
  language,
  onSaveAsset,
}) => {
  const isAr = language === 'ar';
  const product = getActiveProduct(project);
  const [goal, setGoal] = useState(
    isAr ? 'اختبار الطلب وجمع حجوزات مبدئية' : 'Validate demand & collect pre-orders'
  );
  const [channel, setChannel] = useState('Instagram & WhatsApp');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const [draft, setDraft] = useState<MarketingSavedAsset>(() => ({
    id: 'mkt_draft',
    title: `${project.name} — ${channel}`,
    campaignConcept: isAr
      ? `حملة إطلاق تجريبية لمنتج "${product.name}" بسعر ${project.twinControls.sellingPrice.toFixed(3)} ر.ع تركز على الجاهزية للإهداء دون إنفاق إعلاني مبالغ فيه.`
      : `Lean launch test for "${product.name}" at ${project.twinControls.sellingPrice.toFixed(3)} OMR focused on gift-readiness without heavy ad spend.`,
    productDescription: product.description,
    captions: [
      isAr
        ? `هدية أنيقة تعبّر عن ذوقك وتصل جاهزة للإهداء ✨ "${product.name}" متوفر بدفعة أولى محدودة بسعر ${project.twinControls.sellingPrice.toFixed(3)} ر.ع. احجز نسختك المبدئية عبر الواتساب.`
        : `Ready-to-present "${product.name}" at ${project.twinControls.sellingPrice.toFixed(3)} OMR. Reserve from our limited pilot batch via WhatsApp.`,
      isAr
        ? `قبل أن نعتمد الدفعة القادمة: أي تغليف تفضّل لهديتك القادمة؟ شاركنا رأيك في الرابط.`
        : `Help shape our next drop—which packaging style fits your gifting occasion best?`,
    ],
    suggestedChannels: project.customerMarket.salesChannels,
    personaSummary: `${project.targetAudience} (${project.customerMarket.targetAgeGroup})`,
    abTestIdeas: [
      isAr
        ? 'اختبار مقارنة صورة العلبة مفتوحة مقابل مغلقة في أول 3 ثوانٍ'
        : 'Test open-box vs closed-box cover image on Instagram Reels',
      isAr
        ? 'اختبار عبارة "جاهز للإهداء الفوري" مقابل إبراز السعر المباشر'
        : 'Compare "Ready to Gift Today" headline vs direct price-first copy',
    ],
    contentCalendar: [
      isAr ? 'اليوم 1: فيديو كشف التغليف وتفاصيل المنتج' : 'Day 1: Packaging reveal short clip',
      isAr ? 'اليوم 3: استبيان تفاعلي في الستوري لاختيار التصميم' : 'Day 3: Story poll comparing two box looks',
      isAr ? 'اليوم 5: فتح الحجز المبدئي غير الملزم لـ 10 وحدات' : 'Day 5: Open non-binding reservation for 10 units',
    ],
    promotionalIdeas: [
      isAr
        ? 'بطاقة إهداء مكتوبة مجاناً لأول 10 طلبات حجز مبدئي'
        : 'Complimentary handwritten gift card for the first 10 pilot reservations',
    ],
    createdAt: new Date().toISOString(),
    source: 'template',
  }));

  const generateWithAI = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/ai/marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectContext: {
            name: project.name,
            product: product.name,
            price: project.twinControls.sellingPrice,
            marketingBudget: project.twinControls.marketingBudget,
            targetAudience: project.targetAudience,
            differentiation: project.customerMarket.productDifferentiation,
          },
          goal,
          channel,
          language,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || (isAr ? 'تعذر التوليد الذكي حالياً.' : 'AI generation unavailable.'));
        return;
      }
      setDraft({
        ...json.marketing,
        id: `mkt_${Date.now().toString(36)}`,
        title: `${project.name} — ${channel}`,
        createdAt: new Date().toISOString(),
        source: 'gemini',
      });
    } catch {
      setErrorMsg(
        isAr
          ? 'خدمة الذكاء الاصطناعي غير متوفرة حالياً، يمكنك تعديل القوالب المحلية ونسخها.'
          : 'AI service unavailable right now; you can customize and copy the local templates.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2C6E8A]">
            <Megaphone className="w-4 h-4" />
            <span>{isAr ? 'التسويق الذكي' : 'Smart Marketing Assistant'}</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#353B40] mt-1">
            {isAr
              ? 'محتوى وحملات عملية متوافقة مع ميزانيتك'
              : 'Practical Campaigns Tailored to Your Budget'}
          </h1>
          <p className="text-xs text-[#686E74] mt-1">
            {isAr
              ? `ميزانية التسويق المرصودة: ${project.twinControls.marketingBudget.toFixed(3)} ر.ع · لا يقوم مِحَكّ بنشر أي محتوى أو صرف أي مبالغ تلقائياً.`
              : `Allocated marketing budget: ${project.twinControls.marketingBudget.toFixed(3)} OMR · MIHAK never auto-publishes or spends ad money.`}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSaveAsset({ ...draft, id: `mkt_${Date.now().toString(36)}` })}
          className="px-4 py-2 text-xs font-semibold bg-[#FAF8F4] hover:bg-[#DCEEF8] border border-[#D8B98C] rounded-xl cursor-pointer"
        >
          {isAr ? 'حفظ المسودة في المشروع' : 'Save Draft to Project'}
        </button>
      </div>

      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs items-end">
          <div>
            <label className="block font-semibold mb-1">{isAr ? 'هدف الحملة' : 'Campaign Goal'}</label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">{isAr ? 'القناة الأساسية' : 'Channel'}</label>
            <input
              type="text"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={generateWithAI}
            className="py-2.5 px-4 text-xs font-semibold bg-[#2C6E8A] hover:bg-[#245B73] text-white rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{isAr ? 'توليد أفكار تسويقية ذكية' : 'Generate AI Marketing Plan'}</span>
          </button>
        </div>

        {errorMsg && (
          <p className="text-xs text-[#7B4D0F] bg-[#EBCB91]/25 border border-[#EBCB91] rounded-xl p-3">
            {errorMsg}
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2 text-xs">
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-[#353B40] mb-1">
                {isAr ? 'فكرة الحملة (قابلة للتعديل)' : 'Campaign Concept (Editable)'}
              </label>
              <textarea
                rows={3}
                value={draft.campaignConcept}
                onChange={(e) => setDraft({ ...draft, campaignConcept: e.target.value })}
                className="w-full p-3 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-[#353B40] mb-1">
                {isAr ? 'وصف المنتج المقترح' : 'Product Description'}
              </label>
              <textarea
                rows={3}
                value={draft.productDescription}
                onChange={(e) => setDraft({ ...draft, productDescription: e.target.value })}
                className="w-full p-3 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-xs"
              />
            </div>

            <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-4 space-y-1.5">
              <p className="font-bold text-[#353B40]">
                {isAr ? 'شخصية العميل والقنوات المقترحة' : 'Customer Persona & Channels'}
              </p>
              <p className="text-[#686E74]">{draft.personaSummary}</p>
              <p className="text-[#2C6E8A] font-semibold">
                {draft.suggestedChannels.join(' · ')}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-bold text-[#353B40]">
              {isAr ? 'نصوص منشورات جاهزة للنسخ' : 'Ready-to-Copy Social Captions'}
            </p>
            {draft.captions.map((cap, idx) => (
              <div
                key={idx}
                className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3 flex items-start justify-between gap-3"
              >
                <p className="text-[#353B40] leading-relaxed">{cap}</p>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(cap);
                    setCopiedIdx(idx);
                    setTimeout(() => setCopiedIdx(null), 1800);
                  }}
                  className="p-2 bg-white border border-[#E5DDD0] rounded-lg shrink-0 cursor-pointer"
                  aria-label="Copy caption"
                >
                  {copiedIdx === idx ? (
                    <Check className="w-3.5 h-3.5 text-[#2E6B4E]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#686E74]" />
                  )}
                </button>
              </div>
            ))}

            <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-4 space-y-1.5">
              <p className="font-bold text-[#353B40]">
                {isAr ? 'خطة المحتوى واختبارات A/B' : 'Content Calendar & A/B Tests'}
              </p>
              <ul className="list-disc list-inside text-[#686E74] space-y-1">
                {[...draft.contentCalendar, ...draft.abTestIdeas].map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
