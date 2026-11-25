import type {
  AssumptionRisk,
  DecisionFingerprint,
  FinancialMetrics,
  OpportunityItem,
  ProductItem,
  Project,
  ReengineeredPlan,
  TwinControls,
} from '../types/mihak';
import { calculateFinancialMetrics, getActiveProduct } from './financialEngine';

export interface FinalRecommendation {
  code: 'limited_trial' | 'adjust_then_start' | 'test_more' | 'postpone';
  titleAr: string;
  titleEn: string;
  summaryAr: string;
  summaryEn: string;
  whySelected: string[];
  supportingEvidence: string[];
  missingInformation: string[];
  nextSteps: string[];
  conditionsToChange: string[];
}

export function generateReverseAssumptions(
  project: Project,
  metrics: FinancialMetrics,
  language: 'ar' | 'en' = 'ar'
): AssumptionRisk[] {
  const product = getActiveProduct(project);
  const controls = project.twinControls;
  const hasRealCustomerEvidence =
    project.experiments.some((e) => e.responses.some((r) => !r.isDemo)) ||
    project.customerMarket.existingCustomerEvidence.trim().length > 20;

  const priceMarginRatio =
    controls.sellingPrice > 0
      ? metrics.contributionMarginPerUnit / controls.sellingPrice
      : 0;

  const assumptions: AssumptionRisk[] = [
    {
      id: 'assume_price',
      title:
        language === 'en'
          ? `Customers will pay ${controls.sellingPrice.toFixed(3)} OMR per unit`
          : `العملاء مستعدون للشراء بسعر ${controls.sellingPrice.toFixed(3)} ر.ع للوحدة`,
      category: 'pricing',
      supportingEvidence:
        project.competitors.length > 0
          ? language === 'en'
            ? `Compared against ${project.competitors.length} manually logged competitor price(s).`
            : `تمت مقارنته مع ${project.competitors.length} منافس تم إدخالهم يدوياً في قاعدة المنافسين.`
          : language === 'en'
            ? 'Estimated by entrepreneur without documented competitor pricing yet.'
            : 'تقدير مبدئي من رائد الأعمال دون توثيق كافٍ لأسعار المنافسين بعد.',
      missingInformation:
        language === 'en'
          ? 'Actual willingness-to-pay data from target Omani buyers.'
          : 'اختبار فعلي لاستعداد الشريحة المستهدفة للدفع عند هذا السعر.',
      failureScenario:
        language === 'en'
          ? 'Customers admire the product aesthetics but hesitate at checkout due to price sensitivity.'
          : 'يعجب العملاء بشكل المنتج وتغليفه، لكنهم يترددون عند الدفع أو يطلبون تخفيض السعر.',
      estimatedFinancialImpact: Math.round(
        controls.orderQuantity * Math.max(0.5, controls.sellingPrice * 0.2) * 1000
      ) / 1000,
      severity: priceMarginRatio < 0.35 || !hasRealCustomerEvidence ? 'high' : 'medium',
      severityReason:
        !hasRealCustomerEvidence
          ? language === 'en'
            ? 'No confirmed pre-order or real buyer survey yet.'
            : 'لا توجد نتائج اختبار حقيقي للسعر مع عملاء فعليين حتى الآن.'
          : language === 'en'
            ? 'Contribution margin narrows if a discount is needed.'
            : 'هامش المساهمة يتأثر سريعاً إذا احتجت لتقديم خصم.',
      recommendedExperiment:
        language === 'en'
          ? 'Run a two-price offer test inside the Micro Market Testing Lab.'
          : 'قارن عرضين سعريين مختلفين في مختبر العملاء مع 15–25 عميلاً محتملاً.',
      estimatedExperimentCost: Math.min(5, project.financial.maxExperimentSpending || 5),
      evidenceNeeded:
        language === 'en'
          ? 'At least 40% choosing the target price with high purchase intent.'
          : 'اختيار 40% فأكثر للسعر المستهدف مع نية شراء واضحة.',
      testStatus: project.experiments.length > 0 ? 'testing' : 'untested',
      branchPassedAction:
        language === 'en'
          ? 'Lock current pricing and proceed to MOQ batch.'
          : 'اعتماد السعر الحالي والانتقال لطلب الدفعة التجريبية.',
      branchFailedAction:
        language === 'en'
          ? 'Bundle gift add-ons or adjust packaging cost before ordering.'
          : 'تعديل التغليف أو تقديم باقة قيمة مضافة أو خفض التكلفة قبل الشراء.',
    },
    {
      id: 'assume_demand',
      title:
        language === 'en'
          ? `Selling ${controls.expectedUnitsSold} of ${controls.orderQuantity} units within ${project.financial.timePeriodMonths} month(s)`
          : `بيع ${controls.expectedUnitsSold} وحدة من أصل ${controls.orderQuantity} خلال ${project.financial.timePeriodMonths} شهر`,
      category: 'demand',
      supportingEvidence:
        project.customerMarket.existingCustomerEvidence ||
        (language === 'en'
          ? 'Based on founder expectation.'
          : 'افتراض مبني على توقع المؤسس.'),
      missingInformation:
        language === 'en'
          ? 'Verified conversion rate from the chosen sales channels.'
          : 'معدل التحويل الحقيقي من قنوات البيع المختارة.',
      failureScenario:
        language === 'en'
          ? `Half of the stock remains unsold, locking ${((controls.orderQuantity * 0.5) * (controls.unitCost + controls.packagingCostPerUnit)).toFixed(3)} OMR in inventory.`
          : `تبقى نصف الكمية دون بيع، مما يجمّد رأس مال قدره ${((controls.orderQuantity * 0.5) * (controls.unitCost + controls.packagingCostPerUnit)).toFixed(3)} ر.ع في المخزون.`,
      estimatedFinancialImpact:
        Math.round(
          controls.orderQuantity *
            0.5 *
            (controls.unitCost + controls.packagingCostPerUnit) *
            1000
        ) / 1000,
      severity:
        controls.orderQuantity > product.supplierMinOrderQty * 1.5 ||
        metrics.capitalAtRisk > project.financial.maxAcceptableLoss
          ? 'high'
          : 'medium',
      severityReason:
        controls.orderQuantity > product.supplierMinOrderQty
          ? language === 'en'
            ? `Planned quantity (${controls.orderQuantity}) exceeds supplier MOQ (${product.supplierMinOrderQty}), increasing unsold stock exposure.`
            : `الكمية المخططة (${controls.orderQuantity}) أعلى من الحد الأدنى للمورد (${product.supplierMinOrderQty}) مما يرفع خطر المخزون الراكد.`
          : language === 'en'
            ? 'Demand speed in early weeks is uncertain.'
            : 'سرعة تصريف الدفعة الأولى غير مؤكدة عملياً.',
      recommendedExperiment:
        language === 'en'
          ? 'Test non-binding pre-order reservations for 10 units before paying supplier.'
          : 'فتح حجز مسبق غير ملزم لعشر وحدات لقياس الطلب الحقيقي قبل الدفع للمورد.',
      estimatedExperimentCost: 3,
      evidenceNeeded:
        language === 'en'
          ? 'At least 10 confirmed pre-order expressions within 7 days.'
          : 'تسجيل 10 طلبات حجز مبدئي جادة خلال 7 أيام.',
      testStatus: 'untested',
      branchPassedAction:
        language === 'en'
          ? 'Proceed with supplier order matching validated demand.'
          : 'الطلب من المورد بكمية متناسبة مع الحجوزات المؤكدة.',
      branchFailedAction:
        language === 'en'
          ? 'Switch to pre-order model or reduce batch to supplier MOQ.'
          : 'تطبيق نموذج الطلب المسبق أو تقليص الكمية إلى الحد الأدنى للمورد.',
    },
    {
      id: 'assume_budget',
      title:
        language === 'en'
          ? 'Initial capital and marketing budget will sustain full launch'
          : 'الميزانية المخصصة والتسويق كافيان لتصريف الدفعة الأولى',
      category: 'capital',
      supportingEvidence:
        language === 'en'
          ? `Available capital: ${project.financial.availableCapital.toFixed(3)} OMR; Max loss limit: ${project.financial.maxAcceptableLoss.toFixed(3)} OMR.`
          : `رأس المال المتاح ${project.financial.availableCapital.toFixed(3)} ر.ع وسقف الخسارة المقبولة ${project.financial.maxAcceptableLoss.toFixed(3)} ر.ع.`,
      missingInformation:
        language === 'en'
          ? 'Customer acquisition cost (CAC) across Instagram/WhatsApp.'
          : 'تكلفة اكتساب العميل الواحد عبر قنوات التسويق المختارة.',
      failureScenario:
        language === 'en'
          ? 'Initial spending exceeds capital limit or eats into emergency reserve before revenue arrives.'
          : 'تجاوز سقف الإنفاق المالي أو استنزاف احتياطي الطوارئ قبل تحصيل المبيعات.',
      estimatedFinancialImpact: Math.max(
        metrics.exceedsBudgetBy,
        metrics.capitalAtRisk
      ),
      severity:
        metrics.exceedsBudgetBy > 0 || metrics.breachesMaxLoss
          ? 'high'
          : metrics.touchesEmergencyReserve
            ? 'medium'
            : 'low',
      severityReason:
        metrics.exceedsBudgetBy > 0
          ? language === 'en'
            ? `Total cash outflow exceeds available budget by ${metrics.exceedsBudgetBy.toFixed(3)} OMR.`
            : `إجمالي الإنفاق يتجاوز الميزانية المتاحة بمقدار ${metrics.exceedsBudgetBy.toFixed(3)} ر.ع.`
          : metrics.breachesMaxLoss
            ? language === 'en'
              ? 'Exposure exceeds user-defined maximum acceptable loss.'
              : 'رأس المال المعرض للخطر يتجاوز حد الخسارة المقبولة.'
            : language === 'en'
              ? 'Within declared budget boundaries.'
              : 'الإنفاق ضمن الحدود المالية المعلنة.',
      recommendedExperiment:
        language === 'en'
          ? 'Run a micro ad / organic WhatsApp broadcast test with 5 OMR cap.'
          : 'تشغيل اختبار ترويجي مصغر بحد أقصى 5 ر.ع لقياس تفاعل المشترين الفعليين.',
      estimatedExperimentCost: 5,
      evidenceNeeded:
        language === 'en'
          ? 'Acquisition cost per inquiry below 15% of selling price.'
          : 'بقاء تكلفة جذب الاستفسار الجاد أقل من 15% من سعر البيع.',
      testStatus: 'untested',
      branchPassedAction:
        language === 'en'
          ? 'Allocate remaining marketing budget gradually.'
          : 'صرف باقي ميزانية التسويق تدريجياً حسب الأداء.',
      branchFailedAction:
        language === 'en'
          ? 'Pivot to zero-cost community & gifting partnerships.'
          : 'التركيز على التسويق التعاوني والمحتوى العضوي بدلاً من الإعلانات المدفوعة.',
    },
    {
      id: 'assume_supply',
      title:
        language === 'en'
          ? `Supplier delivers on time within ${product.deliveryDays} days with consistent quality`
          : `التزام المورد بالتوريد خلال ${product.deliveryDays} يوماً وبالجودة المتفق عليها`,
      category: 'supply',
      supportingEvidence:
        product.hasAlternativeSupplier
          ? language === 'en'
            ? 'Alternative supplier option is marked available.'
            : 'يوجد مورد بديل مسجل في بيانات المنتج.'
          : language === 'en'
            ? 'Single supplier dependency without a verified backup.'
            : 'اعتماد على مورد واحد فقط دون بديل موثق.',
      missingInformation:
        language === 'en'
          ? 'Sample inspection & written delivery terms.'
          : 'فحص عينة فعلية وشروط التأخير والاستبدال.',
      failureScenario:
        language === 'en'
          ? 'Delayed shipment misses peak gift season or packaging arrives damaged.'
          : 'تأخر الشحنة عن موسم الهدايا أو وصول التغليف بجودة أقل من المتوقع.',
      estimatedFinancialImpact:
        Math.round((controls.shippingCost + controls.marketingBudget) * 1000) / 1000,
      severity: !product.hasAlternativeSupplier ? 'high' : 'low',
      severityReason: !product.hasAlternativeSupplier
        ? language === 'en'
          ? 'No backup supplier recorded if delays occur.'
          : 'عدم توفر مورد بديل يرفع حساسية المشروع لأي تأخير.'
        : language === 'en'
          ? 'Backup supplier reduces single-point supply risk.'
          : 'وجود مورد بديل يقلل أثر التعطل.',
      recommendedExperiment:
        language === 'en'
          ? 'Order 1–2 paid inspection samples and verify a secondary local supplier.'
          : 'طلب عينة فحص واحدة وتوثيق مورد محلي بديل قبل دفع قيمة الدفعة.',
      estimatedExperimentCost: Math.min(8, controls.unitCost * 2 + 4),
      evidenceNeeded:
        language === 'en'
          ? 'Physical sample approved + backup supplier quote saved.'
          : 'اعتماد جودة العينة الفعلية وحفظ عرض سعر من مورد بديل.',
      testStatus: 'untested',
      branchPassedAction:
        language === 'en'
          ? 'Sign off supplier batch with clear milestone delivery.'
          : 'تأكيد طلب الدفعة مع اشتراط الدفع المرحلي.',
      branchFailedAction:
        language === 'en'
          ? 'Switch to local wholesale supplier even at slightly higher unit cost.'
          : 'التحول إلى مورد محلي أسرع ولو بتكلفة وحدة أعلى قليلاً.',
    },
  ];

  return assumptions;
}

