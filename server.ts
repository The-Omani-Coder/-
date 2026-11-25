import express from 'express';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = path.resolve(process.cwd(), '.data');
const SURVEYS_FILE = path.join(DATA_DIR, 'surveys.json');

interface StoredSurvey {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  type: string;
  question: string;
  variantA: { label: string; price: number; image?: string; description?: string };
  variantB?: { label: string; price: number; image?: string; description?: string };
  targetAudience: string;
  createdAt: string;
  responses: Array<{
    id: string;
    chosenVariant: 'A' | 'B' | 'neither';
    preferredPrice: number;
    purchaseIntent: 'high' | 'medium' | 'low';
    objection: string;
    comment: string;
    createdAt: string;
    isDemo?: boolean;
  }>;
}

const memorySurveys = new Map<string, StoredSurvey>();

function loadSurveys(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(SURVEYS_FILE)) {
      const raw = fs.readFileSync(SURVEYS_FILE, 'utf-8');
      const parsed = JSON.parse(raw) as StoredSurvey[];
      for (const s of parsed) {
        memorySurveys.set(s.id, s);
      }
    }
  } catch {
    // Keep memory map if disk unavailable
  }
}

function saveSurveys(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(
      SURVEYS_FILE,
      JSON.stringify(Array.from(memorySurveys.values()), null, 2),
      'utf-8'
    );
  } catch {
    // Non-fatal in read-only environments
  }
}

