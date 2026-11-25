import type { Project } from '../types/mihak';
import { calculateFinancialMetrics, createDefaultTwinControls } from '../engine/financialEngine';
import {
  createDecisionFingerprintSnapshot,
  generateReverseAssumptions,
} from '../engine/riskEngine';

export const DEMO_PROJECT_ID = 'demo_lamsa_oman';

export const DEMO_IMAGES = {
  primaryGiftSet: '/src/assets/images/lamsa_perfume_gift_1795531957364.jpg',
  variantLinenBox: '/src/assets/images/lamsa_gift_variant_b_1795531956143.jpg',
  heroStudio: '/src/assets/images/hero_mihak_studio_1795531956854.jpg',
};

export function createLamsaDemoProject(language: 'ar' | 'en' = 'ar'): Project {
  const product = {
    id: 'prod_lamsa_gift_1',
    name: language === 'en' ? 'Lamsa Omani Perfume Gift Box' : 'طقم لمسة للعطور والهدايا العُمانية',
    category: language === 'en' ? 'Gifts & Perfumes' : 'الهدايا والعطور',
    description:
      language === 'en'
        ? 'Curated mini attar & frankincense gift box designed for Eid, graduations, and boutique gifting in Oman (Demo Sample).'
        : 'علبة هدايا أنيقة تجمع دهن العود واللبان العُماني بتغليف فاخر مناسبة لهدايا الأعياد والتخرج والمناسبات (بيانات عرض توضيحي).',
    images: [DEMO_IMAGES.primaryGiftSet, DEMO_IMAGES.variantLinenBox],
    unitPurchaseCost: 2.0,
    productionCost: 0,
    sellingPrice: 5.0,
    packagingCostPerUnit: 0.3,
    totalShippingCost: 10.0,
    supplierMinOrderQty: 20,
    plannedOrderQty: 50,
    supplierName: language === 'en' ? 'Muscat Packaging & Oils Wholesale (Demo)' : 'توريد مسقط للعطور والتغليف (مثال توضيحي)',
    deliveryDays: 7,
    hasAlternativeSupplier: true,
    seasonality: 'occasions' as const,
    estimatedInventoryCapacity: 80,
    visionNotes: {
      suggestedCategory: language === 'en' ? 'Boutique Gifts & Fragrances' : 'الهدايا الفاخرة والعطور',
      packagingCharacteristics: [
        language === 'en'
          ? 'Rigid cream box with warm gold geometric border and inner satin cradle'
          : 'علبة صلبة بلون كريمي دافئ وزخرفة ذهبية هندسية مع بطانة داخلية',
        language === 'en'
          ? 'Compact amber glass bottle paired with clear jar lid'
          : 'قارورة زجاجية عنبرية مع غطاء ذهبي وعبوة ثانوية متناسقة',
      ],
      designObservations: [
        language === 'en'
          ? 'High gift-readiness reduces need for extra wrapping by buyer'
          : 'مظهر العلبة جاهز للإهداء مباشرة دون حاجة لتغليف إضافي من المشتري',
        language === 'en'
          ? 'Neutral cream & gold palette aligns well with Omani gifting occasions'
          : 'تدرج الكريمي والذهبي يمنح هوية دافئة وملائمة للمناسبات العُمانية',
      ],
      presentationImprovements: [
        language === 'en'
          ? 'Add a small story card explaining the scent notes and origin'
          : 'إضافة بطاقة تعريفية قصيرة بمكونات العطر وطريقة الاستخدام',
        language === 'en'
          ? 'Test whether a lighter linen box reduces unit cost without hurting gift appeal'
          : 'اختبار بديل تغليف أقل تكلفة لمقارنة تفضيل العملاء الفعلي',
      ],
      positioningIdeas: [
        language === 'en'
          ? 'Ready-to-gift boutique keepsake under 5.500 OMR'
          : 'هدية عُمانية جاهزة وأنيقة بسعر في متناول اليد',
      ],
      suggestedCustomerSegments: [
        language === 'en' ? 'University students & young professionals (20–35)' : 'الشباب والموظفون الباحثون عن هدايا أنيقة (20–35 سنة)',
        language === 'en' ? 'Corporate & family occasion buyers' : 'مشترو هدايا المناسبات العائلية والجهات المحلية',
      ],
      questionsForConfirmation: [
        language === 'en'
          ? 'Confirm actual wholesale unit price from supplier invoice (not inferred from image)'
          : 'تأكيد تكلفة الشراء الفعلية من فاتورة المورد (لا تُستنتج من الصورة)',
        language === 'en'
          ? 'Verify exact box dimensions & local delivery fee per order'
          : 'التحقق من رسوم التوصيل المحلية لكل طلب',
      ],
      source: 'demo_sample' as const,
      analyzedAt: new Date().toISOString(),
    },
  };

  const financial = {
    availableCapital: 150,
    maxAcceptableLoss: 30,
    monthlyOperatingCosts: 0,
    marketingBudget: 10,
    emergencyReserve: 25,
    otherExpenses: 0,
    maxExperimentSpending: 10,
    expectedSalesQuantity: 35,
    timePeriodMonths: 1 as const,
    currency: 'OMR' as const,
  };

  const twinControls = createDefaultTwinControls(product, financial);

  const baseProject: Project = {
    id: DEMO_PROJECT_ID,
    isDemo: true,
    name: language === 'en' ? 'Lamsa — Gifts & Perfumes (Demo)' : 'لمسة — مشروع هدايا وعطور',
    logoText: 'لمسة',
    category: language === 'en' ? 'Gifts & Perfumes' : 'الهدايا والعطور',
    description:
      language === 'en'
        ? 'Interactive hackathon demonstration project testing a small-batch Omani perfume gift venture before committing 150 OMR capital.'
        : 'مشروع عرض تفاعلي للهاكاثون لاختبار إطلاق دفعة صغيرة من هدايا العطور العُمانية قبل استثمار رأس المال البالغ 150 ر.ع.',
    stage: 'idea',
    targetMarket: language === 'en' ? 'Muscat & Major Wilayats' : 'مسقط والولايات الرئيسية في عُمان',
    country: 'عُمان',
    city: 'مسقط',
    targetAudience:
      language === 'en'
        ? 'Young adults & families aged 20–40 buying occasion gifts'
        : 'الشباب والعائلات (20–40 سنة) الباحثون عن هدايا المناسبات',
    mainGoal: language === 'en' ? 'Launch product safely' : 'إطلاق منتج',
    challenges:
      language === 'en'
        ? 'Limited capital (150 OMR), uncertain demand at 5 OMR, and avoiding unsold inventory'
        : 'محدودية رأس المال (150 ر.ع)، عدم التأكد من تقبل السعر (5 ر.ع)، وتجنب المخزون الراكد',
    businessType: 'online',
    products: [product],
    activeProductId: product.id,
    financial,
    customerMarket: {
      targetAgeGroup: '20 - 40',
      customerPreferences:
        language === 'en'
          ? 'Neat gift-ready packaging, authentic Omani scent, quick WhatsApp ordering'
          : 'تغليف جاهز للإهداء، رائحة عُمانية أصيلة، وسهولة الطلب عبر واتساب',
      customerNeeds:
        language === 'en'
          ? 'Affordable elegant gifts under 6 OMR with fast local delivery'
          : 'هدية راقية بسعر مناسب أقل من 6 ر.ع مع توصيل سريع',
      salesChannels: ['Instagram', 'WhatsApp Business', 'Pop-up Markets'],
      existingCustomerEvidence:
        language === 'en'
          ? 'Demo notice: 12 sample responses collected in Micro Market Lab (marked as demonstration data).'
          : 'ملاحظة عرض توضيحي: تتوفر 12 استجابة تجريبية في مختبر العملاء وموسومة بوضوح كبيانات توضيحية.',
      productDifferentiation:
        language === 'en'
          ? 'Combines mini attar + frankincense in one ready-to-present box at 5.000 OMR'
          : 'يجمع دهن العطر مع اللبان العُماني في علبة إهداء جاهزة بسعر 5.000 ر.ع',
      expectedDemandAssumptions:
        language === 'en'
          ? 'Assumes selling 35 of 50 units in Month 1 via Instagram & WhatsApp.'
          : 'افتراض بيع 35 وحدة من أصل 50 خلال الشهر الأول عبر إنستغرام وواتساب.',
    },
    twinControls,
    savedScenarios: [
      {
        id: 'scen_demo_original',
        name: language === 'en' ? 'Original Plan (50 units @ 5.000 OMR)' : 'القرار الأصلي (50 وحدة بسعر 5.000 ر.ع)',
        controls: { ...twinControls },
        notes:
          language === 'en'
            ? 'Initial founder assumption before risk optimization.'
            : 'الخطة الأولية قبل اختبار المخاطر أو تقليص الكمية.',
        createdAt: new Date().toISOString(),
        isDemo: true,
      },
      {
        id: 'scen_demo_safe',
        name: language === 'en' ? 'Pilot MOQ Batch (20 units @ 5.000 OMR)' : 'دفعة تجريبية بالحد الأدنى (20 وحدة)',
        controls: {
          ...twinControls,
          orderQuantity: 20,
          expectedUnitsSold: 17,
          expectedSalesPercentage: 85,
          marketingBudget: 5,
        },
        notes:
          language === 'en'
            ? 'Respects 20-unit supplier MOQ while keeping risk below 30 OMR.'
            : 'تلتزم بالحد الأدنى للمورد (20 وحدة) وتبقي المخاطرة دون سقف الخسارة.',
        createdAt: new Date().toISOString(),
        isDemo: true,
      },
    ],
    competitors: [
      {
        id: 'comp_demo_1',
        name: language === 'en' ? 'Sample Local Gift Page A (Demo)' : 'متجر هدايا محلي — مثال توضيحي (أ)',
        product: language === 'en' ? 'Mini Perfume Gift Box' : 'علبة عطر ميني للهدايا',
        price: 6.5,
        strengths: language === 'en' ? 'Strong Instagram photography' : 'تصوير احترافي ومتابعة عالية',
        weaknesses: language === 'en' ? '4-day preparation delay' : 'مدة تجهيز تصل إلى 4 أيام',
        salesChannels: 'Instagram',
        sourceLink: '',
        dateCollected: '2026-11-20',
        isDemo: true,
      },
      {
        id: 'comp_demo_2',
        name: language === 'en' ? 'Sample Home Perfume Brand B (Demo)' : 'مشروع منزلي للعطور — مثال توضيحي (ب)',
        product: language === 'en' ? 'Single 30ml Bottle + Pouch' : 'زجاجة عطر 30 مل مع كيس مخملي',
        price: 4.5,
        strengths: language === 'en' ? 'Lower entry price' : 'سعر دخول منخفض',
        weaknesses: language === 'en' ? 'No rigid gift box packaging' : 'لا يوفر علبة إهداء صلبة فاخرة',
        salesChannels: 'WhatsApp & Souq Pop-ups',
        sourceLink: '',
        dateCollected: '2026-11-20',
        isDemo: true,
      },
    ],
    experiments: [
      {
        id: 'exp_demo_lamsa',
        title:
          language === 'en'
            ? 'Lamsa Gift Box Packaging & Price Test (Demo Data)'
            : 'اختبار تغليف وسعر طقم لمسة (بيانات توضيحية)',
        type: 'packaging_comparison',
        question:
          language === 'en'
            ? 'Which gift box style and price point would you actually buy as an Eid or occasion gift?'
            : 'أي تصميم علبة وسعر تفضّل شراءه فعلياً كهدية مناسبة؟',
        variantA: {
          label:
            language === 'en'
              ? 'Variant A: Cream Gold-Foil Box'
              : 'النموذج أ: علبة كريمية بزخرفة ذهبية',
          price: 5.0,
          image: DEMO_IMAGES.primaryGiftSet,
          description:
            language === 'en'
              ? 'Rigid geometric box with amber attar & frankincense jar'
              : 'علبة صلبة فاخرة مع قارورة عطر ولبان حوجري',
        },
        variantB: {
          label:
            language === 'en'
              ? 'Variant B: Sand Linen Ribbon Box'
              : 'النموذج ب: علبة كتان رملي بشريط حريري',
          price: 4.5,
          image: DEMO_IMAGES.variantLinenBox,
          description:
            language === 'en'
              ? 'Eco-minimalist linen box with frosted bottle'
              : 'علبة كتان طبيعية بتغليف مبسط أنيق',
        },
        targetAudience: language === 'en' ? 'Muscat gift buyers 20–35' : 'مشترو الهدايا في مسقط (20–35 سنة)',
        budget: 5,
        minAcceptableResult:
          language === 'en'
            ? 'At least 40% high purchase intent'
            : 'تحقيق 40% فأكثر بنية شراء عالية',
        isDemo: true,
        createdAt: new Date().toISOString(),
        responses: [
          {
            id: 'demo_r1',
            chosenVariant: 'A',
            preferredPrice: 5.0,
            purchaseIntent: 'high',
            objection: language === 'en' ? 'None, looks gift-ready' : 'لا يوجد اعتراض، جاهز للإهداء',
            comment: language === 'en' ? 'Gold pattern feels festive (Demo)' : 'الزخرفة الذهبية مناسبة جداً للأعياد (بيانات توضيحية)',
            createdAt: '2026-11-21T10:00:00Z',
            isDemo: true,
          },
          {
            id: 'demo_r2',
            chosenVariant: 'A',
            preferredPrice: 5.0,
            purchaseIntent: 'high',
            objection: language === 'en' ? 'Delivery fee sensitivity' : 'السؤال عن رسوم التوصيل',
            comment: language === 'en' ? 'Good value if delivery <= 1.5 OMR (Demo)' : 'سعر ممتاز إذا كان التوصيل بحدود 1.5 ر.ع (بيانات توضيحية)',
            createdAt: '2026-11-21T11:00:00Z',
            isDemo: true,
          },
          {
            id: 'demo_r3',
            chosenVariant: 'B',
            preferredPrice: 4.5,
            purchaseIntent: 'medium',
            objection: language === 'en' ? 'Wants custom gift card' : 'يرغب في بطاقة إهداء مخصصة',
            comment: language === 'en' ? 'Linen style feels modern (Demo)' : 'تصميم الكتان عصري وهادئ (بيانات توضيحية)',
            createdAt: '2026-11-21T12:00:00Z',
            isDemo: true,
          },
          {
            id: 'demo_r4',
            chosenVariant: 'A',
            preferredPrice: 4.5,
            purchaseIntent: 'medium',
            objection: language === 'en' ? 'Prefers 4.5 OMR price' : 'يفضّل سعر 4.5 ر.ع',
            comment: language === 'en' ? 'Box is lovely, price slightly high for casual gift (Demo)' : 'الشكل جميل لكن 4.5 ر.ع أنسب لهدية سريعة (بيانات توضيحية)',
            createdAt: '2026-11-21T13:00:00Z',
            isDemo: true,
          },
          {
            id: 'demo_r5',
            chosenVariant: 'B',
            preferredPrice: 4.5,
            purchaseIntent: 'high',
            objection: language === 'en' ? 'None' : 'لا يوجد',
            comment: language === 'en' ? 'Great for graduation gifts (Demo)' : 'مناسب لهدايا التخرج (بيانات توضيحية)',
            createdAt: '2026-11-21T14:00:00Z',
            isDemo: true,
          },
          {
            id: 'demo_r6',
            chosenVariant: 'neither',
            preferredPrice: 3.5,
            purchaseIntent: 'low',
            objection: language === 'en' ? 'Wants to smell fragrance first' : 'يريد تجربة الرائحة قبل الشراء',
            comment: language === 'en' ? 'Hard to buy perfume online without tester (Demo)' : 'صعوبة شراء عطر أونلاين دون عينة تجريبية (بيانات توضيحية)',
            createdAt: '2026-11-21T15:00:00Z',
            isDemo: true,
          },
        ],
      },
    ],
    assumptions: [],
    fingerprints: [],
    marketingAssets: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const metrics = calculateFinancialMetrics(baseProject.twinControls, baseProject.financial);
  baseProject.assumptions = generateReverseAssumptions(baseProject, metrics, language);
  baseProject.fingerprints = [
    createDecisionFingerprintSnapshot(baseProject, metrics, undefined, language),
  ];

  return baseProject;
}