export function generateReengineeredPlans(
  project: Project,
  language: 'ar' | 'en' = 'ar'
): ReengineeredPlan[] {
  const product = getActiveProduct(project);
  const base = project.twinControls;
  const moq = Math.max(1, product.supplierMinOrderQty || 1);

  // Respect supplier MOQ rule: never suggest ordering fewer units than MOQ unless via negotiation/alternative/pre-order
  const safeOrderQty = moq;
  const safeSold = Math.min(safeOrderQty, Math.max(1, Math.round(safeOrderQty * 0.85)));
  const safePackaging =
    base.packagingCostPerUnit > 0.2
      ? Math.round(base.packagingCostPerUnit * 0.7 * 1000) / 1000
      : base.packagingCostPerUnit;

  const safeControls: TwinControls = {
    ...base,
    orderQuantity: safeOrderQty,
    expectedUnitsSold: safeSold,
    expectedSalesPercentage: Math.round((safeSold / safeOrderQty) * 100),
    packagingCostPerUnit: safePackaging,
    marketingBudget: Math.min(base.marketingBudget, Math.max(5, Math.round(base.marketingBudget * 0.5))),
  };

  const balancedQty = Math.max(moq, Math.round((base.orderQuantity + moq) / 2));
  const balancedSold = Math.min(balancedQty, Math.max(1, Math.round(balancedQty * 0.85)));
  const balancedPrice = Math.round((base.sellingPrice * 1.05) * 1000) / 1000;
  const balancedControls: TwinControls = {
    ...base,
    orderQuantity: balancedQty,
    sellingPrice: balancedPrice,
    expectedUnitsSold: balancedSold,
    expectedSalesPercentage: Math.round((balancedSold / balancedQty) * 100),
  };

  const growthQty = Math.max(moq, base.orderQuantity);
  const growthSold = Math.min(growthQty, Math.max(1, Math.round(growthQty * 0.9)));
  const growthControls: TwinControls = {
    ...base,
    orderQuantity: growthQty,
    expectedUnitsSold: growthSold,
    expectedSalesPercentage: Math.round((growthSold / growthQty) * 100),
    unitCost:
      growthQty >= 40
        ? Math.round(base.unitCost * 0.92 * 1000) / 1000
        : base.unitCost,
  };

  const canNegotiateLowerMoq = product.hasAlternativeSupplier || moq > 20;

  return [
    {
      id: 'safe',
      nameAr: 'الخطة الآمنة',
      nameEn: 'Safe Capital Shield Plan',
      summaryAr: canNegotiateLowerMoq
        ? `البدء بالحد الأدنى للمورد (${moq} وحدة) مع خفض كلفة التغليف وإطلاق حجز مسبق قبل التوسع.`
        : `الالتزام بالحد الأدنى للمورد (${moq} وحدة) دون تجاوزه مع تقليل مصاريف التغليف والتسويق الأولي.`,
      summaryEn: `Start strictly at supplier MOQ (${moq} units), trim packaging cost, and validate pre-orders first.`,
      controls: safeControls,
      moqCompliant: true,
      moqNote:
        language === 'en'
          ? `Respects supplier MOQ (${moq} units). If lower quantity is desired, negotiate a paid sample batch or use a pre-order deposit.`
          : `تحترم الحد الأدنى للمورد (${moq} وحدة). لطلب كمية أقل يلزم التفاوض على عينة تجريبية أو استخدام نظام الحجز المسبق.`,
      assumptions: [
        language === 'en'
          ? `Supplier accepts exact MOQ of ${moq} units`
          : `قبول المورد للطلب عند الحد الأدنى (${moq} وحدة)`,
        language === 'en'
          ? 'Lean packaging maintains perceived gift quality'
          : 'التغليف المبسط يحافظ على جاذبية المنتج للعملاء',
      ],
      advantages: [
        language === 'en'
          ? 'Minimizes capital locked in unsold inventory'
          : 'تقليل رأس المال المجمد في المخزون غير المباع',
        language === 'en'
          ? 'Keeps emergency reserve untouched'
          : 'يحمي احتياطي الطوارئ وسقف الخسارة المقبولة',
      ],
      disadvantages: [
        language === 'en'
          ? 'Lower total gross profit ceiling in first batch'
          : 'سقف ربح إجمالي أقل في الدفعة الأولى',
      ],
      recommendedNextStep:
        language === 'en'
          ? 'Collect 8–10 non-binding pre-orders before paying supplier.'
          : 'جمع 8–10 حجوزات مبدئية غير ملزمة قبل تأكيد الدفع للمورد.',
    },
    {
      id: 'balanced',
      nameAr: 'الخطة المتوازنة',
      nameEn: 'Balanced Validation Plan',
      summaryAr:
        'موازنة حجم الدفعة مع تحسين طفيف في السعر أو القيمة المضافة لحماية الهامش.',
      summaryEn:
        'Balances batch size with modest value-based price optimization to strengthen margin.',
      controls: balancedControls,
      moqCompliant: balancedQty >= moq,
      moqNote:
        language === 'en'
          ? `Batch size (${balancedQty}) meets supplier MOQ (${moq}).`
          : `الكمية (${balancedQty} وحدة) متوافقة مع الحد الأدنى للمورد (${moq} وحدة).`,
      assumptions: [
        language === 'en'
          ? `Market accepts ${balancedPrice.toFixed(3)} OMR with clear differentiation`
          : `قبول السوق لسعر ${balancedPrice.toFixed(3)} ر.ع مع إبراز القيمة المضافة`,
        language === 'en'
          ? '85% sell-through rate within target period'
          : 'تحقيق نسبة بيع 85% خلال المدة المحددة',
      ],
      advantages: [
        language === 'en'
          ? 'Faster break-even point per unit'
          : 'وصول أسرع إلى نقطة التعادل',
        language === 'en'
          ? 'Leaves buffer for packaging and shipping fluctuations'
          : 'يوفر هامش أمان لتقلبات الشحن والتغليف',
      ],
      disadvantages: [
        language === 'en'
          ? 'Requires A/B price validation in Micro Market Lab'
          : 'يتطلب اختبار حساسية السعر أولاً في مختبر العملاء',
      ],
      recommendedNextStep:
        language === 'en'
          ? 'Run a price comparison experiment between current and optimized price.'
          : 'تشغيل اختبار مقارنة السعرين في مختبر العملاء لمدة 5 أيام.',
    },
    {
      id: 'growth',
      nameAr: 'خطة النمو',
      nameEn: 'Guided Growth Plan',
      summaryAr:
        'الاحتفاظ بالكمية الكاملة مع التفاوض على خصم كمية من المورد وربط البيع بحملات المواسم.',
      summaryEn:
        'Maintain full batch scale while negotiating an 8% supplier volume discount and seasonal bundling.',
      controls: growthControls,
      moqCompliant: growthQty >= moq,
      moqNote:
        language === 'en'
          ? `Meets supplier MOQ (${moq}) and leverages volume for supplier negotiation.`
          : `تستوفي الحد الأدنى (${moq}) وتستفيد من الكمية للتفاوض على خصم من المورد.`,
      assumptions: [
        language === 'en'
          ? 'Supplier agrees to ~8% unit discount for current batch size'
          : 'موافقة المورد على خصم يقارب 8% لتكلفة الوحدة عند هذه الكمية',
        language === 'en'
          ? '90% sell-through supported by confirmed pre-launch waitlist'
          : 'بيع 90% من الكمية بدعم قائمة انتظار مؤكدة',
      ],
      advantages: [
        language === 'en'
          ? 'Highest projected net return if demand is validated'
          : 'أعلى عائد صافي محتمل في حال تأكيد الطلب',
      ],
      disadvantages: [
        language === 'en'
          ? 'Highest capital exposure if sales move slower than assumed'
          : 'أعلى تعرض للمخاطر المالية إذا تباطأت المبيعات',
      ],
      recommendedNextStep:
        language === 'en'
          ? 'Do not execute until both pre-orders and supplier discount are confirmed in writing.'
          : 'لا تنفذ هذه الخطة قبل تأكيد خصم المورد وجمع طلبات مسبقة تغطي 40% من الدفعة.',
    },
  ];
}

