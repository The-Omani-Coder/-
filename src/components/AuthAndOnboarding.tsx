import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, KeyRound, UserCheck } from 'lucide-react';
import type { Language, UserSession } from '../types/mihak';
import { MihakLogo } from './MihakLogo';

interface AuthAndOnboardingProps {
  mode: 'auth' | 'onboarding';
  language: Language;
  initialSession: UserSession | null;
  onCompleteAuth: (session: UserSession, skipOnboarding?: boolean) => void;
  onCompleteOnboarding: (answers: NonNullable<UserSession['onboardingAnswers']>) => void;
  onBackToLanding: () => void;
}

export const AuthAndOnboarding: React.FC<AuthAndOnboardingProps> = ({
  mode,
  language,
  initialSession,
  onCompleteAuth,
  onCompleteOnboarding,
  onBackToLanding,
}) => {
  const isAr = language === 'ar';
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'forgot'>('login');
  const [name, setName] = useState(initialSession?.name || '');
  const [email, setEmail] = useState(initialSession?.email || '');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Onboarding state
  const [projectType, setProjectType] = useState(
    isAr ? 'تجارة إلكترونية / هدايا وعطور' : 'E-commerce / Gifts & Perfumes'
  );
  const [stage, setStage] = useState(isAr ? 'فكرة جديدة' : 'New idea');
  const [mainGoal, setMainGoal] = useState(isAr ? 'اختبار فكرة' : 'Test an idea');
  const [biggestChallenge, setBiggestChallenge] = useState(
    isAr ? 'الخوف من خسارة رأس المال والمخزون الراكد' : 'Fear of losing capital & unsold stock'
  );
  const [approxBudget, setApproxBudget] = useState('100 - 300 OMR');

  const BackIcon = isAr ? ArrowRight : ArrowLeft;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg(
        isAr ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.'
      );
      return;
    }

    if (authTab === 'forgot') {
      setInfoMsg(
        isAr
          ? 'تم إرسال تعليمات استعادة كلمة المرور (محاكاة محلية للعرض التجريبي).'
          : 'Password reset instructions prepared (local prototype mode).'
      );
      return;
    }

    if (password.length < 6) {
      setErrorMsg(
        isAr ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' : 'Password must be at least 6 characters.'
      );
      return;
    }

    if (authTab === 'register' && !name.trim()) {
      setErrorMsg(isAr ? 'يرجى إدخال اسمك الكامل.' : 'Please enter your name.');
      return;
    }

    onCompleteAuth(
      {
        name: name.trim() || email.split('@')[0],
        email: email.trim(),
        isGuest: false,
        onboarded: false,
      },
      false
    );
  };

  const handleGuestMode = () => {
    onCompleteAuth(
      {
        name: isAr ? 'رائد أعمال (ضيف)' : 'Guest Entrepreneur',
        email: 'guest@mihak.om',
        isGuest: true,
        onboarded: true,
        onboardingAnswers: {
          projectType: isAr ? 'مشروع هدايا وعطور' : 'Gifts & Perfumes',
          stage: isAr ? 'جديد' : 'New',
          mainGoal: isAr ? 'اختبار فكرة' : 'Test an idea',
          biggestChallenge: isAr ? 'محدودية رأس المال (150 ر.ع)' : 'Limited capital (150 OMR)',
          approxBudget: '150 OMR',
        },
      },
      true
    );
  };

  if (mode === 'onboarding') {
    const goalOptions = isAr
      ? [
          'إطلاق منتج',
          'تقليل التكاليف',
          'فهم العملاء',
          'تحسين التسويق',
          'اختبار فكرة',
          'التوسع',
        ]
      : [
          'Launch a product',
          'Reduce costs',
          'Understand customers',
          'Improve marketing',
          'Test an idea',
          'Business expansion',
        ];

    return (
      <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center p-6">
        <div className="w-full max-w-2xl bg-white border border-[#E5DDD0] rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MihakLogo size={32} />
              <div>
                <h1 className="font-display text-xl font-bold text-[#353B40]">
                  {isAr ? 'تخصيص رحلتك في مِحَكّ' : 'Personalize Your MIHAK Workspace'}
                </h1>
                <p className="text-xs text-[#686E74]">
                  {isAr
                    ? 'خمسة أسئلة سريعة لضبط التوصيات والتحليلات'
                    : 'Five quick questions to tailor your decision workspace'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#353B40] mb-1.5">
                {isAr ? '1. ما نوع مشروعك؟' : '1. What type of business is it?'}
              </label>
              <input
                type="text"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm focus:outline-none focus:border-[#2C6E8A]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#353B40] mb-1.5">
                {isAr ? '2. هل مشروعك جديد أم قائم؟' : '2. Is your business new or existing?'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(isAr ? ['فكرة جديدة', 'مشروع قائم'] : ['New idea', 'Existing business']).map(
                  (opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setStage(opt)}
                      className={`py-2.5 px-4 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${
                        stage === opt
                          ? 'bg-[#DCEEF8] border-[#2C6E8A] text-[#353B40] font-semibold'
                          : 'bg-[#FAF8F4] border-[#E5DDD0] text-[#686E74]'
                      }`}
                    >
                      {opt}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#353B40] mb-1.5">
                {isAr ? '3. ما هدفك الرئيسي؟' : '3. What is your main goal?'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {goalOptions.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setMainGoal(g)}
                    className={`py-2 px-3 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                      mainGoal === g
                        ? 'bg-[#DCEEF8] border-[#2C6E8A] text-[#353B40] font-semibold'
                        : 'bg-[#FAF8F4] border-[#E5DDD0] text-[#686E74]'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#353B40] mb-1.5">
                {isAr ? '4. ما أكبر تحدٍ تواجهه؟' : '4. What is your biggest challenge?'}
              </label>
              <input
                type="text"
                value={biggestChallenge}
                onChange={(e) => setBiggestChallenge(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm focus:outline-none focus:border-[#2C6E8A]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#353B40] mb-1.5">
                {isAr ? '5. ما ميزانيتك التقريبية؟' : '5. What is your approximate budget?'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['< 100 OMR', '100 - 300 OMR', '300 - 1000 OMR', '> 1000 OMR'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setApproxBudget(b)}
                    className={`py-2 px-3 rounded-xl text-xs font-mono-num border transition-colors cursor-pointer ${
                      approxBudget === b
                        ? 'bg-[#DCEEF8] border-[#2C6E8A] text-[#353B40] font-semibold'
                        : 'bg-[#FAF8F4] border-[#E5DDD0] text-[#686E74]'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#E5DDD0]">
            <button
              type="button"
              onClick={handleGuestMode}
              className="text-xs font-semibold text-[#686E74] hover:text-[#353B40] cursor-pointer"
            >
              {isAr ? 'تخطي والانتقال للعرض التفاعلي' : 'Skip to interactive demo'}
            </button>
            <button
              type="button"
              onClick={() =>
                onCompleteOnboarding({
                  projectType,
                  stage,
                  mainGoal,
                  biggestChallenge,
                  approxBudget,
                })
              }
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#2C6E8A] hover:bg-[#245B73] rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isAr ? 'دخول لوحة مِحَكّ' : 'Enter MIHAK Dashboard'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-4">
        <button
          type="button"
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#686E74] hover:text-[#353B40] cursor-pointer"
        >
          <BackIcon className="w-4 h-4" />
          <span>{isAr ? 'العودة للصفحة الرئيسية' : 'Back to Home'}</span>
        </button>

        <div className="bg-white border border-[#E5DDD0] rounded-3xl p-7 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <MihakLogo size={36} />
            <div>
              <h1 className="font-display text-xl font-bold text-[#353B40]">
                {isAr ? 'مِحَكّ · بوابة رواد الأعمال' : 'MIHAK · Founder Access'}
              </h1>
              <p className="text-xs text-[#686E74]">
                {isAr ? 'اختبر قرارك قبل أن تستثمر' : 'Test your decision before you invest'}
              </p>
            </div>
          </div>

          {/* Guest Mode Banner for Hackathon */}
          <div className="bg-[#DCEEF8]/60 border border-[#83BFD9]/60 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-[#353B40]">
              <UserCheck className="w-4 h-4 text-[#2C6E8A]" />
              <span>{isAr ? 'وضع الضيف — عرض الهاكاثون الكامل' : 'Guest Mode — Full Hackathon Demo'}</span>
            </div>
            <p className="text-xs text-[#686E74] leading-relaxed">
              {isAr
                ? 'دخول فوري دون إنشاء حساب لتجربة مشروع "لمسة" وتعديل التوأم التجاري والمختبر العكسي.'
                : 'Instant access without registration to explore the Lamsa project, Digital Twin, and Reverse Lab.'}
            </p>
            <button
              type="button"
              onClick={handleGuestMode}
              className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#2C6E8A] hover:bg-[#245B73] rounded-xl transition-colors cursor-pointer"
            >
              {isAr ? 'الدخول كضيف الآن' : 'Enter as Guest Now'}
            </button>
          </div>

          {/* Auth Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setAuthTab('login');
                setErrorMsg('');
                setInfoMsg('');
              }}
              className={`py-2 rounded-lg transition-colors cursor-pointer ${
                authTab === 'login' ? 'bg-white text-[#353B40] shadow-xs font-semibold' : 'text-[#686E74]'
              }`}
            >
              {isAr ? 'تسجيل الدخول' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('register');
                setErrorMsg('');
                setInfoMsg('');
              }}
              className={`py-2 rounded-lg transition-colors cursor-pointer ${
                authTab === 'register' ? 'bg-white text-[#353B40] shadow-xs font-semibold' : 'text-[#686E74]'
              }`}
            >
              {isAr ? 'حساب جديد' : 'Register'}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('forgot');
                setErrorMsg('');
                setInfoMsg('');
              }}
              className={`py-2 rounded-lg transition-colors cursor-pointer ${
                authTab === 'forgot' ? 'bg-white text-[#353B40] shadow-xs font-semibold' : 'text-[#686E74]'
              }`}
            >
              {isAr ? 'نسيت كلمة المرور' : 'Reset'}
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-3.5">
            {authTab === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#353B40] mb-1">
                  {isAr ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? 'مثال: سارة البلوشية' : 'e.g. Sara Al Balushi'}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm focus:outline-none focus:border-[#2C6E8A]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#353B40] mb-1">
                {isAr ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@example.om"
                className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm focus:outline-none focus:border-[#2C6E8A]"
              />
            </div>

            {authTab !== 'forgot' && (
              <div>
                <label className="block text-xs font-semibold text-[#353B40] mb-1">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm focus:outline-none focus:border-[#2C6E8A]"
                />
              </div>
            )}

            {errorMsg && (
              <p className="text-xs font-medium text-[#A9443E] bg-[#DC8983]/20 border border-[#DC8983] rounded-xl px-3 py-2">
                {errorMsg}
              </p>
            )}
            {infoMsg && (
              <p className="text-xs font-medium text-[#2E6B4E] bg-[#B5D8C5]/30 border border-[#B5D8C5] rounded-xl px-3 py-2">
                {infoMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-sm font-semibold text-[#353B40] bg-[#FAF8F4] hover:bg-[#DCEEF8] border border-[#D8B98C] rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>
                {authTab === 'login'
                  ? isAr
                    ? 'متابعة بالحساب المحلي'
                    : 'Continue with Local Account'
                  : authTab === 'register'
                    ? isAr
                      ? 'إنشاء حساب والبدء'
                      : 'Create Account & Start'
                    : isAr
                      ? 'إرسال رابط الاستعادة'
                      : 'Send Reset Link'}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