loadSurveys();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '12mb' }));

  // Health & AI availability status
  app.get('/api/health', (_req, res) => {
    const aiReady = Boolean(getGeminiClient());
    res.json({ ok: true, aiAvailable: aiReady });
  });

  // 1. Product Vision Scanner — Multimodal Image Analysis
  app.post('/api/ai/vision', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        code: 'AI_UNAVAILABLE',
        error: 'خدمة الذكاء الاصطناعي غير مهيأة حالياً بمفتاح صالح. يمكنك استخدام وضع العرض التوضيحي أو الإدخال اليدوي.',
      });
      return;
    }

    try {
      const { imageBase64, mimeType, language = 'ar', productHint = '' } = req.body as {
        imageBase64?: string;
        mimeType?: string;
        language?: string;
        productHint?: string;
      };

      if (!imageBase64 || !mimeType) {
        res.status(400).json({ error: 'Image data and mimeType are required.' });
        return;
      }

      const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

      const prompt =
        language === 'en'
          ? `Analyze this product photograph carefully for a small-business decision intelligence platform in Oman.
Provide ONLY observations grounded in what is visually present in the image.
STRICT RULE: NEVER guess, infer, or invent exact purchase costs, selling prices, market demand numbers, or financial profits from an image alone.
If pricing/cost is needed, list it as a question requiring manual user confirmation.
Optional user note: ${productHint || 'None'}.`
          : `حلل صورة المنتج هذه بدقة لمنصة مِحَكّ لدعم قرارات المشاريع الصغيرة في عُمان.
قدّم ملاحظات مبنية فقط على ما يظهر فعلياً في الصورة.
قاعدة صارمة: لا تستنتج أو تخمّن أبداً تكلفة شراء دقيقة أو سعر بيع أو حجم طلب سوقي أو أرباح مالية من الصورة وحدها.
اطلب من المستخدم إدخال البيانات المالية يدوياً في خانة الأسئلة التي تحتاج تأكيداً.
ملاحظة إضافية من المستخدم: ${productHint || 'لا توجد'}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: {
          parts: [
            { inlineData: { mimeType, data: cleanBase64 } },
            { text: prompt },
          ],
        },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestedCategory: { type: Type.STRING },
              packagingCharacteristics: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              designObservations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              presentationImprovements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              positioningIdeas: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              suggestedCustomerSegments: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              questionsForConfirmation: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({ source: 'gemini', analysis: parsed });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Vision analysis failed';
      res.status(500).json({ code: 'AI_ERROR', error: message });
    }
  });

  // 2. MIHAK AI Advisor — مرشد مِحَكّ
  app.post('/api/ai/advisor', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        code: 'AI_UNAVAILABLE',
        error: 'مفتاح الذكاء الاصطناعي غير متوفر حالياً. يتم استخدام وضع التوضيح المبني على القواعد.',
      });
      return;
    }

    try {
      const { question, projectContext, history = [], language = 'ar' } = req.body as {
        question?: string;
        projectContext?: Record<string, unknown>;
        history?: Array<{ role: string; text: string }>;
        language?: string;
      };

      if (!question || !question.trim()) {
        res.status(400).json({ error: 'Question is required.' });
        return;
      }

      const systemInstruction =
        language === 'en'
          ? `You are MIHAK Advisor (مرشد مِحَكّ), a calm, precise, honest business decision intelligence advisor for small businesses and emerging startups in Oman.
Rules:
1. Ground every answer strictly in the project's actual numbers, assumptions, supplier MOQ, and evidence provided in context.
2. Distinguish clearly between: (a) User assumptions, (b) Calculated simulation results, and (c) Missing evidence.
3. Never guarantee profit, never invent live market data or fake competitor stats, and never recommend violating a supplier's minimum order quantity without proposing negotiation or an alternative supplier.
4. Keep answers structured, concise (under 180 words), practical, and focused on reducing capital risk before spending.
5. Currency is OMR (3 decimal places when needed).`
          : `أنت "مرشد مِحَكّ"، مستشار ذكاء القرارات التجارية للمشاريع الصغيرة والمنزلية والناشئة في سلطنة عُمان.
القواعد الصارمة:
1. ابنِ إجابتك بدقة على الأرقام والافتراضات الفعلية والحد الأدنى للمورد والأدلة المتوفرة في سياق المشروع فقط.
2. فرّق بوضوح بين: (أ) افتراضات المستخدم، (ب) نتائج المحاكاة الحسابية، (ج) المعلومات الناقصة التي تحتاج اختباراً.
3. لا تضمن أبداً تحقيق أرباح، ولا تخترع بيانات سوقية أو أسعار منافسين غير مذكورة، ولا تقترح طلب كمية أقل من الحد الأدنى للمورد إلا مع اقتراح التفاوض أو مورد بديل أو نظام الحجز المسبق.
4. اجعل الإجابة منظمة، واضحة، مختصرة (أقل من 180 كلمة)، وعملية لحماية رأس المال قبل الإنفاق.
5. العملة الافتراضية هي الريال العُماني (OMR / ر.ع).`;

      const contextMessage = `Project Context JSON:\n${JSON.stringify(projectContext ?? {}, null, 2)}\n\nConversation History:\n${history
        .slice(-6)
        .map((m) => `${m.role}: ${m.text}`)
        .join('\n')}\n\nUser Question: ${question}`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: contextMessage,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      res.json({
        source: 'gemini',
        answer: (response.text ?? '').trim(),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Advisor request failed';
      res.status(500).json({ code: 'AI_ERROR', error: message });
    }
  });

  // 3. Smart Marketing Generator
  app.post('/api/ai/marketing', async (req, res) => {
    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        code: 'AI_UNAVAILABLE',
        error: 'خدمة التوليد الذكي غير متوفرة حالياً بدون مفتاح، يمكنك استخدام القوالب التفاعلية المحلية.',
      });
      return;
    }

    try {
      const { projectContext, goal, channel, language = 'ar' } = req.body as {
        projectContext?: Record<string, unknown>;
        goal?: string;
        channel?: string;
        language?: string;
      };

      const prompt =
        language === 'en'
          ? `Generate practical marketing assets for this small business project in Oman.
Project Context: ${JSON.stringify(projectContext ?? {})}
Campaign Goal: ${goal || 'Validate demand before scaling'}
Primary Channel: ${channel || 'Instagram & WhatsApp'}
Do not invent customer testimonials or fake discounts. Keep tone warm, authentic, and tailored to Omani consumers.`
          : `أنشئ مواد تسويقية عملية مخصصة لهذا المشروع الصغير في عُمان.
بيانات المشروع: ${JSON.stringify(projectContext ?? {})}
الهدف التسويقي: ${goal || 'اختبار الطلب قبل الشراء الكامل'}
القناة الأساسية: ${channel || 'إنستغرام وواتساب'}
لا تخترع آراء عملاء وهمية ولا وعوداً مضللة. حافظ على نبرة دافئة واحترافية تناسب السوق العُماني.`;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              campaignConcept: { type: Type.STRING },
              productDescription: { type: Type.STRING },
              captions: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedChannels: { type: Type.ARRAY, items: { type: Type.STRING } },
              personaSummary: { type: Type.STRING },
              abTestIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
              contentCalendar: { type: Type.ARRAY, items: { type: Type.STRING } },
              promotionalIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({ source: 'gemini', marketing: parsed });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Marketing generation failed';
      res.status(500).json({ code: 'AI_ERROR', error: message });
    }
  });

  // 4. Micro Market Testing Lab — Real Shareable Surveys
  app.post('/api/surveys', (req, res) => {
    const body = req.body as Partial<StoredSurvey>;
    if (!body.title || !body.question || !body.variantA) {
      res.status(400).json({ error: 'Missing required survey fields.' });
      return;
    }
    const id = body.id || `exp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const existing = memorySurveys.get(id);
    const survey: StoredSurvey = {
      id,
      projectId: body.projectId || 'default',
      projectName: body.projectName || 'مشروع مِحَكّ',
      title: body.title,
      type: body.type || 'product_interest',
      question: body.question,
      variantA: body.variantA,
      variantB: body.variantB,
      targetAudience: body.targetAudience || '',
      createdAt: existing?.createdAt || new Date().toISOString(),
      responses: existing?.responses || body.responses || [],
    };
    memorySurveys.set(id, survey);
    saveSurveys();
    res.json({ survey });
  });

  app.get('/api/surveys/:id', (req, res) => {
    const survey = memorySurveys.get(req.params.id);
    if (!survey) {
      res.status(404).json({ error: 'التجربة غير موجودة أو لم يتم نشرها بعد.' });
      return;
    }
    res.json({ survey });
  });

  app.post('/api/surveys/:id/responses', (req, res) => {
    const survey = memorySurveys.get(req.params.id);
    if (!survey) {
      res.status(404).json({ error: 'Survey not found.' });
      return;
    }
    const { chosenVariant, preferredPrice, purchaseIntent, objection, comment } = req.body as {
      chosenVariant?: 'A' | 'B' | 'neither';
      preferredPrice?: number;
      purchaseIntent?: 'high' | 'medium' | 'low';
      objection?: string;
      comment?: string;
    };

    const newResponse = {
      id: `resp_${Date.now().toString(36)}`,
      chosenVariant: chosenVariant || 'A',
      preferredPrice: Number.isFinite(Number(preferredPrice)) ? Number(preferredPrice) : survey.variantA.price,
      purchaseIntent: purchaseIntent || 'medium',
      objection: (objection || '').slice(0, 300),
      comment: (comment || '').slice(0, 500),
      createdAt: new Date().toISOString(),
      isDemo: false,
    };

    survey.responses.push(newResponse);
    memorySurveys.set(survey.id, survey);
    saveSurveys();
    res.json({ response: newResponse, totalResponses: survey.responses.length });
  });

  // Vite dev middleware or production static files
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MIHAK server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start MIHAK server:', err);
  process.exit(1);
});