export function buildFinalRecommendation(
  project: Project,
  metrics: FinancialMetrics,
  language: 'ar' | 'en' = 'ar'
): FinalRecommendation {
  const realResponses = project.experiments.flatMap((e) =>
    e.responses.filter((r) => !r.isDemo)
  );
  const demoResponses = project.experiments.flatMap((e) =>
    e.responses.filter((r) => r.isDemo)
  );
  const hasRealEvidence =
    realResponses.length >= 5 ||
    project.customerMarket.existingCustomerEvidence.trim().length > 35;

  const isNegativeMargin = metrics.contributionMarginPerUnit <= 0;
  const exceedsBudget = metrics.exceedsBudgetBy > 0;
  const breachesMaxLoss = metrics.breachesMaxLoss;

  if (isNegativeMargin || exceedsBudget) {
    return {
      code: 'postpone',
      titleAr: 'أجّل القرار حاليًا',
      titleEn: 'Postpone Investment Currently',
      summaryAr:
        'الأرقام الحالية تكشف إما عجزاً في هامش الوحدة أو تجاوزاً للميزانية المتاحة، مما يجعل التنفيذ المباشر عالي المخاطرة.',
      summaryEn:
        'Current assumptions show either a negative unit margin or a cash outflow exceeding your available budget.',
      whySelected: [
        isNegativeMargin
          ? language === 'en'
            ? 'Unit contribution margin is zero or negative.'
            : 'هامش المساهمة للوحدة يساوي صفراً أو سالب، أي كل وحدة مباعة لا تغطي تكلفتها.'
          : language === 'en'
            ? `Total cash needed exceeds budget by ${metrics.exceedsBudgetBy.toFixed(3)} OMR.`
            : `الإنفاق المطلوب يتجاوز رأس المال المتاح بمقدار ${metrics.exceedsBudgetBy.toFixed(3)} ر.ع.`,
      ],
      supportingEvidence: [
        language === 'en'
          ? `Calculated cash outflow: ${metrics.totalCashOutflow.toFixed(3)} OMR vs Budget: ${project.financial.availableCapital.toFixed(3)} OMR.`
          : `التدفق النقدي المطلوب: ${metrics.totalCashOutflow.toFixed(3)} ر.ع مقابل ميزانية ${project.financial.availableCapital.toFixed(3)} ر.ع.`,
      ],
      missingInformation: [
        language === 'en'
          ? 'Lower-cost supplier quote or higher validated price tier.'
          : 'عرض سعر أقل من مورد بديل أو اختبار شريحة سعرية أعلى.',
      ],
      nextSteps: [
        language === 'en'
          ? 'Open Decision Re-engineering and test the Safe Plan in your Digital Twin.'
          : 'انتقل إلى إعادة هندسة القرار وطبّق الخطة الآمنة في التوأم التجاري.',
      ],
      conditionsToChange: [
        language === 'en'
          ? 'Bring total spending inside available capital and ensure positive unit margin.'
          : 'خفض الإنفاق ليبقى داخل الميزانية وضمان هامش ربح إيجابي للوحدة.',
      ],
    };
  }

  if (breachesMaxLoss && !hasRealEvidence) {
    return {
      code: 'adjust_then_start',
      titleAr: 'ابدأ بعد تعديل الخطة',
      titleEn: 'Adjust Plan Before Starting',
      summaryAr:
        'الفكرة قابلة للربحية حسابياً لكن حجم الدفعة أو المصاريف الحالية تتجاوز سقف الخسارة الذي حددته لحماية رأس مالك.',
      summaryEn:
        'Unit economics work on paper, but current exposure exceeds your chosen maximum acceptable loss limit.',
      whySelected: [
        language === 'en'
          ? `Capital at risk (${metrics.capitalAtRisk.toFixed(3)} OMR) breaches max acceptable loss (${project.financial.maxAcceptableLoss.toFixed(3)} OMR).`
          : `رأس المال المعرض للخطر (${metrics.capitalAtRisk.toFixed(3)} ر.ع) يتجاوز سقف الخسارة المقبولة (${project.financial.maxAcceptableLoss.toFixed(3)} ر.ع).`,
      ],
      supportingEvidence: [
        language === 'en'
          ? `Contribution margin per unit is healthy at ${metrics.contributionMarginPerUnit.toFixed(3)} OMR.`
          : `هامش المساهمة للوحدة إيجابي (${metrics.contributionMarginPerUnit.toFixed(3)} ر.ع).`,
        demoResponses.length > 0 && realResponses.length === 0
          ? language === 'en'
            ? 'Current market lab entries are demonstration data only.'
            : 'بيانات مختبر العملاء الحالية توضيحية وتحتاج استجابات حقيقية.'
          : language === 'en'
            ? `${realResponses.length} real market response(s) recorded.`
            : `تم تسجيل ${realResponses.length} استجابة سوقية فعلية.`,
      ],
      missingInformation: [
        language === 'en'
          ? 'Confirmed pre-orders or lower MOQ negotiation.'
          : 'حجوزات مبدئية مؤكدة أو تقليص كمية الدفعة الأولى بما يتوافق مع المورد.',
      ],
      nextSteps: [
        language === 'en'
          ? 'Apply the Safe Plan (starting at supplier MOQ) and test demand via Micro Market Lab.'
          : 'طبّق الخطة الآمنة (عند الحد الأدنى للمورد) وأطلق اختبار عملاء مصغّر.',
      ],
      conditionsToChange: [
        language === 'en'
          ? 'If pre-orders cover 40% of batch cost, recommendation shifts to Limited Trial.'
          : 'عند تغطية 40% من الدفعة بطلبات مسبقة، تتحول التوصية إلى "ابدأ بتجربة محدودة".',
      ],
    };
  }

  if (!hasRealEvidence) {
    return {
      code: 'test_more',
      titleAr: 'اختبر أكثر قبل الاستثمار',
      titleEn: 'Test Market Demand Further First',
      summaryAr:
        'الأرقام المالية متوازنة ضمن ميزانيتك، لكن القرار ما زال يعتمد على افتراضات لم تُختبر مع عملاء فعليين بعد.',
      summaryEn:
        'Financial boundaries are respected, yet core demand and pricing assumptions lack real customer validation.',
      whySelected: [
        language === 'en'
          ? 'Zero real customer responses collected outside demonstration samples.'
          : 'لا توجد نتائج اختبار كافية من عملاء حقيقيين خارج بيانات العرض التوضيحي.',
      ],
      supportingEvidence: [
        language === 'en'
          ? `Break-even requires ${metrics.breakEvenUnits ?? 'N/A'} units; planned sales are ${metrics.effectiveUnitsSold} units.`
          : `نقطة التعادل تتطلب ${metrics.breakEvenUnits ?? 'غير متاحة'} وحدة، والمبيعات المفترضة ${metrics.effectiveUnitsSold} وحدة.`,
      ],
      missingInformation: [
        language === 'en'
          ? 'At least 10 real survey responses or pre-order reservations.'
          : '10 استجابات حقيقية على الأقل من الفئة المستهدفة أو حجوزات مبدئية.',
      ],
      nextSteps: [
        language === 'en'
          ? 'Share your Micro Market Lab link & QR code with 15–20 target customers in Oman.'
          : 'شارك رابط الاستبيان أو رمز QR من مختبر العملاء مع 15–20 عميلاً محتملاً.',
      ],
      conditionsToChange: [
        language === 'en'
          ? 'Once 40%+ show strong purchase intent at target price, move to Limited Trial.'
          : 'بمجرد تأكيد نية شراء قوية بنسبة 40%+ عند السعر المحدد، انتقل لتجربة محدودة.',
      ],
    };
  }

  return {
    code: 'limited_trial',
    titleAr: 'ابدأ بتجربة محدودة',
    titleEn: 'Start With a Limited Trial',
    summaryAr:
      'المؤشرات المالية ضمن سقف الأمان وتوجد أدلة أولية مشجعة؛ ابدأ بدفعة تجريبية منضبطة وراقب سرعة التصريف.',
    summaryEn:
      'Financial exposure stays within your risk ceiling with encouraging validation signals; launch a disciplined pilot batch.',
    whySelected: [
      language === 'en'
        ? 'Positive margin, budget-compliant cash outflow, and initial customer evidence.'
        : 'هامش ربح إيجابي، إنفاق متوافق مع الميزانية، وتوفر أدلة عملاء داعمة.',
    ],
    supportingEvidence: [
      language === 'en'
        ? `Estimated net result under scenario: ${metrics.netProfitEstimate.toFixed(3)} OMR.`
        : `النتيجة الصافية المقدرة وفق الافتراضات: ${metrics.netProfitEstimate.toFixed(3)} ر.ع.`,
    ],
    missingInformation: [
      language === 'en'
        ? 'Actual repeat purchase behavior after first delivery.'
        : 'معدل إعادة الشراء الفعلي بعد تسليم الدفعة الأولى.',
    ],
    nextSteps: [
      language === 'en'
        ? 'Place pilot batch order, track unsold stock weekly, and protect emergency reserve.'
        : 'اطلب الدفعة التجريبية فقط، وتابع المخزون أسبوعياً مع إبقاء احتياطي الطوارئ محمياً.',
    ],
    conditionsToChange: [
      language === 'en'
        ? 'If first-2-week sell-through drops below 25%, pause restocking and review pricing.'
        : 'إذا قل التصريف في أول أسبوعين عن 25%، أوقف إعادة الطلب وراجع السعر والقناة.',
    ],
  };
}

