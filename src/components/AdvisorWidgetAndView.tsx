import React, { useMemo, useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import type { Language, Project } from '../types/mihak';
import { calculateFinancialMetrics, getActiveProduct } from '../engine/financialEngine';
import { buildFinalRecommendation, buildRuleBasedAdvisorReply } from '../engine/riskEngine';
import { MihakLogo } from './MihakLogo';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  source?: 'gemini' | 'rule_based_demo';
}

interface AdvisorPanelProps {
  project: Project;
  language: Language;
  compact?: boolean;
  onClose?: () => void;
}

export const AdvisorPanel: React.FC<AdvisorPanelProps> = ({
  project,
  language,
  compact = false,
  onClose,
}) => {
  const isAr = language === 'ar';
  const product = getActiveProduct(project);
  const metrics = useMemo(
    () => calculateFinancialMetrics(project.twinControls, project.financial),
    [project.twinControls, project.financial]
  );
  const recommendation = useMemo(
    () => buildFinalRecommendation(project, metrics, language),
    [project, metrics, language]
  );

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: isAr
        ? `مرحباً بك في مرشد مِحَكّ. أنا أقرأ بيانات مشروع "${project.name}" الحالية (الميزانية ${project.financial.availableCapital.toFixed(3)} ر.ع، الكمية ${project.twinControls.orderQuantity} وحدة، التوصية: ${recommendation.titleAr}). اسألني أي سؤال.`
        : `Welcome to MIHAK Advisor. I am grounded in your current "${project.name}" numbers (Capital: ${project.financial.availableCapital.toFixed(3)} OMR, Qty: ${project.twinControls.orderQuantity}, Verdict: ${recommendation.titleEn}). Ask me anything.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = isAr
    ? [
        'هل ميزانيتي كافية؟',
        'ما أكبر خطر في مشروعي؟',
        'ماذا يحدث إذا خفضت السعر؟',
        'كيف أقلل التكاليف؟',
        'كيف أختبر المنتج قبل شرائه؟',
        'ما أفضل خطوة تالية؟',
        'لماذا تغيرت توصيتك؟',
      ]
    : [
        'Is my budget enough?',
        'What is the biggest risk in my project?',
        'What happens if I lower the price?',
        'How can I reduce costs?',
        'How should I test the product before buying?',
        'What is the best next step?',
        'Why did your recommendation change?',
      ];

  const sendQuestion = async (questionText: string) => {
    const clean = questionText.trim();
    if (!clean || loading) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: 'user',
      text: clean,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: clean,
          language,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          projectContext: {
            projectName: project.name,
            productName: product.name,
            supplierMOQ: product.supplierMinOrderQty,
            availableCapital: project.financial.availableCapital,
            maxAcceptableLoss: project.financial.maxAcceptableLoss,
            emergencyReserve: project.financial.emergencyReserve,
            twinControls: project.twinControls,
            calculatedMetrics: {
              initialSpending: metrics.totalInitialSpending,
              totalCashOutflow: metrics.totalCashOutflow,
              potentialRevenue: metrics.potentialRevenue,
              netProfitEstimate: metrics.netProfitEstimate,
              remainingCash: metrics.remainingCash,
              unsoldUnits: metrics.unsoldUnits,
              breakEvenUnits: metrics.breakEvenUnits,
              capitalAtRisk: metrics.capitalAtRisk,
              breachesMaxLoss: metrics.breachesMaxLoss,
            },
            recommendation: isAr ? recommendation.titleAr : recommendation.titleEn,
            realSurveyResponses: project.experiments.reduce(
              (acc, e) => acc + e.responses.filter((r) => !r.isDemo).length,
              0
            ),
          },
        }),
      });

      const json = await res.json();
      if (res.ok && json.answer) {
        setMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            text: json.answer,
            source: 'gemini',
          },
        ]);
      } else {
        // Transparent rule-based demonstration fallback when API key isn't configured
        const fallback = buildRuleBasedAdvisorReply(clean, project, metrics, language);
        setMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: 'assistant',
            text: fallback,
            source: 'rule_based_demo',
          },
        ]);
      }
    } catch {
      const fallback = buildRuleBasedAdvisorReply(clean, project, metrics, language);
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: 'assistant',
          text: fallback,
          source: 'rule_based_demo',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`bg-white border border-[#E5DDD0] rounded-2xl flex flex-col ${
        compact ? 'h-[540px] shadow-xl' : 'min-h-[600px]'
      }`}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E5DDD0] flex items-center justify-between gap-3 bg-[#FAF8F4] rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <MihakLogo size={26} />
          <div>
            <h2 className="font-display text-sm font-bold text-[#353B40]">
              {isAr ? 'مرشد مِحَكّ الذكي' : 'MIHAK Decision Advisor'}
            </h2>
            <p className="text-[11px] text-[#686E74]">
              {isAr ? `مرتبط بمشروع: ${project.name}` : `Grounded in: ${project.name}`}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#686E74] hover:text-[#353B40] rounded-lg cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Suggested Questions */}
      <div className="px-4 py-2.5 border-b border-[#F0EAE0] flex flex-wrap gap-1.5 bg-[#FAF8F4]/50">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => sendQuestion(q)}
            className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-[#DCEEF8] border border-[#E5DDD0] rounded-lg text-[#353B40] transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line ${
                m.role === 'user'
                  ? 'bg-[#2C6E8A] text-white'
                  : 'bg-[#FAF8F4] border border-[#E5DDD0] text-[#353B40]'
              }`}
            >
              {m.text}
            </div>
            {m.source && (
              <span className="text-[10px] text-[#686E74] mt-1 px-1">
                {m.source === 'gemini'
                  ? isAr
                    ? 'إجابة عبر الذكاء الاصطناعي'
                    : 'AI Analysis'
                  : isAr
                    ? 'وضع التوضيح المبني على القواعد'
                    : 'Rule-Based Demo Mode'}
              </span>
            )}
          </div>
        ))}
        {loading && (
          <div className="text-xs text-[#686E74] px-2">
            {isAr ? 'يفحص المرشد أرقام مشروعك...' : 'Analyzing your project numbers...'}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendQuestion(input);
        }}
        className="p-3 border-t border-[#E5DDD0] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isAr ? 'اكتب سؤالك حول قرارك التجاري...' : 'Ask about your business decision...'}
          className="flex-1 px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-xs focus:outline-none focus:border-[#2C6E8A]"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 bg-[#2C6E8A] hover:bg-[#245B73] disabled:opacity-50 text-white rounded-xl cursor-pointer"
          aria-label="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

interface FloatingAdvisorProps {
  project: Project;
  language: Language;
}

export const FloatingAdvisor: React.FC<FloatingAdvisorProps> = ({
  project,
  language,
}) => {
  const isAr = language === 'ar';
  const [open, setOpen] = useState(false);

  return (
    <div
      className="no-print fixed bottom-5 z-40"
      style={{ insetInlineEnd: '1.25rem' }}
    >
      {open ? (
        <div className="w-[340px] sm:w-[400px]">
          <AdvisorPanel
            project={project}
            language={language}
            compact
            onClose={() => setOpen(false)}
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="px-4 py-3 bg-[#2C6E8A] hover:bg-[#245B73] text-white rounded-2xl shadow-lg flex items-center gap-2 text-xs font-semibold cursor-pointer transition-transform hover:scale-[1.02]"
        >
          <MessageSquare className="w-4 h-4" />
          <span>{isAr ? 'مرشد مِحَكّ' : 'MIHAK Advisor'}</span>
        </button>
      )}
    </div>
  );
};
