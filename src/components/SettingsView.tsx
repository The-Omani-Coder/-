import React, { useState } from 'react';
import { Globe, RotateCcw, Settings, Trash2 } from 'lucide-react';
import type { CurrencyPrecision, Language, UserSession } from '../types/mihak';

interface SettingsViewProps {
  language: Language;
  precision: CurrencyPrecision;
  session: UserSession;
  onToggleLanguage: () => void;
  onChangePrecision: (p: CurrencyPrecision) => void;
  onResetDemo: () => void;
  onClearAllLocalData: () => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  language,
  precision,
  session,
  onToggleLanguage,
  onChangePrecision,
  onResetDemo,
  onClearAllLocalData,
  onLogout,
}) => {
  const isAr = language === 'ar';
  const [confirmClear, setConfirmClear] = useState(false);
  const [notice, setNotice] = useState('');

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#2C6E8A]">
          <Settings className="w-4 h-4" />
          <span>{isAr ? 'الإعدادات والخصوصية' : 'Settings & Privacy'}</span>
        </div>
        <h1 className="font-display text-2xl font-bold text-[#353B40] mt-1">
          {isAr ? 'تخصيص مِحَكّ وإدارة بياناتك' : 'Customize MIHAK & Manage Local Data'}
        </h1>
      </div>

      <div className="bg-white border border-[#E5DDD0] rounded-2xl p-6 space-y-5 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F0EAE0]">
          <div>
            <p className="font-bold text-[#353B40]">{isAr ? 'اللغة والاتجاه' : 'Language & Direction'}</p>
            <p className="text-xs text-[#686E74]">
              {isAr ? 'التبديل بين العربية (RTL) والإنجليزية (LTR)' : 'Switch between Arabic (RTL) and English (LTR)'}
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleLanguage}
            className="px-4 py-2 text-xs font-semibold bg-[#DCEEF8] text-[#2C6E8A] rounded-xl flex items-center gap-2 cursor-pointer"
          >
            <Globe className="w-4 h-4" />
            <span>{isAr ? 'Switch to English' : 'التبديل للعربية'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F0EAE0]">
          <div>
            <p className="font-bold text-[#353B40]">
              {isAr ? 'دقة عرض الريال العُماني (OMR)' : 'OMR Decimal Precision'}
            </p>
            <p className="text-xs text-[#686E74]">
              {isAr ? 'الافتراضي 3 خانات عشرية (مثل 0.300 ر.ع)' : 'Default 3 decimal places (e.g. 0.300 OMR)'}
            </p>
          </div>
          <div className="flex items-center gap-2 p-1 bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl text-xs font-semibold">
            {([3, 2] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChangePrecision(p)}
                className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                  precision === p ? 'bg-white shadow-xs text-[#353B40]' : 'text-[#686E74]'
                }`}
              >
                {p} {isAr ? 'خانات' : 'decimals'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F0EAE0]">
          <div>
            <p className="font-bold text-[#353B40]">{isAr ? 'الجلسة الحالية' : 'Current Session'}</p>
            <p className="text-xs text-[#686E74]">
              {session.name} · {session.email} {session.isGuest ? (isAr ? '(وضع الضيف)' : '(Guest Mode)') : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-2 text-xs font-semibold bg-[#FAF8F4] border border-[#E5DDD0] rounded-xl cursor-pointer"
          >
            {isAr ? 'تبديل الحساب / الخروج' : 'Switch Account / Sign Out'}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F0EAE0]">
          <div>
            <p className="font-bold text-[#353B40]">
              {isAr ? 'إعادة ضبط مشروع الهاكاثون التجريبي' : 'Reset Hackathon Demo Project'}
            </p>
            <p className="text-xs text-[#686E74]">
              {isAr ? 'استعادة مشروع "لمسة — هدايا وعطور" بقيمه الأصلية' : 'Restore "Lamsa" sample project to default values'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onResetDemo();
              setNotice(isAr ? 'تمت استعادة المشروع الافتراضي.' : 'Demo project restored.');
            }}
            className="px-4 py-2 text-xs font-semibold bg-[#FAF8F4] border border-[#D8B98C] rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isAr ? 'إعادة ضبط العرض' : 'Reset Demo'}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-bold text-[#A9443E]">
              {isAr ? 'حذف جميع البيانات المحفوظة محلياً' : 'Delete All Locally Saved Data'}
            </p>
            <p className="text-xs text-[#686E74]">
              {isAr ? 'يمسح كل المشاريع المحفوظة في هذا المتصفح ويعيد التهيئة' : 'Removes all local projects from browser storage'}
            </p>
          </div>
          {confirmClear ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClearAllLocalData();
                  setConfirmClear(false);
                }}
                className="px-4 py-2 text-xs font-semibold bg-[#DC8983] text-white rounded-xl cursor-pointer"
              >
                {isAr ? 'تأكيد الحذف النهائي' : 'Confirm Delete All'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="px-3 py-2 text-xs text-[#686E74] cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="px-4 py-2 text-xs font-semibold text-[#A9443E] bg-[#DC8983]/15 border border-[#DC8983] rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isAr ? 'حذف البيانات المحلية' : 'Clear Local Storage'}</span>
            </button>
          )}
        </div>

        {notice && <p className="text-xs font-semibold text-[#2E6B4E]">{notice}</p>}
      </div>
    </div>
  );
};