export function generateOpportunities(
  project: Project,
  metrics: FinancialMetrics,
  language: 'ar' | 'en' = 'ar'
): OpportunityItem[] {
  const product = getActiveProduct(project);
  return [
    {
      id: 'opp_cost',
      area: 'cost',
      title:
        language === 'en'
          ? 'Packaging-to-Price Ratio Optimization'
          : 'تحسين نسبة التغليف إلى سعر البيع',
      reason:
        language === 'en'
          ? `Packaging accounts for ${((project.twinControls.packagingCostPerUnit / Math.max(0.1, project.twinControls.sellingPrice)) * 100).toFixed(1)}% of selling price.`
          : `التغليف يشكّل ${((project.twinControls.packagingCostPerUnit / Math.max(0.1, project.twinControls.sellingPrice)) * 100).toFixed(1)}% من سعر البيع للوحدة.`,
      assumptions:
        language === 'en'
          ? 'Bulk ribbon/sticker sourcing preserves perceived luxury at lower unit cost.'
          : 'استخدام عبوة أبسط مع بطاقة شكر مطبوعة يحافظ على الانطباع الفاخر بتكلفة أقل.',
      difficulty: 'low',
      validationExperiment:
        language === 'en'
          ? 'Test two packaging styles in Micro Market Lab before committing bulk print.'
          : 'اختبر شكلين للتغليف في مختبر العملاء قبل طباعة الكمية الكاملة.',
    },
    {
      id: 'opp_segment',
      area: 'segment',
      title:
        language === 'en'
          ? 'Corporate & Event Gifting Bundles'
          : 'باقات الهدايا المؤسسية والمناسبات',
      reason:
        language === 'en'
          ? `Higher average order value reduces shipping impact (${project.twinControls.shippingCost.toFixed(3)} OMR).`
          : `البيع بكميات مجمعة للمناسبات يقلل أثر تكلفة الشحن (${project.twinControls.shippingCost.toFixed(3)} ر.ع) على الوحدة.`,
      assumptions:
        language === 'en'
          ? 'Local schools, clinics, and family occasions seek curated Omani gift sets.'
          : 'الجهات المحلية والمناسبات العائلية تبحث عن هدايا جاهزة بهوية عُمانية أنيقة.',
      difficulty: 'medium',
      validationExperiment:
        language === 'en'
          ? 'Pitch a 10-box sample offer to 5 local event organizers.'
          : 'تواصل مع 5 منسقي مناسبات بعرض تجريبي لـ 10 علب بخصم بسيط.',
    },
    {
      id: 'opp_channel',
      area: 'channel',
      title:
        language === 'en'
          ? 'Pre-Order WhatsApp Drops Before Stocking'
          : 'إطلاق دفعات حجز مسبق عبر واتساب',
      reason:
        language === 'en'
          ? `Reduces unsold inventory risk (currently ${metrics.unsoldUnits} units in scenario).`
          : `يقلل خطر المخزون غير المباع (المقدر حالياً بـ ${metrics.unsoldUnits} وحدة).`,
      assumptions:
        language === 'en'
          ? `Customers accept ${product.deliveryDays} days delivery wait for curated items.`
          : `قبول العملاء الانتظار مدة ${product.deliveryDays} أيام عند التوضيح المسبق.`,
      difficulty: 'low',
      validationExperiment:
        language === 'en'
          ? 'Run a 48-hour WhatsApp status pre-order test.'
          : 'اختبار قائمة حجز مسبق لمدة 48 ساعة عبر حالات واتساب وإنستغرام.',
    },
    {
      id: 'opp_missing',
      area: 'missing_info',
      title:
        language === 'en'
          ? 'Document Real Competitor Differentiation'
          : 'توثيق نقطة التميز أمام المنافسين المحليين',
      reason:
        language === 'en'
          ? `Currently ${project.competitors.length} competitor(s) logged; deeper price-value mapping unlocks sharper positioning.`
          : `تم تسجيل ${project.competitors.length} منافسين؛ تعميق المقارنة يوضح سبب اختيار العميل لك.`,
      assumptions:
        language === 'en'
          ? 'Customers compare at least 2 local alternatives before buying gifts.'
          : 'العميل يقارن خيارين محليين على الأقل قبل شراء الهدية.',
      difficulty: 'low',
      validationExperiment:
        language === 'en'
          ? 'Log 3 active local competitors with verified public prices.'
          : 'إضافة 3 منافسين محليين بأسعارهم المعلنة ونقاط ضعفهم.',
    },
  ];
}

