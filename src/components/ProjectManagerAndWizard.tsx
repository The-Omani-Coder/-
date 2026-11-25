import React, { useState } from 'react';
import {
  Check,
  Copy,
  Edit3,
  FolderOpen,
  Plus,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import type {
  CurrencyPrecision,
  Language,
  ProductItem,
  Project,
} from '../types/mihak';
import {
  calculateFinancialMetrics,
  createDefaultTwinControls,
  formatOMR,
  getActiveProduct,
} from '../engine/financialEngine';
import {
  createDecisionFingerprintSnapshot,
  generateReverseAssumptions,
} from '../engine/riskEngine';

interface ProjectManagerProps {
  projects: Project[];
  activeProjectId: string;
  language: Language;
  precision: CurrencyPrecision;
  onSelectProject: (id: string) => void;
  onCreateNewWizard: () => void;
  onEditActiveWizard: () => void;
  onDuplicateProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  onResetDemo: () => void;
}

export const ProjectManager: React.FC<ProjectManagerProps> = ({
  projects,
  activeProjectId,
  language,
  precision,
  onSelectProject,
  onCreateNewWizard,
  onEditActiveWizard,
  onDuplicateProject,
  onDeleteProject,
  onResetDemo,
}) => {
  const isAr = language === 'ar';
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#353B40]">
            {isAr ? 'مشروعاتي' : 'My Projects'}
          </h1>
          <p className="text-sm text-[#686E74] mt-1">
            {isAr
              ? 'أنشئ مشاريع متعددة، عدّل بياناتها، أو أعد تعيين مشروع العرض التوضيحي للهاكاثون.'
              : 'Create multiple ventures, edit details, or reset the hackathon demonstration project.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onResetDemo}
            className="px-4 py-2.5 text-xs font-semibold text-[#353B40] bg-[#FAF8F4] hover:bg-[#EBCB91]/30 border border-[#D8B98C] rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isAr ? 'إعادة ضبط العرض التجريبي' : 'Reset Demo Project'}</span>
          </button>
          <button
            type="button"
            onClick={onCreateNewWizard}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-[#2C6E8A] hover:bg-[#245B73] rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'مشروع جديد (معالج 5 خطوات)' : 'New Project (5-Step Wizard)'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((p) => {
          const isActive = p.id === activeProjectId;
          const m = calculateFinancialMetrics(p.twinControls, p.financial);
          return (
            <div
              key={p.id}
              className={`bg-white rounded-2xl p-6 border transition-colors space-y-4 ${
                isActive ? 'border-[#2C6E8A] ring-1 ring-[#2C6E8A]/20' : 'border-[#E5DDD0]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#686E74]">
                    <span>{p.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{p.city}</span>
                    {p.isDemo && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#2C6E8A] font-semibold">
                          {isAr ? 'نموذج عرض توضيحي' : 'Demo Sample'}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="font-display text-lg font-bold text-[#353B40] mt-1">
                    {p.name}
                  </h2>
                </div>
                {isActive && (
                  <span className="text-xs font-semibold text-[#2C6E8A]">
                    {isAr ? 'المشروع النشط' : 'Active'}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#686E74] line-clamp-2">{p.description}</p>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#F0EAE0] text-xs">
                <div>
                  <p className="text-[#686E74]">{isAr ? 'الميزانية' : 'Capital'}</p>
                  <p className="font-mono-num font-bold text-[#353B40]">
                    {formatOMR(p.financial.availableCapital, language, precision)}
                  </p>
                </div>
                <div>
                  <p className="text-[#686E74]">{isAr ? 'الإنفاق' : 'Spend'}</p>
                  <p className="font-mono-num font-bold text-[#2C6E8A]">
                    {formatOMR(m.totalInitialSpending, language, precision)}
                  </p>
                </div>
                <div>
                  <p className="text-[#686E74]">{isAr ? 'المنتجات' : 'Products'}</p>
                  <p className="font-mono-num font-bold text-[#353B40]">
                    {p.products.length}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <div className="flex items-center gap-2">
                  {!isActive && (
                    <button
                      type="button"
                      onClick={() => onSelectProject(p.id)}
                      className="px-3.5 py-2 text-xs font-semibold text-white bg-[#2C6E8A] hover:bg-[#245B73] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تفعيل المشروع' : 'Open Project'}</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onSelectProject(p.id);
                      onEditActiveWizard();
                    }}
                    className="px-3 py-2 text-xs font-semibold text-[#353B40] bg-[#FAF8F4] hover:bg-[#DCEEF8] border border-[#E5DDD0] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تعديل' : 'Edit'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDuplicateProject(p.id)}
                    className="px-3 py-2 text-xs font-semibold text-[#353B40] bg-[#FAF8F4] hover:bg-[#DCEEF8] border border-[#E5DDD0] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{isAr ? 'نسخ' : 'Duplicate'}</span>
                  </button>
                </div>

                {projects.length > 1 && (
                  <>
                    {confirmDeleteId === p.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteProject(p.id);
                            setConfirmDeleteId(null);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold bg-[#DC8983] text-white rounded-lg cursor-pointer"
                        >
                          {isAr ? 'تأكيد الحذف' : 'Confirm'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1.5 text-xs text-[#686E74] cursor-pointer"
                        >
                          {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(p.id)}
                        className="p-2 text-[#A9443E] hover:bg-[#DC8983]/20 rounded-xl transition-colors cursor-pointer"
                        aria-label={isAr ? 'حذف المشروع' : 'Delete Project'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface ProjectWizardProps {
  initialProject?: Project;
  language: Language;
  onSaveProject: (project: Project) => void;
  onCancel: () => void;
}

export const ProjectWizard: React.FC<ProjectWizardProps> = ({
  initialProject,
  language,
  onSaveProject,
  onCancel,
}) => {
  const isAr = language === 'ar';
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [validationError, setValidationError] = useState('');

  // Step 1
  const [name, setName] = useState(initialProject?.name || '');
  const [logoText, setLogoText] = useState(initialProject?.logoText || '');
  const [category, setCategory] = useState(
    initialProject?.category || (isAr ? 'الهدايا والعطور' : 'Gifts & Perfumes')
  );
  const [description, setDescription] = useState(initialProject?.description || '');
  const [stage, setStage] = useState<Project['stage']>(initialProject?.stage || 'idea');
  const [targetMarket, setTargetMarket] = useState(
    initialProject?.targetMarket || (isAr ? 'السوق المحلي العُماني' : 'Local Omani Market')
  );
  const [country, setCountry] = useState(initialProject?.country || (isAr ? 'عُمان' : 'Oman'));
  const [city, setCity] = useState(initialProject?.city || (isAr ? 'مسقط' : 'Muscat'));
  const [targetAudience, setTargetAudience] = useState(initialProject?.targetAudience || '');
  const [mainGoal, setMainGoal] = useState(
    initialProject?.mainGoal || (isAr ? 'إطلاق منتج' : 'Launch product')
  );
  const [challenges, setChallenges] = useState(initialProject?.challenges || '');
  const [businessType, setBusinessType] = useState<Project['businessType']>(
    initialProject?.businessType || 'online'
  );

  // Step 2: Multiple products
  const blankProduct = (): ProductItem => ({
    id: `prod_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
    name: '',
    category: category || '',
    description: '',
    images: [],
    unitPurchaseCost: 2,
    productionCost: 0,
    sellingPrice: 5,
    packagingCostPerUnit: 0.3,
    totalShippingCost: 10,
    supplierMinOrderQty: 20,
    plannedOrderQty: 50,
    supplierName: '',
    deliveryDays: 7,
    hasAlternativeSupplier: true,
    seasonality: 'year_round',
    estimatedInventoryCapacity: 100,
  });

  const [products, setProducts] = useState<ProductItem[]>(
    initialProject?.products?.length ? initialProject.products : [blankProduct()]
  );
  const [editingIdx, setEditingIdx] = useState(0);

  // Step 3: Financial
  const [availableCapital, setAvailableCapital] = useState(
    initialProject?.financial.availableCapital ?? 150
  );
  const [maxAcceptableLoss, setMaxAcceptableLoss] = useState(
    initialProject?.financial.maxAcceptableLoss ?? 30
  );
  const [monthlyOperatingCosts, setMonthlyOperatingCosts] = useState(
    initialProject?.financial.monthlyOperatingCosts ?? 0
  );
  const [marketingBudget, setMarketingBudget] = useState(
    initialProject?.financial.marketingBudget ?? 10
  );
  const [emergencyReserve, setEmergencyReserve] = useState(
    initialProject?.financial.emergencyReserve ?? 20
  );
  const [otherExpenses, setOtherExpenses] = useState(
    initialProject?.financial.otherExpenses ?? 0
  );
  const [expectedSalesQuantity, setExpectedSalesQuantity] = useState(
    initialProject?.financial.expectedSalesQuantity ?? 35
  );
  const [timePeriodMonths, setTimePeriodMonths] = useState<1 | 3 | 6 | 12>(
    initialProject?.financial.timePeriodMonths ?? 1
  );

  // Step 4: Customer & Market
  const [targetAgeGroup, setTargetAgeGroup] = useState(
    initialProject?.customerMarket.targetAgeGroup || '20 - 40'
  );
  const [customerPreferences, setCustomerPreferences] = useState(
    initialProject?.customerMarket.customerPreferences || ''
  );
  const [customerNeeds, setCustomerNeeds] = useState(
    initialProject?.customerMarket.customerNeeds || ''
  );
  const [salesChannelsText, setSalesChannelsText] = useState(
    initialProject?.customerMarket.salesChannels.join(', ') || 'Instagram, WhatsApp'
  );
  const [existingCustomerEvidence, setExistingCustomerEvidence] = useState(
    initialProject?.customerMarket.existingCustomerEvidence || ''
  );
  const [productDifferentiation, setProductDifferentiation] = useState(
    initialProject?.customerMarket.productDifferentiation || ''
  );
  const [expectedDemandAssumptions, setExpectedDemandAssumptions] = useState(
    initialProject?.customerMarket.expectedDemandAssumptions || ''
  );

  const currentProd = products[editingIdx] || products[0];

  const updateCurrentProduct = (patch: Partial<ProductItem>) => {
    setProducts((prev) =>
      prev.map((item, idx) => (idx === editingIdx ? { ...item, ...patch } : item))
    );
  };

  const handleNext = () => {
    setValidationError('');
    if (step === 1 && !name.trim()) {
      setValidationError(isAr ? 'يرجى إدخال اسم المشروع.' : 'Please enter project name.');
      return;
    }
    if (step === 2) {
      if (!currentProd.name.trim()) {
        setValidationError(isAr ? 'يرجى إدخال اسم المنتج.' : 'Please enter product name.');
        return;
      }
      if (currentProd.sellingPrice <= 0 || currentProd.plannedOrderQty <= 0) {
        setValidationError(
          isAr
            ? 'سعر البيع وكمية الطلب يجب أن يكونا أكبر من صفر.'
            : 'Selling price and planned quantity must be greater than zero.'
        );
        return;
      }
    }
    if (step === 3 && availableCapital <= 0) {
      setValidationError(
        isAr ? 'رأس المال المتاح يجب أن يكون أكبر من صفر.' : 'Available capital must be positive.'
      );
      return;
    }
    setStep((s) => Math.min(5, s + 1) as 1 | 2 | 3 | 4 | 5);
  };

  const handleFinish = () => {
    const activeProd = products[0];
    const financial = {
      availableCapital: Math.max(0, availableCapital),
      maxAcceptableLoss: Math.max(0, maxAcceptableLoss),
      monthlyOperatingCosts: Math.max(0, monthlyOperatingCosts),
      marketingBudget: Math.max(0, marketingBudget),
      emergencyReserve: Math.max(0, emergencyReserve),
      otherExpenses: Math.max(0, otherExpenses),
      maxExperimentSpending: Math.min(15, Math.max(5, Math.round(availableCapital * 0.08))),
      expectedSalesQuantity: Math.min(
        activeProd.plannedOrderQty,
        Math.max(0, expectedSalesQuantity)
      ),
      timePeriodMonths,
      currency: 'OMR' as const,
    };

    const twinControls = createDefaultTwinControls(activeProd, financial);
    const baseProj: Project = {
      id: initialProject?.id || `proj_${Date.now().toString(36)}`,
      isDemo: initialProject?.isDemo ?? false,
      name: name.trim(),
      logoText: logoText.trim() || name.trim().slice(0, 6),
      category: category.trim(),
      description: description.trim(),
      stage,
      targetMarket: targetMarket.trim(),
      country: country.trim(),
      city: city.trim(),
      targetAudience: targetAudience.trim(),
      mainGoal: mainGoal.trim(),
      challenges: challenges.trim(),
      businessType,
      products,
      activeProductId: activeProd.id,
      financial,
      customerMarket: {
        targetAgeGroup,
        customerPreferences,
        customerNeeds,
        salesChannels: salesChannelsText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        existingCustomerEvidence,
        productDifferentiation,
        expectedDemandAssumptions,
      },
      twinControls,
      savedScenarios: initialProject?.savedScenarios || [],
      competitors: initialProject?.competitors || [],
      experiments: initialProject?.experiments || [],
      assumptions: [],
      fingerprints: initialProject?.fingerprints || [],
      marketingAssets: initialProject?.marketingAssets || [],
      createdAt: initialProject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const metrics = calculateFinancialMetrics(baseProj.twinControls, baseProj.financial);
    baseProj.assumptions = generateReverseAssumptions(baseProj, metrics, language);
    const prevFp = baseProj.fingerprints[baseProj.fingerprints.length - 1];
    baseProj.fingerprints = [
      ...baseProj.fingerprints,
      createDecisionFingerprintSnapshot(baseProj, metrics, prevFp, language),
    ];

    onSaveProject(baseProj);
  };

  const stepLabels = isAr
    ? [
        '1. بيانات المشروع',
        '2. بيانات المنتجات',
        '3. البيانات المالية',
        '4. العملاء والسوق',
        '5. المراجعة والتحليل',
      ]
    : ['1. Business', '2. Products', '3. Financials', '4. Customers', '5. Review & Analyze'];

  const previewMetrics = calculateFinancialMetrics(
    createDefaultTwinControls(currentProd, {
      availableCapital,
      maxAcceptableLoss,
      monthlyOperatingCosts,
      marketingBudget,
      emergencyReserve,
      otherExpenses,
      maxExperimentSpending: 10,
      expectedSalesQuantity,
      timePeriodMonths,
      currency: 'OMR',
    }),
    {
      availableCapital,
      maxAcceptableLoss,
      monthlyOperatingCosts,
      marketingBudget,
      emergencyReserve,
      otherExpenses,
      maxExperimentSpending: 10,
      expectedSalesQuantity,
      timePeriodMonths,
      currency: 'OMR',
    }
  );

  return (
    <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E5DDD0] pb-4">
        <div>
          <h1 className="font-display text-xl font-bold text-[#353B40]">
            {initialProject
              ? isAr
                ? 'تعديل بيانات المشروع'
                : 'Edit Project Details'
              : isAr
                ? 'معالج إنشاء مشروع جديد'
                : 'New Project Wizard'}
          </h1>
          <p className="text-xs text-[#686E74] mt-0.5">
            {isAr
              ? 'العملة الافتراضية: الريال العُماني (OMR)'
              : 'Default currency: Omani Rial (OMR)'}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-semibold text-[#686E74] hover:text-[#353B40] cursor-pointer"
        >
          {isAr ? 'إلغاء والعودة' : 'Cancel'}
        </button>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {stepLabels.map((lbl, idx) => {
          const sNum = (idx + 1) as 1 | 2 | 3 | 4 | 5;
          return (
            <button
              key={lbl}
              type="button"
              onClick={() => setStep(sNum)}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                step === sNum
                  ? 'bg-[#DCEEF8] border-[#2C6E8A] text-[#353B40]'
                  : step > sNum
                    ? 'bg-[#B5D8C5]/30 border-[#B5D8C5] text-[#353B40]'
                    : 'bg-[#FAF8F4] border-[#E5DDD0] text-[#686E74]'
              }`}
            >
              {lbl}
            </button>
          );
        })}
      </div>

      {validationError && (
        <div className="p-3 rounded-xl bg-[#DC8983]/20 border border-[#DC8983] text-xs font-semibold text-[#A9443E]">
          {validationError}
        </div>
      )}

      {/* Step 1: Business Info */}
      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'اسم المشروع *' : 'Project Name *'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isAr ? 'مثال: لمسة للهدايا' : 'e.g. Lamsa Gifts'}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'شعار نصي مختصر' : 'Short Logo Mark'}
            </label>
            <input
              type="text"
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
              placeholder={isAr ? 'مثال: لمسة' : 'e.g. Lamsa'}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'تصنيف المشروع' : 'Project Category'}
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'مرحلة المشروع' : 'Project Stage'}
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as Project['stage'])}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            >
              <option value="idea">{isAr ? 'فكرة جديدة' : 'Idea'}</option>
              <option value="prototype">{isAr ? 'نموذج أولي' : 'Prototype'}</option>
              <option value="existing">{isAr ? 'مشروع قائم' : 'Existing'}</option>
              <option value="scaling">{isAr ? 'توسع' : 'Scaling'}</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'وصف المشروع' : 'Project Description'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'الدولة' : 'Country'}
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'المدينة / الولاية' : 'City / Wilayat'}
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'السوق المستهدف' : 'Target Market'}
            </label>
            <input
              type="text"
              value={targetMarket}
              onChange={(e) => setTargetMarket(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'نوع النشاط (إلكتروني أم فعلي)' : 'Online or Physical'}
            </label>
            <select
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value as Project['businessType'])}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            >
              <option value="online">{isAr ? 'تجارة إلكترونية / منزلية' : 'Online / Home-Based'}</option>
              <option value="physical">{isAr ? 'متجر فعلي' : 'Physical Store'}</option>
              <option value="hybrid">{isAr ? 'مختلط' : 'Hybrid'}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'الجمهور المستهدف' : 'Target Audience'}
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'الهدف التجاري الرئيسي' : 'Main Business Goal'}
            </label>
            <input
              type="text"
              value={mainGoal}
              onChange={(e) => setMainGoal(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'أبرز التحديات الحالية' : 'Business Challenges'}
            </label>
            <input
              type="text"
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
        </div>
      )}

      {/* Step 2: Multiple Products */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E5DDD0]">
            <div className="flex flex-wrap items-center gap-2">
              {products.map((prod, idx) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => setEditingIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                    idx === editingIdx
                      ? 'bg-[#DCEEF8] border-[#2C6E8A] text-[#353B40]'
                      : 'bg-[#FAF8F4] border-[#E5DDD0] text-[#686E74]'
                  }`}
                >
                  {prod.name || `${isAr ? 'منتج' : 'Product'} ${idx + 1}`}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const next = blankProduct();
                  setProducts((p) => [...p, next]);
                  setEditingIdx(products.length);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-[#2C6E8A] text-white rounded-xl cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'إضافة منتج' : 'Add Product'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const dup = {
                    ...currentProd,
                    id: `prod_${Date.now().toString(36)}`,
                    name: `${currentProd.name} (${isAr ? 'نسخة' : 'Copy'})`,
                  };
                  setProducts((p) => [...p, dup]);
                  setEditingIdx(products.length);
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl cursor-pointer"
              >
                {isAr ? 'تكرار' : 'Duplicate'}
              </button>
              {products.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setProducts((p) => p.filter((_, i) => i !== editingIdx));
                    setEditingIdx(0);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-[#A9443E] bg-[#DC8983]/20 rounded-xl cursor-pointer"
                >
                  {isAr ? 'حذف' : 'Delete'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1">
                {isAr ? 'اسم المنتج *' : 'Product Name *'}
              </label>
              <input
                type="text"
                value={currentProd.name}
                onChange={(e) => updateCurrentProduct({ name: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {isAr ? 'تصنيف المنتج' : 'Category'}
              </label>
              <input
                type="text"
                value={currentProd.category}
                onChange={(e) => updateCurrentProduct({ category: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {isAr ? 'اسم المورد' : 'Supplier Name'}
              </label>
              <input
                type="text"
                value={currentProd.supplierName}
                onChange={(e) => updateCurrentProduct({ supplierName: e.target.value })}
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                {isAr ? 'تكلفة الشراء للوحدة (ر.ع)' : 'Unit Purchase Cost (OMR)'}
              </label>
              <input
                type="number"
                min={0}
                step="0.100"
                value={currentProd.unitPurchaseCost}
                onChange={(e) =>
                  updateCurrentProduct({ unitPurchaseCost: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm font-mono-num"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {isAr ? 'تكلفة الإنتاج الإضافية (ر.ع)' : 'Production Cost (OMR)'}
              </label>
              <input
                type="number"
                min={0}
                step="0.100"
                value={currentProd.productionCost}
                onChange={(e) =>
                  updateCurrentProduct({ productionCost: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm font-mono-num"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {isAr ? 'سعر البيع المستهدف (ر.ع)' : 'Selling Price (OMR)'}
              </label>
              <input
                type="number"
                min={0.1}
                step="0.100"
                value={currentProd.sellingPrice}
                onChange={(e) =>
                  updateCurrentProduct({ sellingPrice: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm font-mono-num"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                {isAr ? 'التغليف للوحدة (ر.ع)' : 'Packaging / Unit (OMR)'}
              </label>
              <input
                type="number"
                min={0}
                step="0.050"
                value={currentProd.packagingCostPerUnit}
                onChange={(e) =>
                  updateCurrentProduct({
                    packagingCostPerUnit: Math.max(0, Number(e.target.value)),
                  })
                }
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm font-mono-num"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {isAr ? 'إجمالي الشحن (ر.ع)' : 'Total Shipping Cost (OMR)'}
              </label>
              <input
                type="number"
                min={0}
                step="0.500"
                value={currentProd.totalShippingCost}
                onChange={(e) =>
                  updateCurrentProduct({ totalShippingCost: Math.max(0, Number(e.target.value)) })
                }
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm font-mono-num"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {isAr ? 'الحد الأدنى للمورد (MOQ)' : 'Supplier Min Order Qty'}
              </label>
              <input
                type="number"
                min={1}
                value={currentProd.supplierMinOrderQty}
                onChange={(e) =>
                  updateCurrentProduct({
                    supplierMinOrderQty: Math.max(1, Math.round(Number(e.target.value))),
                  })
                }
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm font-mono-num"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                {isAr ? 'الكمية المخطط طلبها' : 'Planned Order Qty'}
              </label>
              <input
                type="number"
                min={1}
                value={currentProd.plannedOrderQty}
                onChange={(e) =>
                  updateCurrentProduct({
                    plannedOrderQty: Math.max(1, Math.round(Number(e.target.value))),
                  })
                }
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm font-mono-num"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {isAr ? 'مدة التوصيل (أيام)' : 'Delivery Duration (days)'}
              </label>
              <input
                type="number"
                min={1}
                value={currentProd.deliveryDays}
                onChange={(e) =>
                  updateCurrentProduct({
                    deliveryDays: Math.max(1, Math.round(Number(e.target.value))),
                  })
                }
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm font-mono-num"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                {isAr ? 'الموسمية' : 'Seasonality'}
              </label>
              <select
                value={currentProd.seasonality}
                onChange={(e) =>
                  updateCurrentProduct({
                    seasonality: e.target.value as ProductItem['seasonality'],
                  })
                }
                className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
              >
                <option value="year_round">{isAr ? 'طوال العام' : 'Year-round'}</option>
                <option value="occasions">{isAr ? 'أعياد ومناسبات' : 'Occasions / Eid'}</option>
                <option value="seasonal">{isAr ? 'موسمي' : 'Seasonal'}</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={currentProd.hasAlternativeSupplier}
                onChange={(e) =>
                  updateCurrentProduct({ hasAlternativeSupplier: e.target.checked })
                }
              />
              <span>{isAr ? 'يتوفر مورد بديل' : 'Alternative supplier available'}</span>
            </label>
          </div>
        </div>
      )}

      {/* Step 3: Financial Info */}
      {step === 3 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              label: isAr ? 'رأس المال المتاح (ر.ع)' : 'Available Capital (OMR)',
              val: availableCapital,
              set: setAvailableCapital,
            },
            {
              label: isAr ? 'أقصى خسارة مقبولة (ر.ع)' : 'Max Acceptable Loss (OMR)',
              val: maxAcceptableLoss,
              set: setMaxAcceptableLoss,
            },
            {
              label: isAr ? 'تكاليف التشغيل الشهرية (ر.ع)' : 'Monthly Operating Costs (OMR)',
              val: monthlyOperatingCosts,
              set: setMonthlyOperatingCosts,
            },
            {
              label: isAr ? 'ميزانية التسويق (ر.ع)' : 'Marketing Budget (OMR)',
              val: marketingBudget,
              set: setMarketingBudget,
            },
            {
              label: isAr ? 'احتياطي الطوارئ (ر.ع)' : 'Emergency Reserve (OMR)',
              val: emergencyReserve,
              set: setEmergencyReserve,
            },
            {
              label: isAr ? 'مصاريف أخرى (ر.ع)' : 'Other Expenses (OMR)',
              val: otherExpenses,
              set: setOtherExpenses,
            },
            {
              label: isAr ? 'كمية المبيعات المتوقعة' : 'Expected Sales Quantity',
              val: expectedSalesQuantity,
              set: setExpectedSalesQuantity,
            },
          ].map((f, i) => (
            <div key={i}>
              <label className="block text-xs font-semibold mb-1">{f.label}</label>
              <input
                type="number"
                min={0}
                step="0.5"
                value={f.val}
                onChange={(e) => f.set(Math.max(0, Number(e.target.value)))}
                className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm font-mono-num"
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'الفترة الزمنية المختارة' : 'Selected Time Period'}
            </label>
            <select
              value={timePeriodMonths}
              onChange={(e) => setTimePeriodMonths(Number(e.target.value) as 1 | 3 | 6 | 12)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            >
              <option value={1}>{isAr ? 'شهر واحد' : '1 Month'}</option>
              <option value={3}>{isAr ? '3 أشهر' : '3 Months'}</option>
              <option value={6}>{isAr ? '6 أشهر' : '6 Months'}</option>
              <option value={12}>{isAr ? 'سنة كاملة' : '1 Year'}</option>
            </select>
          </div>
        </div>
      )}

      {/* Step 4: Customer & Market */}
      {step === 4 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'الفئة العمرية المستهدفة' : 'Target Age Group'}
            </label>
            <input
              type="text"
              value={targetAgeGroup}
              onChange={(e) => setTargetAgeGroup(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'قنوات البيع (مفصولة بفاصلة)' : 'Sales Channels (comma-separated)'}
            </label>
            <input
              type="text"
              value={salesChannelsText}
              onChange={(e) => setSalesChannelsText(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'تفضيلات العملاء' : 'Customer Preferences'}
            </label>
            <input
              type="text"
              value={customerPreferences}
              onChange={(e) => setCustomerPreferences(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'احتياجات العملاء' : 'Customer Needs'}
            </label>
            <input
              type="text"
              value={customerNeeds}
              onChange={(e) => setCustomerNeeds(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'نقطة تميز المنتج' : 'Product Differentiation'}
            </label>
            <input
              type="text"
              value={productDifferentiation}
              onChange={(e) => setProductDifferentiation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'الأدلة الحالية من العملاء (إن وجدت)' : 'Existing Customer Evidence'}
            </label>
            <input
              type="text"
              value={existingCustomerEvidence}
              onChange={(e) => setExistingCustomerEvidence(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold mb-1">
              {isAr ? 'افتراضات الطلب المتوقع' : 'Expected Demand Assumptions'}
            </label>
            <input
              type="text"
              value={expectedDemandAssumptions}
              onChange={(e) => setExpectedDemandAssumptions(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
            />
          </div>
        </div>
      )}

      {/* Step 5: Review & Analyze */}
      {step === 5 && (
        <div className="space-y-4">
          <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <p className="text-[#686E74]">{isAr ? 'المشروع' : 'Project'}</p>
              <p className="font-bold text-sm text-[#353B40] mt-0.5">{name}</p>
              <p className="text-[#686E74] mt-1">{city}, {country} · {category}</p>
            </div>
            <div>
              <p className="text-[#686E74]">{isAr ? 'المنتج الأساسي' : 'Primary Product'}</p>
              <p className="font-bold text-sm text-[#353B40] mt-0.5">{currentProd.name}</p>
              <p className="font-mono-num text-[#686E74] mt-1">
                {currentProd.plannedOrderQty} {isAr ? 'وحدة' : 'units'} · {currentProd.sellingPrice.toFixed(3)} OMR
              </p>
            </div>
            <div>
              <p className="text-[#686E74]">{isAr ? 'ملخص الأثر المالي الفوري' : 'Instant Financial Preview'}</p>
              <p className="font-mono-num font-bold text-sm text-[#2C6E8A] mt-0.5">
                {isAr ? 'الإنفاق:' : 'Spend:'} {previewMetrics.totalInitialSpending.toFixed(3)} OMR
              </p>
              <p className="font-mono-num text-[#686E74] mt-1">
                {isAr ? 'نقطة التعادل:' : 'Break-even:'} {previewMetrics.breakEvenUnits ?? 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-[#E5DDD0]">
        <button
          type="button"
          onClick={() => (step === 1 ? onCancel() : setStep((s) => (s - 1) as 1 | 2 | 3 | 4 | 5))}
          className="px-4 py-2 text-sm font-semibold text-[#686E74] hover:text-[#353B40] cursor-pointer"
        >
          {step === 1 ? (isAr ? 'إلغاء' : 'Cancel') : isAr ? 'السابق' : 'Previous'}
        </button>

        {step < 5 ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#2C6E8A] hover:bg-[#245B73] rounded-xl cursor-pointer"
          >
            {isAr ? 'التالي' : 'Next'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#2C6E8A] hover:bg-[#245B73] rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>{isAr ? 'حفظ وبدء التحليل في التوأم' : 'Save & Launch Analysis'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
