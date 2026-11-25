import React, { useMemo, useState } from 'react';
import { Clock, RotateCcw } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { CurrencyPrecision, Language, Project } from '../types/mihak';
import { formatOMR } from '../engine/financialEngine';
import { buildTimeMachineSeries } from '../engine/riskEngine';

interface CommercialTimeMachineProps {
  project: Project;
  language: Language;
  precision: CurrencyPrecision;
}

export const CommercialTimeMachine: React.FC<CommercialTimeMachineProps> = ({
  project,
  language,
  precision,
}) => {
  const isAr = language === 'ar';
  const [horizon, setHorizon] = useState<1 | 3 | 6 | 12>(6);
  const [metricView, setMetricView] = useState<'cash' | 'profit'>('cash');

  // What-If Shocks
  const [supplierCostDeltaPct, setSupplierCostDeltaPct] = useState(0);
  const [demandDeltaPct, setDemandDeltaPct] = useState(0);
  const [priceDeltaPct, setPriceDeltaPct] = useState(0);
  const [marketingDeltaPct, setMarketingDeltaPct] = useState(0);
  const [shippingDeltaPct, setShippingDeltaPct] = useState(0);

  const { monthlyData, summary } = useMemo(
    () =>
      buildTimeMachineSeries(project.twinControls, project, horizon, {
        supplierCostDeltaPct,
        demandDeltaPct,
        priceDeltaPct,
        marketingDeltaPct,
        shippingDeltaPct,
      }),
    [
      project,
      horizon,
      supplierCostDeltaPct,
      demandDeltaPct,
      priceDeltaPct,
      marketingDeltaPct,
      shippingDeltaPct,
    ]
  );

  const resetShocks = () => {
    setSupplierCostDeltaPct(0);
    setDemandDeltaPct(0);
    setPriceDeltaPct(0);
    setMarketingDeltaPct(0);
    setShippingDeltaPct(0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#2C6E8A]">
            <Clock className="w-4 h-4" />
            <span>{isAr ? 'آلة الزمن التجارية' : 'Commercial Time Machine'}</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-[#353B40] mt-1">
            {isAr
              ? 'محاكاة مسارات المستقبل وتجربة صدمات "ماذا لو؟"'
              : 'Future Scenario Simulator & "What-If?" Stress Testing'}
          </h1>
          <p className="text-xs text-[#686E74] mt-1">
            {isAr
              ? 'هذه المسارات سيناريوهات افتراضية لتقدير الحساسية وليست تنبؤات مضمونة بالمستقبل.'
              : 'These projections are sensitivity simulations, not guaranteed future predictions.'}
          </p>
        </div>

        {/* Horizon Tabs */}
        <div className="flex items-center gap-1 p-1 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-xs font-semibold">
          {([1, 3, 6, 12] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setHorizon(m)}
              className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                horizon === m ? 'bg-[#2C6E8A] text-white' : 'text-[#686E74] hover:text-[#353B40]'
              }`}
            >
              {m === 1
                ? isAr
                  ? 'شهر واحد'
                  : '1M'
                : m === 3
                  ? isAr
                    ? '3 أشهر'
                    : '3M'
                  : m === 6
                    ? isAr
                      ? '6 أشهر'
                      : '6M'
                    : isAr
                      ? 'سنة'
                      : '1Y'}
            </button>
          ))}
        </div>
      </div>

      {/* 3 Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(
          [
            {
              key: 'optimistic' as const,
              title: isAr ? 'السيناريو المتفائل (+15% طلب)' : 'Optimistic (+15% Demand)',
              border: 'border-[#B5D8C5]',
              bg: 'bg-[#B5D8C5]/15',
            },
            {
              key: 'base' as const,
              title: isAr ? 'السيناريو الأساسي (وفق افتراضك)' : 'Base Scenario (Your Inputs)',
              border: 'border-[#83BFD9]',
              bg: 'bg-[#DCEEF8]/35',
            },
            {
              key: 'pessimistic' as const,
              title: isAr ? 'السيناريو المتشائم (-35% طلب)' : 'Pessimistic (-35% Demand)',
              border: 'border-[#DC8983]',
              bg: 'bg-[#DC8983]/15',
            },
          ] as const
        ).map((card) => {
          const s = summary[card.key];
          return (
            <div
              key={card.key}
              className={`bg-white border ${card.border} rounded-2xl p-5 space-y-3`}
            >
              <div className={`px-3 py-1.5 rounded-xl ${card.bg} text-xs font-bold text-[#353B40]`}>
                {card.title}
              </div>
              <div className="space-y-1.5 text-xs font-mono-num">
                <div className="flex justify-between">
                  <span className="text-[#686E74]">{isAr ? 'الإيرادات:' : 'Revenue:'}</span>
                  <strong>{formatOMR(s.revenue, language, precision)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#686E74]">{isAr ? 'المصاريف النقدية:' : 'Cash Outflow:'}</span>
                  <strong>{formatOMR(s.expenses, language, precision)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#686E74]">{isAr ? 'الرصيد النقدي النهائي:' : 'Cash Balance:'}</span>
                  <strong className="text-[#2C6E8A]">{formatOMR(s.cashBalance, language, precision)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#686E74]">{isAr ? 'المخزون المتبقي:' : 'Remaining Stock:'}</span>
                  <strong>{s.remainingInventory} {isAr ? 'وحدة' : 'units'}</strong>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-[#F0EAE0]">
                  <span className="text-[#686E74]">{isAr ? 'الربح / الخسارة:' : 'Net Profit/Loss:'}</span>
                  <strong className={s.netProfit >= 0 ? 'text-[#2E6B4E]' : 'text-[#A9443E]'}>
                    {formatOMR(s.netProfit, language, precision)}
                  </strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart + What-If Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-base font-bold text-[#353B40]">
              {isAr ? 'الخط الزمني للسيناريوهات الثلاثة' : 'Three-Scenario Timeline'}
            </h2>
            <div className="flex items-center gap-1 p-1 bg-[#FAF8F4] border border-[#E5DDD0] rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setMetricView('cash')}
                className={`px-3 py-1 rounded-md cursor-pointer ${
                  metricView === 'cash' ? 'bg-white font-semibold shadow-xs' : 'text-[#686E74]'
                }`}
              >
                {isAr ? 'الرصيد النقدي' : 'Cash Balance'}
              </button>
              <button
                type="button"
                onClick={() => setMetricView('profit')}
                className={`px-3 py-1 rounded-md cursor-pointer ${
                  metricView === 'profit' ? 'bg-white font-semibold shadow-xs' : 'text-[#686E74]'
                }`}
              >
                {isAr ? 'صافي الربح التراكمي' : 'Cumulative Profit'}
              </button>
            </div>
          </div>

          <div className="h-72 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5DDD0" />
                <XAxis
                  dataKey={isAr ? 'labelAr' : 'labelEn'}
                  tick={{ fill: '#686E74', fontSize: 11 }}
                />
                <YAxis tick={{ fill: '#686E74', fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={metricView === 'cash' ? 'optimisticCash' : 'optimisticProfit'}
                  name={isAr ? 'متفائل' : 'Optimistic'}
                  stroke="#4B8E6E"
                  strokeWidth={2.2}
                />
                <Line
                  type="monotone"
                  dataKey={metricView === 'cash' ? 'baseCash' : 'baseProfit'}
                  name={isAr ? 'أساسي' : 'Base'}
                  stroke="#2C6E8A"
                  strokeWidth={2.5}
                />
                <Line
                  type="monotone"
                  dataKey={metricView === 'cash' ? 'pessimisticCash' : 'pessimisticProfit'}
                  name={isAr ? 'متشائم' : 'Pessimistic'}
                  stroke="#C9645D"
                  strokeWidth={2.2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* What-If Simulator */}
        <div className="lg:col-span-5 bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#353B40]">
              {isAr ? 'مختبر "ماذا لو؟"' : '"What-If?" Shock Controls'}
            </h2>
            <button
              type="button"
              onClick={resetShocks}
              className="text-xs font-semibold text-[#686E74] hover:text-[#353B40] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isAr ? 'إعادة ضبط' : 'Reset'}</span>
            </button>
          </div>

          <div className="space-y-3.5 text-xs">
            {[
              {
                label: isAr ? 'تغير تكلفة المورد' : 'Supplier Cost Change',
                val: supplierCostDeltaPct,
                set: setSupplierCostDeltaPct,
                min: -20,
                max: 50,
              },
              {
                label: isAr ? 'تغير طلب العملاء' : 'Customer Demand Change',
                val: demandDeltaPct,
                set: setDemandDeltaPct,
                min: -50,
                max: 50,
              },
              {
                label: isAr ? 'تغير سعر البيع' : 'Selling Price Change',
                val: priceDeltaPct,
                set: setPriceDeltaPct,
                min: -30,
                max: 40,
              },
              {
                label: isAr ? 'تغير ميزانية التسويق' : 'Marketing Spend Change',
                val: marketingDeltaPct,
                set: setMarketingDeltaPct,
                min: -50,
                max: 100,
              },
              {
                label: isAr ? 'تغير تكلفة الشحن' : 'Shipping Cost Change',
                val: shippingDeltaPct,
                set: setShippingDeltaPct,
                min: -30,
                max: 60,
              },
            ].map((item, idx) => (
              <div key={idx}>
                <div className="flex justify-between font-semibold mb-1">
                  <span>{item.label}</span>
                  <span className="font-mono-num text-[#2C6E8A]">
                    {item.val > 0 ? `+${item.val}%` : `${item.val}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min={item.min}
                  max={item.max}
                  step={5}
                  value={item.val}
                  onChange={(e) => item.set(Number(e.target.value))}
                  className="w-full mihak-slider"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
