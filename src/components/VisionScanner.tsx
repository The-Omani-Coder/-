import React, { useRef, useState } from 'react';
import {
  Camera,
  Check,
  Eye,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
} from 'lucide-react';
import type {
  Language,
  ProductItem,
  Project,
  VisionAnalysisResult,
} from '../types/mihak';
import { DEMO_IMAGES } from '../data/demoProject';

interface VisionScannerProps {
  project: Project;
  language: Language;
  onAddScannedProduct: (product: ProductItem) => void;
  onUpdateExistingProductVision: (productId: string, vision: VisionAnalysisResult, imageUrl?: string) => void;
}

export const VisionScanner: React.FC<VisionScannerProps> = ({
  project,
  language,
  onAddScannedProduct,
  onUpdateExistingProductVision,
}) => {
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string>(
    project.products[0]?.images[0] || DEMO_IMAGES.primaryGiftSet
  );
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [analysis, setAnalysis] = useState<VisionAnalysisResult | null>(
    project.products[0]?.visionNotes || null
  );

  // Editable manual fields — NEVER inferred from image alone
  const [productName, setProductName] = useState(
    project.products[0]?.name || (isAr ? 'منتج ممسوح جديد' : 'Scanned Product')
  );
  const [manualUnitCost, setManualUnitCost] = useState<string>(
    String(project.products[0]?.unitPurchaseCost ?? '')
  );
  const [manualSellingPrice, setManualSellingPrice] = useState<string>(
    String(project.products[0]?.sellingPrice ?? '')
  );
  const [manualPackaging, setManualPackaging] = useState<string>(
    String(project.products[0]?.packagingCostPerUnit ?? '0.300')
  );
  const [manualMoq, setManualMoq] = useState<string>(
    String(project.products[0]?.supplierMinOrderQty ?? '20')
  );
  const [toastMsg, setToastMsg] = useState('');

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          isAr
            ? 'المتصفح لا يدعم تشغيل الكاميرا مباشرة. يمكنك رفع صورة من جهازك.'
            : 'Camera API unavailable in this browser. Please upload an image instead.'
        );
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 60);
    } catch {
      setCameraError(
        isAr
          ? 'تم رفض إذن الكاميرا أو تعذر الوصول إليها. يمكنك رفع صورة المنتج مباشرة.'
          : 'Camera permission denied or unavailable. You can upload a photo directly.'
      );
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreviewUrl(dataUrl);
      setMimeType('image/jpeg');
      stopCamera();
      setAnalysis(null);
    }
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
        setMimeType(file.type);
        setAnalysis(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const toBase64FromUrl = async (url: string): Promise<{ data: string; mime: string }> => {
    if (url.startsWith('data:')) {
      const mimeMatch = url.match(/^data:([^;]+);base64,/);
      return { data: url, mime: mimeMatch?.[1] || mimeType };
    }
    const resp = await fetch(url);
    const blob = await resp.blob();
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () =>
        resolve({
          data: String(r.result),
          mime: blob.type || 'image/jpeg',
        });
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  };

  const runVisionAnalysis = async () => {
    if (!previewUrl) return;
    setIsAnalyzing(true);
    setAnalysisError('');
    try {
      const { data, mime } = await toBase64FromUrl(previewUrl);
      const res = await fetch('/api/ai/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: data,
          mimeType: mime,
          language,
          productHint: productName,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAnalysisError(
          json.error ||
            (isAr
              ? 'تعذر الاتصال بخدمة التحليل البصري الآن.'
              : 'Vision AI service is currently unavailable.')
        );
        return;
      }
      setAnalysis({
        ...json.analysis,
        source: 'gemini',
        analyzedAt: new Date().toISOString(),
      });
    } catch {
      setAnalysisError(
        isAr
          ? 'خدمة التحليل البصري غير متاحة حالياً. يمكنك استخدام نتيجة العرض التوضيحي أو التحرير اليدوي.'
          : 'Vision service unreachable. You can load a clearly labeled demo sample or edit manually.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadLabeledDemoResult = () => {
    setAnalysisError('');
    setAnalysis({
      suggestedCategory: isAr ? 'الهدايا والعطور (عينة عرض توضيحي)' : 'Gifts & Perfumes (Demo Sample)',
      packagingCharacteristics: [
        isAr
          ? 'عبوة عرض أنيقة مناسبة للإهداء المباشر (ملاحظة توضيحية)'
          : 'Structured presentation suitable for direct gifting (Demo notice)',
      ],
      designObservations: [
        isAr
          ? 'تناسق الألوان الدافئة يعطي انطباعاً حرفياً متقناً'
          : 'Warm neutral palette communicates artisanal craft',
      ],
      presentationImprovements: [
        isAr
          ? 'إضافة بطاقة توضيحية لاسم العطر والحجم في الصورة الرئيسية'
          : 'Add a small scent-note card in the primary showcase photo',
      ],
      positioningIdeas: [
        isAr
          ? 'التركيز على هدايا المناسبات السريعة جاهزة التسليم'
          : 'Position as a ready-to-present occasion gift',
      ],
      suggestedCustomerSegments: [
        isAr ? 'مشترو هدايا التخرج والأعياد' : 'Eid & graduation gift buyers',
      ],
      questionsForConfirmation: [
        isAr
          ? 'ما تكلفة الشراء الفعلية من المورد؟ (لا تُستنتج من الصورة)'
          : 'What is your exact wholesale unit cost? (Never inferred from image)',
        isAr
          ? 'ما سعر البيع الذي تخطط لاختباره؟'
          : 'What selling price do you plan to test?',
      ],
      source: 'demo_sample',
      analyzedAt: new Date().toISOString(),
    });
  };

  const handleAddToProject = () => {
    const cost = Number(manualUnitCost);
    const price = Number(manualSellingPrice);
    if (!Number.isFinite(cost) || cost < 0 || !Number.isFinite(price) || price <= 0) {
      setAnalysisError(
        isAr
          ? 'يرجى إدخال تكلفة الوحدة وسعر البيع يدوياً قبل إضافة المنتج للمشروع.'
          : 'Please enter unit cost and selling price manually before adding to your project.'
      );
      return;
    }

    const finalVision: VisionAnalysisResult = analysis || {
      suggestedCategory: productName,
      packagingCharacteristics: [],
      designObservations: [],
      presentationImprovements: [],
      positioningIdeas: [],
      suggestedCustomerSegments: [],
      questionsForConfirmation: [],
      source: 'manual',
      analyzedAt: new Date().toISOString(),
    };

    const newProduct: ProductItem = {
      id: `prod_scan_${Date.now().toString(36)}`,
      name: productName.trim() || (isAr ? 'منتج جديد' : 'New Product'),
      category: finalVision.suggestedCategory || project.category,
      description: finalVision.designObservations.join(' · ') || project.description,
      images: previewUrl ? [previewUrl] : [],
      unitPurchaseCost: cost,
      productionCost: 0,
      sellingPrice: price,
      packagingCostPerUnit: Math.max(0, Number(manualPackaging) || 0),
      totalShippingCost: project.products[0]?.totalShippingCost ?? 10,
      supplierMinOrderQty: Math.max(1, Math.round(Number(manualMoq) || 20)),
      plannedOrderQty: Math.max(1, Math.round(Number(manualMoq) || 20)),
      supplierName: '',
      deliveryDays: 7,
      hasAlternativeSupplier: false,
      seasonality: 'year_round',
      estimatedInventoryCapacity: 50,
      visionNotes: finalVision,
    };

    onAddScannedProduct(newProduct);
    if (project.products[0]) {
      onUpdateExistingProductVision(project.products[0].id, finalVision, previewUrl);
    }
    setToastMsg(
      isAr
        ? 'تمت إضافة المنتج ونتائج الفحص البصري إلى مشروعك بنجاح.'
        : 'Product and visual notes added to your project.'
    );
    setTimeout(() => setToastMsg(''), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#353B40]">
            {isAr ? 'عين مِحَكّ — ماسح المنتجات البصري' : 'MIHAK Vision — Product Scanner'}
          </h1>
          <p className="text-sm text-[#686E74] mt-1">
            {isAr
              ? 'صوّر منتجك أو ارفع صورته لفحص التغليف والتموضع. لا يستنتج مِحَكّ أبداً التكلفة أو السعر من الصورة وحدها.'
              : 'Capture or upload a product photo to inspect packaging and positioning. Costs and prices are never guessed from images alone.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewUrl(DEMO_IMAGES.primaryGiftSet)}
            className="px-3 py-1.5 text-xs font-semibold bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl cursor-pointer hover:bg-[#DCEEF8]/50"
          >
            {isAr ? 'صورة لمسة (أ)' : 'Lamsa Sample A'}
          </button>
          <button
            type="button"
            onClick={() => setPreviewUrl(DEMO_IMAGES.variantLinenBox)}
            className="px-3 py-1.5 text-xs font-semibold bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl cursor-pointer hover:bg-[#DCEEF8]/50"
          >
            {isAr ? 'صورة لمسة (ب)' : 'Lamsa Sample B'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Capture / Upload / Preview */}
        <div className="lg:col-span-5 bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            className={`relative rounded-2xl border-2 border-dashed overflow-hidden min-h-[260px] flex items-center justify-center bg-[#FAF8F4] ${
              isDragging ? 'border-[#2C6E8A] bg-[#DCEEF8]/40' : 'border-[#D8B98C]'
            }`}
          >
            {cameraActive ? (
              <div className="w-full h-full flex flex-col items-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-h-[280px] object-cover"
                />
                <div className="p-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-4 py-2 text-xs font-semibold bg-[#2C6E8A] text-white rounded-xl cursor-pointer"
                  >
                    {isAr ? 'التقاط الصورة' : 'Capture Photo'}
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2 text-xs font-semibold bg-white border border-[#E5DDD0] rounded-xl cursor-pointer"
                  >
                    {isAr ? 'إغلاق الكاميرا' : 'Close Camera'}
                  </button>
                </div>
              </div>
            ) : previewUrl ? (
              <img
                src={previewUrl}
                alt={productName}
                referrerPolicy="no-referrer"
                className="w-full max-h-[300px] object-cover"
              />
            ) : (
              <div className="p-6 text-center text-xs text-[#686E74] space-y-2">
                <Upload className="w-8 h-8 mx-auto text-[#83BFD9]" />
                <p>
                  {isAr
                    ? 'اسحب صورة المنتج هنا أو اختر من جهازك'
                    : 'Drag & drop product image here or browse'}
                </p>
              </div>
            )}
          </div>

          {cameraError && (
            <p className="text-xs text-[#A9443E] bg-[#DC8983]/20 border border-[#DC8983] rounded-xl p-3">
              {cameraError}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={cameraActive ? stopCamera : startCamera}
              className="px-3.5 py-2 text-xs font-semibold bg-[#FAF8F4] hover:bg-[#DCEEF8] border border-[#E5DDD0] rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-4 h-4 text-[#2C6E8A]" />
              <span>{isAr ? 'فتح الكاميرا (بإذنك)' : 'Open Camera'}</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 text-xs font-semibold bg-[#FAF8F4] hover:bg-[#DCEEF8] border border-[#E5DDD0] rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-[#2C6E8A]" />
              <span>{isAr ? 'رفع / استبدال صورة' : 'Upload / Replace'}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />

            {previewUrl && (
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl('');
                  setAnalysis(null);
                }}
                className="px-3 py-2 text-xs font-semibold text-[#A9443E] hover:bg-[#DC8983]/20 rounded-xl flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'إزالة' : 'Remove'}</span>
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-[#E5DDD0] space-y-3">
            <button
              type="button"
              disabled={!previewUrl || isAnalyzing}
              onClick={runVisionAnalysis}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#2C6E8A] hover:bg-[#245B73] disabled:opacity-50 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isAr ? 'جارٍ الفحص البصري...' : 'Analyzing Product...'}</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span>{isAr ? 'تحليل خصائص المنتج بالذكاء الاصطناعي' : 'Analyze Visual Product Traits'}</span>
                </>
              )}
            </button>

            {analysisError && (
              <div className="p-3 rounded-xl bg-[#EBCB91]/25 border border-[#EBCB91] text-xs space-y-2">
                <p className="text-[#353B40] font-medium">{analysisError}</p>
                <button
                  type="button"
                  onClick={loadLabeledDemoResult}
                  className="px-3 py-1.5 bg-white border border-[#D8B98C] rounded-lg font-semibold text-[#353B40] cursor-pointer"
                >
                  {isAr ? 'عرض مثال تحليل توضيحي (مُعلَّم بوضوح)' : 'Load Labeled Demo Analysis'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Editable Detected Observations + Required Manual Financial Inputs */}
        <div className="lg:col-span-7 bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold text-[#353B40]">
              {isAr ? 'نتائج الفحص والتأكيد اليدوي' : 'Visual Findings & Manual Confirmation'}
            </h2>
            {analysis && (
              <span className="text-xs font-semibold text-[#2C6E8A]">
                {analysis.source === 'gemini'
                  ? isAr
                    ? 'تحليل ذكاء اصطناعي فعلي'
                    : 'Live AI Vision'
                  : analysis.source === 'demo_sample'
                    ? isAr
                      ? 'عينة عرض توضيحي'
                      : 'Demo Sample Output'
                    : isAr
                      ? 'إدخال يدوي'
                      : 'Manual Entry'}
              </span>
            )}
          </div>

          {analysis ? (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#353B40] mb-1">
                  {isAr ? 'الفئة المقترحة (قابلة للتعديل)' : 'Suggested Category (Editable)'}
                </label>
                <input
                  type="text"
                  value={analysis.suggestedCategory}
                  onChange={(e) =>
                    setAnalysis({ ...analysis, suggestedCategory: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3.5 space-y-1.5">
                  <p className="font-bold text-[#353B40]">
                    {isAr ? 'خصائص التغليف المرئية' : 'Visible Packaging'}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#686E74]">
                    {analysis.packagingCharacteristics.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3.5 space-y-1.5">
                  <p className="font-bold text-[#353B40]">
                    {isAr ? 'ملاحظات التصميم' : 'Design Observations'}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#686E74]">
                    {analysis.designObservations.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3.5 space-y-1.5">
                  <p className="font-bold text-[#353B40]">
                    {isAr ? 'تحسينات العرض والتصوير' : 'Presentation Improvements'}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#686E74]">
                    {analysis.presentationImprovements.map((x, i) => (
                      <li key={i}>{x}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl p-3.5 space-y-1.5">
                  <p className="font-bold text-[#353B40]">
                    {isAr ? 'الشرائح المقترحة وأفكار التموضع' : 'Segments & Positioning'}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[#686E74]">
                    {[...analysis.positioningIdeas, ...analysis.suggestedCustomerSegments].map(
                      (x, i) => (
                        <li key={i}>{x}</li>
                      )
                    )}
                  </ul>
                </div>
              </div>

              <div className="bg-[#DCEEF8]/45 border border-[#83BFD9]/50 rounded-xl p-3.5 space-y-1">
                <p className="font-bold text-[#2C6E8A]">
                  {isAr ? 'أسئلة تتطلب تأكيداً يدوياً منك' : 'Questions Requiring Manual Confirmation'}
                </p>
                <ul className="list-disc list-inside space-y-1 text-[#353B40]">
                  {analysis.questionsForConfirmation.map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-[#FAF8F4] border border-[#E5DDD0] text-xs text-[#686E74]">
              {isAr
                ? 'اضغط على "تحليل خصائص المنتج" لفحص الصورة، أو أدخل البيانات المالية المطلوبة أدناه مباشرة.'
                : 'Click "Analyze Visual Product Traits" to inspect the photo, or enter the required financial fields below.'}
            </div>
          )}

          {/* Mandatory Manual Financial Inputs */}
          <div className="pt-3 border-t border-[#E5DDD0] space-y-3">
            <p className="text-xs font-bold text-[#353B40]">
              {isAr
                ? 'بيانات مالية مطلوبة يدوياً (لا تُستنتج من الصورة أبداً)'
                : 'Required Manual Financial Inputs (Never inferred from image)'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1">
                  {isAr ? 'اسم المنتج' : 'Product Name'}
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {isAr ? 'تكلفة الشراء للوحدة (ر.ع) *' : 'Unit Purchase Cost (OMR) *'}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.100"
                  value={manualUnitCost}
                  onChange={(e) => setManualUnitCost(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {isAr ? 'سعر البيع المقترح (ر.ع) *' : 'Selling Price (OMR) *'}
                </label>
                <input
                  type="number"
                  min={0.1}
                  step="0.100"
                  value={manualSellingPrice}
                  onChange={(e) => setManualSellingPrice(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {isAr ? 'تكلفة التغليف للوحدة (ر.ع)' : 'Packaging Cost / Unit (OMR)'}
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.050"
                  value={manualPackaging}
                  onChange={(e) => setManualPackaging(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm font-mono-num"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">
                  {isAr ? 'الحد الأدنى للمورد (MOQ)' : 'Supplier MOQ'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={manualMoq}
                  onChange={(e) => setManualMoq(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-sm font-mono-num"
                />
              </div>
            </div>

            {toastMsg && (
              <div className="p-3 rounded-xl bg-[#B5D8C5]/35 border border-[#B5D8C5] text-xs font-semibold text-[#2E6B4E] flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{toastMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddToProject}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-[#2C6E8A] hover:bg-[#245B73] rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'أضف المنتج إلى مشروعي' : 'Add Product to My Project'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