export function createDecisionFingerprintSnapshot(
  project: Project,
  metrics: FinancialMetrics,
  previous?: DecisionFingerprint,
  language: 'ar' | 'en' = 'ar'
): DecisionFingerprint {
  const rec = buildFinalRecommendation(project, metrics, language);
  const product = getActiveProduct(project);
  const assumptions = generateReverseAssumptions(project, metrics, language);
  const realResponses = project.experiments.flatMap((e) =>
    e.responses.filter((r) => !r.isDemo)
  );

  const originalDecision =
    language === 'en'
      ? `Order ${project.twinControls.orderQuantity} units of ${product.name} at ${project.twinControls.sellingPrice.toFixed(3)} OMR`
      : `طلب ${project.twinControls.orderQuantity} وحدة من "${product.name}" بسعر بيع ${project.twinControls.sellingPrice.toFixed(3)} ر.ع`;

  const changedFromPrevious: string[] = [];
  if (previous) {
    if (previous.financialCommitment !== metrics.totalCashOutflow) {
      changedFromPrevious.push(
        language === 'en'
          ? `Financial commitment changed from ${previous.financialCommitment.toFixed(3)} to ${metrics.totalCashOutflow.toFixed(3)} OMR.`
          : `تغير الالتزام المالي من ${previous.financialCommitment.toFixed(3)} ر.ع إلى ${metrics.totalCashOutflow.toFixed(3)} ر.ع.`
      );
    }
    if (previous.recommendationCode !== rec.code) {
      changedFromPrevious.push(
        language === 'en'
          ? `Final recommendation shifted from "${previous.finalOutcome}" to "${rec.titleEn}".`
          : `تغيرت التوصية النهائية من "${previous.finalOutcome}" إلى "${rec.titleAr}".`
      );
    }
    if (previous.originalDecision !== originalDecision) {
      changedFromPrevious.push(
        language === 'en'
          ? `Decision parameters updated (${originalDecision}).`
          : `تم تحديث معطيات القرار إلى: ${originalDecision}.`
      );
    }
  }

  return {
    id: `fp_${Date.now().toString(36)}`,
    version: previous ? previous.version + 1 : 1,
    date: new Date().toISOString(),
    originalDecision,
    financialCommitment: Math.round(metrics.totalCashOutflow * 1000) / 1000,
    mainAssumptions: assumptions.map((a) => a.title),
    supportingEvidence: [
      ...rec.supportingEvidence,
      realResponses.length > 0
        ? language === 'en'
          ? `${realResponses.length} verified customer test responses`
          : `${realResponses.length} استجابة حقيقية في مختبر العملاء`
        : language === 'en'
          ? 'No live customer responses recorded yet'
          : 'لا توجد استجابات عملاء حقيقية مسجلة بعد',
    ],
    missingEvidence: rec.missingInformation,
    risks: assumptions
      .filter((a) => a.severity !== 'low')
      .map((a) => `${a.title} — ${a.failureScenario}`),
    alternativeDecisions: [
      language === 'en'
        ? `Start at supplier MOQ (${product.supplierMinOrderQty} units)`
        : `البدء بالحد الأدنى للمورد (${product.supplierMinOrderQty} وحدة)`,
      language === 'en' ? 'Pre-order validation batch' : 'اختبار الطلب المسبق قبل الشراء',
    ],
    selectedExperiment:
      project.experiments[0]?.title ||
      (language === 'en' ? 'Micro price & interest survey' : 'استبيان السعر والاهتمام الأولي'),
    finalOutcome: language === 'en' ? rec.titleEn : rec.titleAr,
    recommendationCode: rec.code,
    changedFromPrevious: changedFromPrevious.length > 0 ? changedFromPrevious : undefined,
  };
}

