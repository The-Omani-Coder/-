import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Language } from '../types/mihak';
import { MihakLogo } from './MihakLogo';

interface PublicSurveyPageProps {
  surveyId: string;
  language: Language;
  onExitToApp: () => void;
}

interface RemoteSurvey {
  id: string;
  projectName: string;
  title: string;
  question: string;
  variantA: { label: string; price: number; image?: string; description?: string };
  variantB?: { label: string; price: number; image?: string; description?: string };
}

export const PublicSurveyPage: React.FC<PublicSurveyPageProps> = ({
  surveyId,
  language,
  onExitToApp,
}) => {
  const isAr = language === 'ar';
  const [survey, setSurvey] = useState<RemoteSurvey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chosenVariant, setChosenVariant] = useState<'A' | 'B' | 'neither'>('A');
  const [preferredPrice, setPreferredPrice] = useState<number>(5);
  const [purchaseIntent, setPurchaseIntent] = useState<'high' | 'medium' | 'low'>('high');
  const [objection, setObjection] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/surveys/${encodeURIComponent(surveyId)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error('Not found');
        const data = await r.json();
        setSurvey(data.survey);
        setPreferredPrice(data.survey.variantA?.price || 5);
      })
      .catch(() => {
        setError(
          isAr
            ? 'تعذر العثور على رابط التجربة المطلوب.'
            : 'Requested customer test could not be found.'
        );
      })
      .finally(() => setLoading(false));
  }, [surveyId, isAr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/surveys/${encodeURIComponent(surveyId)}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chosenVariant,
        preferredPrice,
        purchaseIntent,
        objection,
        comment,
      }),
    });
    if (res.ok) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-white border border-[#E5DDD0] rounded-3xl p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-[#E5DDD0] pb-4">
          <div className="flex items-center gap-2.5">
            <MihakLogo size={28} />
            <span className="font-display font-bold text-sm text-[#353B40]">
              {isAr ? 'مِحَكّ · مختبر آراء العملاء' : 'MIHAK · Customer Feedback Test'}
            </span>
          </div>
          <button
            type="button"
            onClick={onExitToApp}
            className="text-xs font-semibold text-[#2C6E8A] hover:underline cursor-pointer"
          >
            {isAr ? 'فتح المنصة' : 'Open App'}
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-[#686E74]">
            {isAr ? 'جارٍ تحميل التجربة...' : 'Loading experiment...'}
          </div>
        ) : error ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-sm text-[#A9443E] font-semibold">{error}</p>
            <button
              type="button"
              onClick={onExitToApp}
              className="px-4 py-2 text-xs font-semibold bg-[#2C6E8A] text-white rounded-xl cursor-pointer"
            >
              {isAr ? 'العودة إلى مِحَكّ' : 'Return to MIHAK'}
            </button>
          </div>
        ) : submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#2E6B4E] mx-auto" />
            <h1 className="font-display text-xl font-bold text-[#353B40]">
              {isAr ? 'شكراً لمشاركتك رأيك!' : 'Thank you for your feedback!'}
            </h1>
            <p className="text-xs text-[#686E74]">
              {isAr
                ? 'تم تسجيل استجابتك في لوحة نتائج رائد الأعمال لمساعدته على اتخاذ قرار مدروس.'
                : 'Your response has been recorded in the entrepreneur results dashboard.'}
            </p>
          </div>
        ) : (
          survey && (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <p className="text-[#686E74]">{survey.projectName}</p>
                <h1 className="font-display text-lg font-bold text-[#353B40] mt-0.5">
                  {survey.title}
                </h1>
                <p className="text-sm font-semibold text-[#353B40] mt-2">{survey.question}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'A' as const, data: survey.variantA },
                  survey.variantB ? { key: 'B' as const, data: survey.variantB } : null,
                ]
                  .filter(Boolean)
                  .map((item) => {
                    if (!item) return null;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          setChosenVariant(item.key);
                          setPreferredPrice(item.data.price);
                        }}
                        className={`p-3 rounded-2xl border text-start transition-colors cursor-pointer space-y-2 ${
                          chosenVariant === item.key
                            ? 'bg-[#DCEEF8]/55 border-[#2C6E8A]'
                            : 'bg-[#FAF8F4] border-[#E5DDD0]'
                        }`}
                      >
                        {item.data.image && (
                          <img
                            src={item.data.image}
                            alt={item.data.label}
                            referrerPolicy="no-referrer"
                            className="w-full h-32 object-cover rounded-xl"
                          />
                        )}
                        <p className="font-bold text-[#353B40]">{item.data.label}</p>
                        <p className="font-mono-num font-bold text-[#2C6E8A]">
                          {item.data.price.toFixed(3)} OMR
                        </p>
                      </button>
                    );
                  })}
              </div>

              <button
                type="button"
                onClick={() => setChosenVariant('neither')}
                className={`w-full py-2 rounded-xl border font-semibold cursor-pointer ${
                  chosenVariant === 'neither'
                    ? 'bg-[#DCEEF8]/55 border-[#2C6E8A]'
                    : 'bg-[#FAF8F4] border-[#E5DDD0] text-[#686E74]'
                }`}
              >
                {isAr ? 'لا يناسبني أي خيار' : 'Neither option fits me'}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">
                    {isAr ? 'السعر العادل برأيك (ر.ع)' : 'Fair Price (OMR)'}
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    value={preferredPrice}
                    onChange={(e) => setPreferredPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl font-mono-num"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">
                    {isAr ? 'نية الشراء الفعلية' : 'Purchase Intent'}
                  </label>
                  <select
                    value={purchaseIntent}
                    onChange={(e) =>
                      setPurchaseIntent(e.target.value as 'high' | 'medium' | 'low')
                    }
                    className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl"
                  >
                    <option value="high">{isAr ? 'أرغب في الشراء / الحجز المبدئي' : 'High — Would reserve'}</option>
                    <option value="medium">{isAr ? 'مهتم ولكن أتردد' : 'Medium — Interested'}</option>
                    <option value="low">{isAr ? 'غير مهتم حالياً' : 'Low — Not now'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {isAr ? 'ما الذي قد يمنعك من الشراء؟' : 'Any hesitation or objection?'}
                </label>
                <input
                  type="text"
                  value={objection}
                  onChange={(e) => setObjection(e.target.value)}
                  placeholder={isAr ? 'مثال: السعر أو التوصيل' : 'e.g. Price or delivery'}
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {isAr ? 'ملاحظة إضافية (اختياري)' : 'Additional comment (optional)'}
                </label>
                <textarea
                  rows={2}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 text-sm font-semibold bg-[#2C6E8A] hover:bg-[#245B73] text-white rounded-xl cursor-pointer"
              >
                {isAr ? 'إرسال الرأي' : 'Submit Feedback'}
              </button>
            </form>
          )
        )}
      </div>
    </div>
  );
};
