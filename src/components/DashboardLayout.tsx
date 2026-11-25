import React, { useState } from 'react';
import {
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  FlaskConical,
  FolderKanban,
  Globe,
  Home,
  Layers,
  Megaphone,
  Menu,
  MessageSquare,
  Settings,
  Shield,
  Sliders,
  Users,
  X,
} from 'lucide-react';
import type { AppView, Language, Project, UserSession } from '../types/mihak';
import { t } from '../i18n/translations';
import { MihakLogo } from './MihakLogo';
import { FloatingAdvisor } from './AdvisorWidgetAndView';

interface DashboardLayoutProps {
  activeView: AppView;
  project: Project;
  projects: Project[];
  session: UserSession;
  language: Language;
  onNavigate: (view: AppView) => void;
  onSelectProject: (id: string) => void;
  onToggleLanguage: () => void;
  onBackToLanding: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeView,
  project,
  projects,
  session,
  language,
  onNavigate,
  onSelectProject,
  onToggleLanguage,
  onBackToLanding,
  children,
}) => {
  const isAr = language === 'ar';
  const copy = t(language);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems: Array<{ id: AppView; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: copy.sidebar.dashboard, icon: <Home className="w-4 h-4 shrink-0" /> },
    { id: 'projects', label: copy.sidebar.projects, icon: <FolderKanban className="w-4 h-4 shrink-0" /> },
    { id: 'vision', label: copy.sidebar.vision, icon: <Eye className="w-4 h-4 shrink-0" /> },
    { id: 'twin', label: copy.sidebar.twin, icon: <Sliders className="w-4 h-4 shrink-0" /> },
    { id: 'reverse-lab', label: copy.sidebar.reverseLab, icon: <FlaskConical className="w-4 h-4 shrink-0" /> },
    { id: 'capital-shield', label: copy.sidebar.capitalShield, icon: <Shield className="w-4 h-4 shrink-0" /> },
    { id: 'market-lab', label: copy.sidebar.marketLab, icon: <Users className="w-4 h-4 shrink-0" /> },
    { id: 'reengineer', label: copy.sidebar.reengineer, icon: <Layers className="w-4 h-4 shrink-0" /> },
    { id: 'time-machine', label: copy.sidebar.timeMachine, icon: <Clock className="w-4 h-4 shrink-0" /> },
    { id: 'competitors', label: copy.sidebar.competitors, icon: <BarChart3 className="w-4 h-4 shrink-0" /> },
    { id: 'marketing', label: copy.sidebar.marketing, icon: <Megaphone className="w-4 h-4 shrink-0" /> },
    { id: 'reports', label: copy.sidebar.reports, icon: <FileText className="w-4 h-4 shrink-0" /> },
    { id: 'advisor', label: copy.sidebar.advisor, icon: <MessageSquare className="w-4 h-4 shrink-0" /> },
    { id: 'settings', label: copy.sidebar.settings, icon: <Settings className="w-4 h-4 shrink-0" /> },
  ];

  const activeNavLabel =
    navItems.find((n) => n.id === activeView)?.label ||
    (activeView === 'wizard' ? (isAr ? 'معالج المشروع' : 'Project Wizard') : copy.sidebar.dashboard);

  const realResponsesCount = project.experiments.reduce(
    (acc, e) => acc + e.responses.filter((r) => !r.isDemo).length,
    0
  );

  const CollapseIcon = isAr
    ? collapsed
      ? ChevronLeft
      : ChevronRight
    : collapsed
      ? ChevronRight
      : ChevronLeft;

  return (
    <div className="min-h-screen bg-[#F5EFE6] text-[#353B40] flex">
      {/* Desktop Collapsible Sidebar (Right-side in RTL, Left-side in LTR) */}
      <aside
        className={`no-print hidden lg:flex flex-col bg-[#FAF8F4] border-e border-[#E5DDD0] shrink-0 transition-all duration-200 ${
          collapsed ? 'w-[74px]' : 'w-[255px]'
        }`}
      >
        <div className="p-4 border-b border-[#E5DDD0] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onBackToLanding}
            className="flex items-center gap-2.5 overflow-hidden cursor-pointer"
          >
            <MihakLogo size={30} className="shrink-0" />
            {!collapsed && (
              <span className="font-display font-bold text-base whitespace-nowrap text-[#353B40]">
                {copy.brandName} · {copy.brandLatin}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="p-1.5 text-[#686E74] hover:text-[#353B40] hover:bg-white rounded-lg cursor-pointer shrink-0"
            aria-label={isAr ? 'طي القائمة' : 'Collapse sidebar'}
          >
            <CollapseIcon className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#DCEEF8] text-[#2C6E8A]'
                    : 'text-[#686E74] hover:bg-white hover:text-[#353B40]'
                }`}
              >
                {item.icon}
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-[#E5DDD0] text-[11px] text-[#686E74]">
            <p className="font-semibold text-[#353B40] truncate">{session.name}</p>
            <p className="truncate">{session.isGuest ? (isAr ? 'وضع الضيف' : 'Guest Mode') : session.email}</p>
          </div>
        )}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#353B40]/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-72 bg-[#FAF8F4] h-full border-e border-[#E5DDD0] flex flex-col">
            <div className="p-4 border-b border-[#E5DDD0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MihakLogo size={28} />
                <span className="font-display font-bold text-base">
                  {copy.brandName} · {copy.brandLatin}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 text-[#686E74] cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer ${
                    activeView === item.id
                      ? 'bg-[#DCEEF8] text-[#2C6E8A]'
                      : 'text-[#686E74] hover:bg-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Workspace Header */}
        <header className="no-print sticky top-0 z-20 bg-[#FAF8F4]/90 backdrop-blur-md border-b border-[#E5DDD0] px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 bg-white border border-[#E5DDD0] rounded-xl cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-[#686E74]">
                <span className="truncate">{project.name}</span>
                <span aria-hidden="true">/</span>
                <span className="font-semibold text-[#353B40] truncate">{activeNavLabel}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {projects.length > 1 && (
              <select
                value={project.id}
                onChange={(e) => onSelectProject(e.target.value)}
                aria-label={isAr ? 'تبديل المشروع' : 'Switch project'}
                className="hidden sm:block px-3 py-1.5 bg-white border border-[#E5DDD0] rounded-xl text-xs font-semibold max-w-[180px]"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              onClick={onToggleLanguage}
              className="px-3 py-1.5 bg-white border border-[#E5DDD0] hover:bg-[#DCEEF8]/50 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#2C6E8A]" />
              <span>{isAr ? 'EN' : 'عربي'}</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((v) => !v)}
                className="p-2 bg-white border border-[#E5DDD0] hover:bg-[#DCEEF8]/50 rounded-xl cursor-pointer"
                aria-label={isAr ? 'التنبيهات' : 'Notifications'}
              >
                <Bell className="w-4 h-4 text-[#353B40]" />
              </button>
              {notificationsOpen && (
                <div
                  className="absolute top-11 w-72 bg-white border border-[#E5DDD0] rounded-2xl shadow-lg p-4 space-y-2 text-xs z-30"
                  style={{ insetInlineEnd: 0 }}
                >
                  <p className="font-bold text-[#353B40]">
                    {isAr ? 'تنبيهات القرار النشطة' : 'Active Decision Alerts'}
                  </p>
                  <p className="text-[#686E74]">
                    {realResponsesCount === 0
                      ? isAr
                        ? '• لم تُجمع استجابات عملاء حقيقية بعد في مختبر العملاء.'
                        : '• No live customer responses collected yet.'
                      : isAr
                        ? `• تم تسجيل ${realResponsesCount} استجابة عملاء حقيقية.`
                        : `• ${realResponsesCount} real customer responses recorded.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(false);
                      onNavigate('reports');
                    }}
                    className="text-[#2C6E8A] font-semibold hover:underline cursor-pointer"
                  >
                    {isAr ? 'مراجعة مركز القرار' : 'Review Decision Center'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1360px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Persistent Floating AI Assistant */}
      {activeView !== 'advisor' && (
        <FloatingAdvisor project={project} language={language} />
      )}
    </div>
  );
};
