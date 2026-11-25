import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  Check,
  Copy,
  ExternalLink,
  Plus,
  QrCode,
  Share2,
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
import type {
  CurrencyPrecision,
  Language,
  MarketExperiment,
  Project,
  SurveyResponse,
} from '../types/mihak';
import { DEMO_IMAGES } from '../data/demoProject';
import { formatOMR, getActiveProduct } from '../engine/financialEngine';

interface MicroMarketLabProps {
  project: Project;
  language: Language;
  precision: CurrencyPrecision;
  onAddExperiment: (exp: MarketExperiment) => void;
  onUpdateExperiment: (exp: MarketExperiment) => void;
}

export const MicroMarketLab: React.FC<MicroMarketLabProps> = ({
  project,
  language,
  precision,
  onAddExperiment,
  onUpdateExperiment,
}) => {
  const isAr = language === 'ar';
  const product = getActiveProduct(project);
  const [selectedExpId, setSelectedExpId] = useState<string>(
    project.experiments[0]?.id || ''
  );
  const [showBuilder, setShowBuilder] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Builder form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState<MarketExperiment['type']>('price_comparison');
  const [question, setQuestion] = useState('');
  const [varALabel, setVarALabel] = useState(product.name);
  const [varAPrice, setVarAPrice] = useState(product.sellingPrice);
  const [varBLabel, setVarBLabel] = useState(
    isAr ? 'خيار تغليف اقتصادي' : 'Lean Packaging Option'
  );
  const [varBPrice, setVarBPrice] = useState(
    Math.max(1, Number((product.sellingPrice - 0.5).toFixed(2)))
  );
  const [targetAudience, setTargetAudience] = useState(project.targetAudience);
  const [budget, setBudget] = useState(5);
  const [minResult, setMinResult] = useState(
    isAr ? '40% نية شراء عالية' : '40% high purchase intent'
  );

  // QR & Share URL state
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [publishing, setPublishing] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Manual response entry
  const [manualVariant, setManualVariant] = useState<'A' | 'B' | 'neither'>('A');
  const [manualPrice, setManualPrice] = useState<number>(product.sellingPrice);
  const [manualIntent, setManualIntent] = useState<'high' | 'medium' | 'low'>('high');
  const [manualObjection, setManualObjection] = useState('');
  const [manualComment, setManualComment] = useState('');

  const activeExp =
    project.experiments.find((e) => e.id === selectedExpId) ?? project.experiments[0];

  useEffect(() => {
    if (!activeExp) return;
    const targetUrl =
      activeExp.shareUrl ||
      `${window.location.origin}/?survey=${encodeURIComponent(activeExp.id)}`;
    QRCode.toDataURL(targetUrl, {
      width: 180,
      margin: 1,
      color: { dark: '#353B40', light: '#FFFFFF' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [activeExp]);

  const handleCreateExperiment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !question.trim()) return;
    const newExp: MarketExperiment = {
      id: `exp_${Date.now().toString(36)}`,
      title: title.trim(),
      type,
      question: question.trim(),
      variantA: {
        label: varALabel.trim() || product.name,
        price: varAPrice,
        image: product.images[0] || DEMO_IMAGES.primaryGiftSet,
      },
      variantB: {
        label: varBLabel.trim() || 'Variant B',
        price: varBPrice,
        image: product.images[1] || DEMO_IMAGES.variantLinenBox,
      },
      targetAudience,
      budget,
      minAcceptableResult: minResult,
      isDemo: false,
      createdAt: new Date().toISOString(),
      responses: [],
    };
    onAddExperiment(newExp);
    setSelectedExpId(newExp.id);
    setShowBuilder(false);
    setTitle('');
    setQuestion('');
  };

  const publishSurveyToServer = async () => {
    if (!activeExp) return;
    setPublishing(true);
    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: activeExp.id,
          projectId: project.id,
          projectName: project.name,
          title: activeExp.title,
          type: activeExp.type,
          question: activeExp.question,
          variantA: activeExp.variantA,
          variantB: activeExp.variantB,
          targetAudience: activeExp.targetAudience,
          responses: activeExp.responses,
        }),
      });
      if (res.ok) {
        const shareUrl = `${window.location.origin}/?survey=${encodeURIComponent(activeExp.id)}`;
        onUpdateExperiment({
          ...activeExp,
          shareUrl,
          isPublishedToServer: true,
        });
      }
    } finally {
      setPublishing(false);
    }
  };

  const refreshFromServer = async () => {
    if (!activeExp?.isPublishedToServer) return;
    try {
      const res = await fetch(`/api/surveys/${encodeURIComponent(activeExp.id)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.survey?.responses) {
          onUpdateExperiment({
            ...activeExp,
            responses: json.survey.responses,
          });
        }
      }
    } catch {
      // Ignore network hiccup
    }
  };

  const handleAddManualResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExp) return;
    const newResp: SurveyResponse = {
      id: `resp_${Date.now().toString(36)}`,
      chosenVariant: manualVariant,
      preferredPrice: Number(manualPrice) || activeExp.variantA.price,
      purchaseIntent: manualIntent,
      objection: manualObjection.trim() || (isAr ? 'لا يوجد' : 'None'),
      comment: manualComment.trim(),
      createdAt: new Date().toISOString(),
      isDemo: false,
    };
    onUpdateExperiment({
      ...activeExp,
      responses: [...activeExp.responses, newResp],
    });
    setManualObjection('');
    setManualComment('');
  };

  // Aggregated analytics
  const stats = useMemo(() => {
    if (!activeExp) {
      return {
        total: 0,
        realCount: 0,
        demoCount: 0,
        varACount: 0,
        varBCount: 0,
        neitherCount: 0,
        highIntent: 0,
        avgPreferredPrice: 0,
        chart: [],
        topObjections: [] as string[],
      };
    }
    const r = activeExp.responses;
    const total = r.length;
    const realCount = r.filter((x) => !x.isDemo).length;
    const demoCount = r.filter((x) => x.isDemo).length;
    const varACount = r.filter((x) => x.chosenVariant === 'A').length;
    const varBCount = r.filter((x) => x.chosenVariant === 'B').length;
    const neitherCount = r.filter((x) => x.chosenVariant === 'neither').length;
    const highIntent = r.filter((x) => x.purchaseIntent === 'high').length;
    const avgPreferredPrice =
      total > 0 ? r.reduce((s, x) => s + x.preferredPrice, 0) / total : 0;

    const objectionsMap = new Map<string, number>();
    for (const item of r) {
      if (item.objection && item.objection !== 'None' && item.objection !== 'لا يوجد') {
        objectionsMap.set(item.objection, (objectionsMap.get(item.objection) || 0) + 1);
      }
    }

    return {
      total,
      realCount,
      demoCount,
      varACount,
      varBCount,
      neitherCount,
      highIntent,
      avgPreferredPrice,
      chart: [
        { name: isAr ? 'النموذج أ' : 'Variant A', count: varACount },
        { name: isAr ? 'النموذج ب' : 'Variant B', count: varBCount },
        { name: isAr ? 'لا أفضّل أياً' : 'Neither', count: neitherCount },
      ],
      topObjections: Array.from(objectionsMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([k, v]) => `${k} (${v})`),
    };
  }, [activeExp, isAr]);

  const experimentTypes: Array<{ id: MarketExperiment['type']; ar: string; en: string }> = [
    { id: 'product_interest', ar: 'استبيان اهتمام بالمنتج', en: 'Product Interest Survey' },
    { id: 'price_comparison', ar: 'مقارنة الأسعار', en: 'Price Comparison' },
    { id: 'packaging_comparison', ar: 'مقارنة التغليف', en: 'Packaging Comparison' },
    { id: 'name_comparison', ar: 'مقارنة اسم المنتج', en: 'Product Name Comparison' },
    { id: 'purchase_intention', ar: 'قياس نية الشراء', en: 'Purchase Intention' },
    { id: 'reservation_interest', ar: 'اهتمام بالحجز غير الملزم', en: 'Non-binding Reservation' },
    { id: 'customer_preference', ar: 'اختبار تفضيل العملاء', en: 'Customer Preference Test' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2C6E8A]">
            <Users className="w-4 h-4" />
            <span>{isAr ? 'مختبر العملاء المصغّر' : 'Micro Market Testing Lab'}</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#353B40] mt-1">
            {isAr
              ? 'اختبر اهتمام العملاء الحقيقي قبل شراء المخزون'
              : 'Validate Real Customer Interest Before Buying Inventory'}
          </h1>
          <p className="text-xs text-[#686E74] mt-1">
            {isAr
              ? 'يميز مِحَكّ بوضوح بين "اهتمام العملاء بالاستبيان" وبين "عمليات الشراء الفعلية المكتملة".'
              : 'MIHAK clearly distinguishes survey interest from actual completed purchases.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowBuilder((v) => !v)}
          className="px-4 py-2.5 text-sm font-semibold text-white bg-[#2C6E8A] hover:bg-[#245B73] rounded-xl flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إنشاء تجربة عملاء جديدة' : 'New Customer Experiment'}</span>
        </button>
      </div>

      {/* Experiment Builder */}
      {showBuilder && (
        <form
          onSubmit={handleCreateExperiment}
          className="bg-white border border-[#83BFD9] rounded-2xl p-6 space-y-4"
        >
          <h2 className="font-display text-lg font-bold text-[#353B40]">
            {isAr ? 'بناء تجربة سوق مصغرة' : 'Build Micro Market Experiment'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold mb-1">{isAr ? 'عنوان التجربة *' : 'Title *'}</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isAr ? 'مثال: اختبار تغليف العيد' : 'e.g. Eid Packaging Test'}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">{isAr ? 'نوع التجربة' : 'Experiment Type'}</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MarketExperiment['type'])}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
              >
                {experimentTypes.map((et) => (
                  <option key={et.id} value={et.id}>
                    {isAr ? et.ar : et.en}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold mb-1">{isAr ? 'سؤال الاختبار للعميل *' : 'Survey Question *'}</label>
              <input
                type="text"
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={isAr ? 'أي خيار تفضل شراءه؟' : 'Which option would you purchase?'}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">{isAr ? 'النموذج أ (الاسم)' : 'Variant A Label'}</label>
              <input
                type="text"
                value={varALabel}
                onChange={(e) => setVarALabel(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">{isAr ? 'سعر النموذج أ (ر.ع)' : 'Variant A Price (OMR)'}</label>
              <input
                type="number"
                step="0.1"
                value={varAPrice}
                onChange={(e) => setVarAPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm font-mono-num"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">{isAr ? 'النموذج ب (الاسم)' : 'Variant B Label'}</label>
              <input
                type="text"
                value={varBLabel}
                onChange={(e) => setVarBLabel(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">{isAr ? 'سعر النموذج ب (ر.ع)' : 'Variant B Price (OMR)'}</label>
              <input
                type="number"
                step="0.1"
                value={varBPrice}
                onChange={(e) => setVarBPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm font-mono-num"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">{isAr ? 'الجمهور المستهدف' : 'Target Audience'}</label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">{isAr ? 'النتيجة الدنيا المقبولة' : 'Minimum Acceptable Result'}</label>
              <input
                type="text"
                value={minResult}
                onChange={(e) => setMinResult(e.target.value)}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">{isAr ? 'ميزانية التجربة (ر.ع)' : 'Experiment Budget (OMR)'}</label>
              <input
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm font-mono-num"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowBuilder(false)}
              className="px-4 py-2 text-xs font-semibold text-[#686E74] cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-[#2C6E8A] text-white rounded-xl cursor-pointer"
            >
              {isAr ? 'حفظ التجربة' : 'Save Experiment'}
            </button>
          </div>
        </form>
      )}

      {/* Experiment Selector Tabs */}
      {project.experiments.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {project.experiments.map((exp) => (
            <button
              key={exp.id}
              type="button"
              onClick={() => setSelectedExpId(exp.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                activeExp?.id === exp.id
                  ? 'bg-[#DCEEF8] border-[#2C6E8A] text-[#353B40]'
                  : 'bg-white border-[#E5DDD0] text-[#686E74]'
              }`}
            >
              {exp.title}
            </button>
          ))}
        </div>
      )}

      {activeExp && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Shareable Link, QR, Preview & Manual Response */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-base font-bold text-[#353B40]">
                  {isAr ? 'نشر التجربة ورمز QR' : 'Share Survey & QR Code'}
                </h2>
                {activeExp.isDemo && (
                  <span className="text-[11px] font-semibold text-[#7B4D0F]">
                    {isAr ? 'تتضمن بيانات توضيحية' : 'Contains Demo Data'}
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-4">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Survey QR Code"
                    className="w-28 h-28 rounded-lg border border-[#E5DDD0] bg-white p-1 shrink-0"
                  />
                )}
                <div className="space-y-2 text-xs w-full min-w-0">
                  <p className="font-bold text-[#353B40] flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-[#2C6E8A]" />
                    <span>
                      {activeExp.isPublishedToServer
                        ? isAr
                          ? 'رابط استبيان حي وقابل للمشاركة'
                          : 'Live Shareable Survey Link'
                        : isAr
                          ? 'معاينة محلية (اضغط نشر لتفعيل الرابط الحقيقي)'
                          : 'Local Preview (Click Publish for Live Link)'}
                    </span>
                  </p>
                  {activeExp.shareUrl && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={activeExp.shareUrl}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-[#E5DDD0] rounded-lg text-[11px] font-mono-num truncate"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(activeExp.shareUrl || '');
                          setCopiedUrl(true);
                          setTimeout(() => setCopiedUrl(false), 2000);
                        }}
                        className="p-2 bg-white border border-[#E5DDD0] rounded-lg cursor-pointer"
                        aria-label="Copy link"
                      >
                        {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#2E6B4E]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      disabled={publishing}
                      onClick={publishSurveyToServer}
                      className="px-3 py-1.5 text-xs font-semibold bg-[#2C6E8A] text-white rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>
                        {publishing
                          ? isAr
                            ? 'جارٍ النشر...'
                            : 'Publishing...'
                          : activeExp.isPublishedToServer
                            ? isAr
                              ? 'تحديث الرابط الحي'
                              : 'Refresh Live Link'
                            : isAr
                              ? 'نشر رابط حقيقي'
                              : 'Publish Live Survey'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#E5DDD0] rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>{isAr ? 'معاينة صفحة العميل' : 'Preview Page'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Manual Response Entry */}
              <form
                onSubmit={handleAddManualResponse}
                className="pt-3 border-t border-[#E5DDD0] space-y-3 text-xs"
              >
                <p className="font-bold text-[#353B40]">
                  {isAr ? 'إدخال استجابة عميل يدوياً' : 'Log Customer Response Manually'}
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block mb-1">{isAr ? 'الاختيار' : 'Choice'}</label>
                    <select
                      value={manualVariant}
                      onChange={(e) => setManualVariant(e.target.value as 'A' | 'B' | 'neither')}
                      className="w-full px-2.5 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl"
                    >
                      <option value="A">{isAr ? 'النموذج أ' : 'Variant A'}</option>
                      <option value="B">{isAr ? 'النموذج ب' : 'Variant B'}</option>
                      <option value="neither">{isAr ? 'لا شيء' : 'Neither'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">{isAr ? 'نية الشراء' : 'Purchase Intent'}</label>
                    <select
                      value={manualIntent}
                      onChange={(e) => setManualIntent(e.target.value as 'high' | 'medium' | 'low')}
                      className="w-full px-2.5 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl"
                    >
                      <option value="high">{isAr ? 'عالية (حجز مبدئي)' : 'High'}</option>
                      <option value="medium">{isAr ? 'متوسطة' : 'Medium'}</option>
                      <option value="low">{isAr ? 'منخفضة' : 'Low'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1">{isAr ? 'السعر المناسب (ر.ع)' : 'Preferred Price'}</label>
                    <input
                      type="number"
                      step="0.25"
                      value={manualPrice}
                      onChange={(e) => setManualPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl font-mono-num"
                    />
                  </div>
                  <div>
                    <label className="block mb-1">{isAr ? 'أبرز اعتراض' : 'Objection'}</label>
                    <input
                      type="text"
                      value={manualObjection}
                      onChange={(e) => setManualObjection(e.target.value)}
                      placeholder={isAr ? 'مثال: رسوم التوصيل' : 'e.g. Delivery fee'}
                      className="w-full px-2.5 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 text-xs font-semibold bg-[#FAF8F4] hover:bg-[#DCEEF8] border border-[#D8B98C] rounded-xl cursor-pointer"
                >
                  {isAr ? 'إضافة الاستجابة للنتائج' : 'Record Response'}
                </button>
              </form>
            </div>
          </div>

          {/* Results Dashboard */}
          <div className="lg:col-span-7 bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-lg font-bold text-[#353B40]">
                  {isAr ? 'لوحة نتائج المختبر' : 'Experiment Results Dashboard'}
                </h2>
                <p className="text-xs text-[#686E74]">
                  {isAr
                    ? `استجابات فعلية: ${stats.realCount} · استجابات توضيحية: ${stats.demoCount}`
                    : `Real responses: ${stats.realCount} · Demo responses: ${stats.demoCount}`}
                </p>
              </div>
              {activeExp.isPublishedToServer && (
                <button
                  type="button"
                  onClick={refreshFromServer}
                  className="px-3 py-1.5 text-xs font-semibold bg-[#DCEEF8] text-[#2C6E8A] rounded-lg cursor-pointer"
                >
                  {isAr ? 'تحديث الردود الحية' : 'Sync Live Responses'}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3">
                <p className="text-[#686E74]">{isAr ? 'إجمالي الردود' : 'Total Responses'}</p>
                <p className="font-mono-num font-bold text-lg mt-1">{stats.total}</p>
              </div>
              <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3">
                <p className="text-[#686E74]">{isAr ? 'نية شراء عالية' : 'High Intent'}</p>
                <p className="font-mono-num font-bold text-lg mt-1 text-[#2C6E8A]">
                  {stats.total > 0 ? Math.round((stats.highIntent / stats.total) * 100) : 0}%
                </p>
              </div>
              <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3">
                <p className="text-[#686E74]">{isAr ? 'متوسط السعر المقبول' : 'Avg Preferred Price'}</p>
                <p className="font-mono-num font-bold text-lg mt-1">
                  {formatOMR(stats.avgPreferredPrice, language, precision)}
                </p>
              </div>
              <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3">
                <p className="text-[#686E74]">{isAr ? 'المعيار الأدنى' : 'Target Threshold'}</p>
                <p className="font-semibold text-xs mt-1.5">{activeExp.minAcceptableResult}</p>
              </div>
            </div>

            <div className="h-48 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5DDD0" />
                  <XAxis dataKey="name" tick={{ fill: '#686E74', fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#686E74', fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#83BFD9" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Repeated Objections & Sample Size Limitation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-4 space-y-1.5">
                <p className="font-bold text-[#353B40]">
                  {isAr ? 'الاعتراضات المتكررة' : 'Repeated Objections'}
                </p>
                {stats.topObjections.length > 0 ? (
                  <ul className="list-disc list-inside text-[#686E74] space-y-1">
                    {stats.topObjections.map((o, i) => (
                      <li key={i}>{o}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#686E74]">{isAr ? 'لا توجد اعتراضات مسجلة بعد.' : 'None logged yet.'}</p>
                )}
              </div>

              <div className="bg-[#EBCB91]/25 border border-[#EBCB91] rounded-xl p-4 space-y-1.5">
                <p className="font-bold text-[#353B40]">
                  {isAr ? 'حدود العينة والتمييز المهم' : 'Sample Size & Purchase Distinction'}
                </p>
                <p className="text-[#353B40]/90 leading-relaxed">
                  {stats.realCount < 10
                    ? isAr
                      ? `حجم العينة الحقيقية (${stats.realCount}) ما زال صغيراً. تذكّر أن إبداء الاهتمام في الاستبيان لا يساوي عملية شراء مدفوعة مكتملة.`
                      : `Real sample size (${stats.realCount}) is still small. Note that survey interest is not equivalent to completed paid orders.`
                    : isAr
                      ? 'تم جمع عينة جيدة، مع التذكير بأن نية الشراء تظل مؤشراً أولياً وليست مبيعات فعلية.'
                      : 'Good sample collected; remember expressed intent remains an indicator rather than completed sales.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer-Facing Preview Modal */}
      {showPreviewModal && activeExp && (
        <div className="fixed inset-0 z-50 bg-[#353B40]/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5DDD0] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#E5DDD0] pb-3">
              <div>
                <p className="text-[11px] text-[#2C6E8A] font-semibold">
                  {isAr ? 'معاينة صفحة اختبار العميل' : 'Customer-Facing Test Page Preview'}
                </p>
                <h3 className="font-display text-lg font-bold text-[#353B40]">{activeExp.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-xs font-semibold text-[#686E74] cursor-pointer"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
            <p className="text-sm font-semibold text-[#353B40]">{activeExp.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[activeExp.variantA, activeExp.variantB].filter(Boolean).map((v, i) => (
                <div key={i} className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-2xl p-3 space-y-2">
                  {v?.image && (
                    <img
                      src={v.image}
                      alt={v.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-32 object-cover rounded-xl"
                    />
                  )}
                  <p className="text-xs font-bold text-[#353B40]">{v?.label}</p>
                  <p className="font-mono-num text-sm font-bold text-[#2C6E8A]">
                    {formatOMR(v?.price || 0, language, precision)}
                  </p>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-[#686E74]">
              {isAr
                ? 'ملاحظة: هذه الصفحة تقيس تفضيل العملاء ونية الشراء أو الحجز غير الملزم فقط ولا تجري أي دفع إلكتروني.'
                : 'Note: This test measures preference and non-binding intent only—no payment is processed.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
