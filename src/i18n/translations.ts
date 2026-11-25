import type { Language } from '../types/mihak';

export const copy = {
  ar: {
    brandName: 'مِحَكّ',
    brandLatin: 'MIHAK',
    tagline: 'اختبر قرارك قبل أن تستثمر',
    secondaryTagline: 'مستقبل مشروعك يبدأ بقرار مدروس',
    heroHeadline: 'ماذا لو استطعت تجربة مستقبل مشروعك قبل أن تستثمر؟',
    heroSubtitle: 'حلل فكرتك، اكتشف المخاطر، واختبر قراراتك التجارية في بيئة افتراضية ذكية.',
    primaryCta: 'ابدأ رحلتك',
    secondaryCta: 'جرّب مشروعًا افتراضيًا',
    tryYourself: 'جرّب بنفسك',
    nav: {
      whatIs: 'عن مِحَكّ',
      howItWorks: 'كيف يعمل',
      innovations: 'الابتكارات',
      faq: 'الأسئلة الشائعة',
    },
    sidebar: {
      dashboard: 'الرئيسية',
      projects: 'مشروعاتي',
      vision: 'عين مِحَكّ',
      twin: 'التوأم التجاري',
      reverseLab: 'المختبر العكسي',
      capitalShield: 'درع رأس المال',
      marketLab: 'مختبر العملاء',
      reengineer: 'إعادة هندسة القرار',
      timeMachine: 'آلة الزمن التجارية',
      competitors: 'المنافسون',
      marketing: 'التسويق الذكي',
      reports: 'التقارير',
      advisor: 'مرشد مِحَكّ',
      settings: 'الإعدادات',
    },
    simulationDisclaimer:
      'جميع النتائج المستقبلية المعروضة هي محاكاة حسابية مبنية على افتراضاتك المدخلة وليست توقعات مضمونة.',
    demoBadge: 'بيانات عرض توضيحي',
  },
  en: {
    brandName: 'مِحَكّ',
    brandLatin: 'MIHAK',
    tagline: 'Test your decision before you invest',
    secondaryTagline: 'Your venture future starts with a studied decision',
    heroHeadline: 'What if you could experience your business future before investing?',
    heroSubtitle: 'Analyze your idea, uncover hidden risks, and stress-test commercial decisions in an intelligent virtual workspace.',
    primaryCta: 'Start Your Journey',
    secondaryCta: 'Try a Virtual Project',
    tryYourself: 'Try It Yourself',
    nav: {
      whatIs: 'About MIHAK',
      howItWorks: 'How It Works',
      innovations: 'Innovations',
      faq: 'FAQ',
    },
    sidebar: {
      dashboard: 'Home',
      projects: 'My Projects',
      vision: 'MIHAK Vision',
      twin: 'Digital Twin',
      reverseLab: 'Reverse Lab',
      capitalShield: 'Capital Shield',
      marketLab: 'Customer Lab',
      reengineer: 'Re-engineer Decision',
      timeMachine: 'Time Machine',
      competitors: 'Competitors',
      marketing: 'Smart Marketing',
      reports: 'Reports',
      advisor: 'MIHAK Advisor',
      settings: 'Settings',
    },
    simulationDisclaimer:
      'All future figures shown are assumption-driven simulations rather than guaranteed forecasts.',
    demoBadge: 'Demonstration Data',
  },
} as const;

export function t(lang: Language) {
  return copy[lang];
}