export function buildTimeMachineSeries(
  controls: TwinControls,
  project: Project,
  months: 1 | 3 | 6 | 12,
  shocks: {
    supplierCostDeltaPct: number;
    demandDeltaPct: number;
    priceDeltaPct: number;
    marketingDeltaPct: number;
    shippingDeltaPct: number;
  }
) {
  const scenarios = [
    { key: 'optimistic', demandMult: 1.15, costMult: 0.97 },
    { key: 'base', demandMult: 1.0, costMult: 1.0 },
    { key: 'pessimistic', demandMult: 0.65, costMult: 1.08 },
  ] as const;

  const adjustedUnitCost =
    controls.unitCost * (1 + shocks.supplierCostDeltaPct / 100);
  const adjustedPrice =
    controls.sellingPrice * (1 + shocks.priceDeltaPct / 100);
  const adjustedMarketing =
    controls.marketingBudget * (1 + shocks.marketingDeltaPct / 100);
  const adjustedShipping =
    controls.shippingCost * (1 + shocks.shippingDeltaPct / 100);

  const monthlyData: Array<{
    month: number;
    labelAr: string;
    labelEn: string;
    optimisticCash: number;
    baseCash: number;
    pessimisticCash: number;
    optimisticProfit: number;
    baseProfit: number;
    pessimisticProfit: number;
  }> = [];

  const summary: Record<
    'optimistic' | 'base' | 'pessimistic',
    {
      revenue: number;
      expenses: number;
      cashBalance: number;
      remainingInventory: number;
      netProfit: number;
    }
  > = {
    optimistic: { revenue: 0, expenses: 0, cashBalance: 0, remainingInventory: 0, netProfit: 0 },
    base: { revenue: 0, expenses: 0, cashBalance: 0, remainingInventory: 0, netProfit: 0 },
    pessimistic: { revenue: 0, expenses: 0, cashBalance: 0, remainingInventory: 0, netProfit: 0 },
  };

  for (const s of scenarios) {
    let cash = project.financial.availableCapital;
    let inventory = 0;
    let totalRev = 0;
    let totalExp = 0;
    let totalCogs = 0;

    for (let m = 1; m <= months; m++) {
      // Restock cycle every time inventory is low or month 1
      const needsRestock = m === 1 || inventory < Math.max(5, Math.round(controls.orderQuantity * 0.2));
      const orderQty = needsRestock ? controls.orderQuantity : 0;
      const unitPurchase = adjustedUnitCost * s.costMult;
      const invCost = orderQty * (unitPurchase + controls.packagingCostPerUnit);
      const ship = orderQty > 0 ? adjustedShipping : 0;
      const mkt = adjustedMarketing;
      const opex = controls.operatingExpenses + controls.otherExpenses;

      inventory += orderQty;

      const rawDemand = Math.round(
        controls.expectedUnitsSold *
          s.demandMult *
          (1 + shocks.demandDeltaPct / 100)
      );
      const sold = Math.max(0, Math.min(inventory, rawDemand));
      inventory -= sold;

      const rev = sold * adjustedPrice;
      const exp = invCost + ship + mkt + opex;
      const cogs = sold * (unitPurchase + controls.packagingCostPerUnit);

      cash = cash + rev - exp;
      totalRev += rev;
      totalExp += exp;
      totalCogs += cogs;

      if (monthlyData.length < m) {
        monthlyData.push({
          month: m,
          labelAr: `شهر ${m}`,
          labelEn: `M${m}`,
          optimisticCash: 0,
          baseCash: 0,
          pessimisticCash: 0,
          optimisticProfit: 0,
          baseProfit: 0,
          pessimisticProfit: 0,
        });
      }

      const row = monthlyData[m - 1];
      const cumProfit = totalRev - totalCogs - (totalExp - (totalRev > 0 ? 0 : 0));
      // Track net operating profit accurately: totalRev - totalCogs - non-inventory expenses
      const nonInvExp = m * (adjustedMarketing + controls.operatingExpenses + controls.otherExpenses) + (m === 1 ? adjustedShipping : 0);
      const netSoFar = totalRev - totalCogs - nonInvExp;

      if (s.key === 'optimistic') {
        row.optimisticCash = Number(cash.toFixed(3));
        row.optimisticProfit = Number(netSoFar.toFixed(3));
      } else if (s.key === 'base') {
        row.baseCash = Number(cash.toFixed(3));
        row.baseProfit = Number(netSoFar.toFixed(3));
      } else {
        row.pessimisticCash = Number(cash.toFixed(3));
        row.pessimisticProfit = Number(netSoFar.toFixed(3));
      }
      void cumProfit;
    }

    const totalNonInvExp =
      months * (adjustedMarketing + controls.operatingExpenses + controls.otherExpenses) +
      adjustedShipping;

    summary[s.key] = {
      revenue: Number(totalRev.toFixed(3)),
      expenses: Number(totalExp.toFixed(3)),
      cashBalance: Number(cash.toFixed(3)),
      remainingInventory: inventory,
      netProfit: Number((totalRev - totalCogs - totalNonInvExp).toFixed(3)),
    };
  }

  return { monthlyData, summary };
}

export function buildRuleBasedAdvisorReply(
  question: string,
  project: Project,
  metrics: FinancialMetrics,
  language: 'ar' | 'en' = 'ar'
): string {
  const q = question.toLowerCase();
  const product = getActiveProduct(project);
  const rec = buildFinalRecommendation(project, metrics, language);

  if (language === 'en') {
    if (q.includes('budget') || q.includes('enough') || q.includes('capital')) {
      return `[Demo Rule-Based Analysis]\nAvailable budget: ${project.financial.availableCapital.toFixed(3)} OMR. Total initial spending + operating expenses: ${metrics.totalCashOutflow.toFixed(3)} OMR (${metrics.budgetUsagePercent.toFixed(1)}% of capital).\n${
        metrics.exceedsBudgetBy > 0
          ? `Warning: You exceed budget by ${metrics.exceedsBudgetBy.toFixed(3)} OMR.`
          : `Remaining cash if ${metrics.effectiveUnitsSold} units sell: ${metrics.remainingCash.toFixed(3)} OMR. Note: Capital at risk before sales is ${metrics.totalCashOutflow.toFixed(3)} OMR, while your max loss limit is ${project.financial.maxAcceptableLoss.toFixed(3)} OMR.`
      }`;
    }
    if (q.includes('risk') || q.includes('danger')) {
      return `[Demo Rule-Based Analysis]\nYour biggest risk right now is ${
        metrics.breachesMaxLoss
          ? `capital exposure (${metrics.capitalAtRisk.toFixed(3)} OMR) exceeding your max acceptable loss (${project.financial.maxAcceptableLoss.toFixed(3)} OMR)`
          : 'untested market demand at your selected selling price'
      }.\nRecommended validation: Run a low-cost pre-order or two-price test in the Micro Market Testing Lab before ordering ${project.twinControls.orderQuantity} units.`;
    }
    if (q.includes('price') || q.includes('lower') || q.includes('discount')) {
      const lowerPrice = Math.max(0.5, project.twinControls.sellingPrice - 0.5);
      const newMargin = lowerPrice - (project.twinControls.unitCost + project.twinControls.packagingCostPerUnit);
      return `[Demo Rule-Based Analysis]\nIf you lower price by 0.500 OMR to ${lowerPrice.toFixed(3)} OMR, unit contribution margin drops from ${metrics.contributionMarginPerUnit.toFixed(3)} OMR to ${newMargin.toFixed(3)} OMR.\nYou would need more units to break even. Test price elasticity in the Digital Twin or Micro Market Lab first.`;
    }
    if (q.includes('cost') || q.includes('reduce')) {
      return `[Demo Rule-Based Analysis]\nTo reduce initial outlay without breaking supplier MOQ (${product.supplierMinOrderQty} units): 1) Start at ${product.supplierMinOrderQty} units instead of ${project.twinControls.orderQuantity}, saving ${((project.twinControls.orderQuantity - product.supplierMinOrderQty) * (project.twinControls.unitCost + project.twinControls.packagingCostPerUnit)).toFixed(3)} OMR. 2) Trim packaging (${project.twinControls.packagingCostPerUnit.toFixed(3)} OMR/unit) on pilot batch.`;
    }
    return `[Demo Rule-Based Analysis]\nCurrent recommendation for "${project.name}": ${rec.titleEn}.\n• Planned spending: ${metrics.totalInitialSpending.toFixed(3)} OMR\n• Break-even: ${metrics.breakEvenUnits ?? 'N/A'} units\n• Next step: ${rec.nextSteps[0]}`;
  }

  // Arabic rule-based responses
  if (q.includes('ميزاني') || q.includes('كافية') || q.includes('رأس المال')) {
    return `[تحليل توضيحي مبني على القواعد]\n• رأس المال المتاح: ${project.financial.availableCapital.toFixed(3)} ر.ع.\n• إجمالي الإنفاق المطلوب: ${metrics.totalCashOutflow.toFixed(3)} ر.ع (${metrics.budgetUsagePercent.toFixed(1)}% من الميزانية).\n${
      metrics.exceedsBudgetBy > 0
        ? `• تنبيه: الإنفاق يتجاوز ميزانيتك بمقدار ${metrics.exceedsBudgetBy.toFixed(3)} ر.ع.`
        : `• الميزانية تكفي لتشغيل الدفعة، لكن تأكد من حماية حد الخسارة المقبولة (${project.financial.maxAcceptableLoss.toFixed(3)} ر.ع) لأن المخزون غير المباع يجمّد السيولة.`
    }`;
  }
  if (q.includes('خطر') || q.includes('مخاطر')) {
    return `[تحليل توضيحي مبني على القواعد]\nأكبر خطر حالي في مشروع "${project.name}" هو ${
      metrics.breachesMaxLoss
        ? `تجاوز التعرض المالي (${metrics.capitalAtRisk.toFixed(3)} ر.ع) لسقف الخسارة المقبولة (${project.financial.maxAcceptableLoss.toFixed(3)} ر.ع)`
        : 'الاعتماد على افتراض الطلب والسعر دون نتائج عملاء حقيقية كافية'
    }.\n• الإجراء المقترح: اختبر الطلب عبر حجز مسبق غير ملزم في مختبر العملاء قبل دفع قيمة الدفعة للمورد.`;
  }
  if (q.includes('السعر') || q.includes('خفضت')) {
    const newPrice = Math.max(0.5, project.twinControls.sellingPrice - 0.5);
    const newMargin =
      newPrice - (project.twinControls.unitCost + project.twinControls.packagingCostPerUnit);
    const fixed =
      project.twinControls.shippingCost +
      project.twinControls.marketingBudget +
      project.twinControls.operatingExpenses +
      project.twinControls.otherExpenses;
    const newBe = newMargin > 0 ? Math.ceil(fixed / newMargin) : null;
    return `[تحليل توضيحي مبني على القواعد]\nإذا خفضت السعر بمقدار 0.500 ر.ع ليصبح ${newPrice.toFixed(3)} ر.ع:\n• ينخفض هامش الوحدة من ${metrics.contributionMarginPerUnit.toFixed(3)} ر.ع إلى ${newMargin.toFixed(3)} ر.ع.\n• ترتفع نقطة التعادل إلى ${newBe ?? 'غير محققة'} وحدة بدلاً من ${metrics.breakEvenUnits ?? 'غير محققة'}.\nجرّب ذلك في التوأم التجاري قبل تغيير التسعير.`;
  }
  if (q.includes('تكاليف') || q.includes('أقلل')) {
    const minQty = Math.min(project.twinControls.orderQuantity, product.supplierMinOrderQty);
    const saved =
      (project.twinControls.orderQuantity - minQty) *
      (project.twinControls.unitCost + project.twinControls.packagingCostPerUnit);
    return `[تحليل توضيحي مبني على القواعد]\nلتقليل التكاليف دون مخالفة الحد الأدنى للمورد (${product.supplierMinOrderQty} وحدة):\n1. البدء بالحد الأدنى للمورد (${minQty} وحدة) يوفّر ${saved.toFixed(3)} ر.ع من تكلفة المخزون والتغليف.\n2. تقليل كلفة التغليف الحالية (${project.twinControls.packagingCostPerUnit.toFixed(3)} ر.ع/وحدة) عبر ملصق هوية أنيق بدلاً من الصناديق المكلفة في التجربة الأولى.`;
  }
  if (q.includes('تغيرت') || q.includes('توصيت')) {
    return `[تحليل توضيحي مبني على القواعد]\nالتوصية الحالية هي: "${rec.titleAr}".\nالسبب: ${rec.whySelected.join(' ')}\nما يغيّر هذه التوصية: ${rec.conditionsToChange.join(' ')}`;
  }

  return `[تحليل توضيحي مبني على القواعد]\nالتوصية الحالية لمشروع "${project.name}": ${rec.titleAr}.\n• الإنفاق الأولي المخطط: ${metrics.totalInitialSpending.toFixed(3)} ر.ع\n• نقطة التعادل: ${metrics.breakEvenUnits ?? 'غير محققة'} وحدة\n• الخطوة التالية المقترحة: ${rec.nextSteps[0]}`;
}
