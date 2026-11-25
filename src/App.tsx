/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import type {
  AppView,
  CurrencyPrecision,
  Language,
  Project,
  UserSession,
} from './types/mihak';
import { createLamsaDemoProject, DEMO_PROJECT_ID } from './data/demoProject';
import { calculateFinancialMetrics } from './engine/financialEngine';
import { createDecisionFingerprintSnapshot } from './engine/riskEngine';
import { LandingPage } from './components/LandingPage';
import { AuthAndOnboarding } from './components/AuthAndOnboarding';
import { DashboardLayout } from './components/DashboardLayout';
import { DashboardHome } from './components/DashboardHome';
import { ProjectManager, ProjectWizard } from './components/ProjectManagerAndWizard';
import { VisionScanner } from './components/VisionScanner';
import { DigitalTwin } from './components/DigitalTwin';
import { ReverseDecisionLab } from './components/ReverseDecisionLab';
import { CapitalShield } from './components/CapitalShield';
import { MicroMarketLab } from './components/MicroMarketLab';
import { DecisionReengineering } from './components/DecisionReengineering';
import { CommercialTimeMachine } from './components/CommercialTimeMachine';
import { CompetitorsView, SmartMarketingView } from './components/CompetitorsAndMarketing';
import { ReportsAndDecisionCenter } from './components/ReportsAndDecisionCenter';
import { AdvisorPanel } from './components/AdvisorWidgetAndView';
import { SettingsView } from './components/SettingsView';
import { PublicSurveyPage } from './components/PublicSurveyPage';

const STORAGE_KEYS = {
  projects: 'mihak_projects_v1',
  activeId: 'mihak_active_project_v1',
  session: 'mihak_session_v1',
  language: 'mihak_language_v1',
  precision: 'mihak_precision_v1',
};

function loadInitialProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.projects);
    if (raw) {
      const parsed = JSON.parse(raw) as Project[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // Fallback to demo project
  }
  return [createLamsaDemoProject('ar')];
}

function loadInitialSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.session);
    if (raw) return JSON.parse(raw) as UserSession;
  } catch {
    // Ignore
  }
  return null;
}

export default function App() {
  const [surveyParamId, setSurveyParamId] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('survey');
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.language);
    return saved === 'en' ? 'en' : 'ar';
  });

  const [precision, setPrecision] = useState<CurrencyPrecision>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.precision);
    return saved === '2' ? 2 : 3;
  });

  const [projects, setProjects] = useState<Project[]>(loadInitialProjects);
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.activeId) || DEMO_PROJECT_ID;
  });

  const [session, setSession] = useState<UserSession | null>(loadInitialSession);
  const [view, setView] = useState<AppView>('landing');
  const [wizardEditingProject, setWizardEditingProject] = useState<Project | undefined>(
    undefined
  );

  // Sync HTML dir & lang attributes
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(STORAGE_KEYS.language, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.precision, String(precision));
  }, [precision]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
    } catch {
      // Ignore quota errors
    }
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.activeId, activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.session);
    }
  }, [session]);

  const activeProject =
    projects.find((p) => p.id === activeProjectId) ?? projects[0];

  const updateActiveProject = (updater: (prev: Project) => Project) => {
    setProjects((prevList) =>
      prevList.map((p) =>
        p.id === activeProject.id
          ? { ...updater(p), updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const toggleLanguage = () => {
    setLanguage((l) => (l === 'ar' ? 'en' : 'ar'));
  };

  const launchDemoMode = () => {
    const demoExists = projects.some((p) => p.id === DEMO_PROJECT_ID);
    if (!demoExists) {
      setProjects((prev) => [createLamsaDemoProject(language), ...prev]);
    }
    setActiveProjectId(DEMO_PROJECT_ID);
    if (!session) {
      setSession({
        name: language === 'ar' ? 'رائد أعمال (ضيف)' : 'Guest Entrepreneur',
        email: 'guest@mihak.om',
        isGuest: true,
        onboarded: true,
      });
    }
    setView('dashboard');
  };

  const handleResetDemo = () => {
    const freshDemo = createLamsaDemoProject(language);
    setProjects((prev) => {
      const others = prev.filter((p) => p.id !== DEMO_PROJECT_ID);
      return [freshDemo, ...others];
    });
    setActiveProjectId(DEMO_PROJECT_ID);
  };

  const handleClearAllLocalData = () => {
    localStorage.removeItem(STORAGE_KEYS.projects);
    localStorage.removeItem(STORAGE_KEYS.activeId);
    const fresh = createLamsaDemoProject(language);
    setProjects([fresh]);
    setActiveProjectId(fresh.id);
    setView('dashboard');
  };

  // 1. Public shareable survey route (?survey=id)
  if (surveyParamId) {
    return (
      <PublicSurveyPage
        surveyId={surveyParamId}
        language={language}
        onExitToApp={() => {
          window.history.replaceState({}, '', window.location.pathname);
          setSurveyParamId(null);
          setView('landing');
        }}
      />
    );
  }

  // 2. Landing Page
  if (view === 'landing') {
    return (
      <LandingPage
        language={language}
        onToggleLanguage={toggleLanguage}
        onStartJourney={() => {
          if (session?.onboarded) {
            setView('dashboard');
          } else {
            setView('auth');
          }
        }}
        onLaunchDemo={launchDemoMode}
      />
    );
  }

  // 3. Auth & Onboarding
  if (view === 'auth' || view === 'onboarding') {
    return (
      <AuthAndOnboarding
        mode={view}
        language={language}
        initialSession={session}
        onBackToLanding={() => setView('landing')}
        onCompleteAuth={(newSession, skipOnboarding) => {
          setSession(newSession);
          if (skipOnboarding || newSession.onboarded) {
            setView('dashboard');
          } else {
            setView('onboarding');
          }
        }}
        onCompleteOnboarding={(answers) => {
          setSession((prev) =>
            prev
              ? { ...prev, onboarded: true, onboardingAnswers: answers }
              : {
                  name: language === 'ar' ? 'رائد أعمال' : 'Founder',
                  email: 'founder@mihak.om',
                  isGuest: false,
                  onboarded: true,
                  onboardingAnswers: answers,
                }
          );
          setView('dashboard');
        }}
      />
    );
  }

  const currentSession: UserSession = session ?? {
    name: language === 'ar' ? 'رائد أعمال (ضيف)' : 'Guest Entrepreneur',
    email: 'guest@mihak.om',
    isGuest: true,
    onboarded: true,
  };

  return (
    <DashboardLayout
      activeView={view}
      project={activeProject}
      projects={projects}
      session={currentSession}
      language={language}
      onNavigate={(v) => {
        if (v === 'wizard') setWizardEditingProject(undefined);
        setView(v);
      }}
      onSelectProject={(id) => setActiveProjectId(id)}
      onToggleLanguage={toggleLanguage}
      onBackToLanding={() => setView('landing')}
    >
      {view === 'dashboard' && (
        <DashboardHome
          project={activeProject}
          session={currentSession}
          language={language}
          precision={precision}
          onNavigate={(v) => setView(v)}
          onNewProject={() => {
            setWizardEditingProject(undefined);
            setView('wizard');
          }}
        />
      )}

      {view === 'projects' && (
        <ProjectManager
          projects={projects}
          activeProjectId={activeProject.id}
          language={language}
          precision={precision}
          onSelectProject={(id) => setActiveProjectId(id)}
          onCreateNewWizard={() => {
            setWizardEditingProject(undefined);
            setView('wizard');
          }}
          onEditActiveWizard={() => {
            setWizardEditingProject(activeProject);
            setView('wizard');
          }}
          onDuplicateProject={(id) => {
            const orig = projects.find((p) => p.id === id);
            if (!orig) return;
            const copyProj: Project = {
              ...orig,
              id: `proj_${Date.now().toString(36)}`,
              isDemo: false,
              name: `${orig.name} (${language === 'ar' ? 'نسخة' : 'Copy'})`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            setProjects((prev) => [copyProj, ...prev]);
            setActiveProjectId(copyProj.id);
          }}
          onDeleteProject={(id) => {
            setProjects((prev) => {
              const filtered = prev.filter((p) => p.id !== id);
              if (activeProjectId === id && filtered[0]) {
                setActiveProjectId(filtered[0].id);
              }
              return filtered;
            });
          }}
          onResetDemo={handleResetDemo}
        />
      )}

      {view === 'wizard' && (
        <ProjectWizard
          initialProject={wizardEditingProject}
          language={language}
          onCancel={() => setView('projects')}
          onSaveProject={(saved) => {
            setProjects((prev) => {
              const exists = prev.some((p) => p.id === saved.id);
              if (exists) {
                return prev.map((p) => (p.id === saved.id ? saved : p));
              }
              return [saved, ...prev];
            });
            setActiveProjectId(saved.id);
            setView('twin');
          }}
        />
      )}

      {view === 'vision' && (
        <VisionScanner
          project={activeProject}
          language={language}
          onAddScannedProduct={(prod) => {
            updateActiveProject((prev) => ({
              ...prev,
              products: [...prev.products, prod],
              activeProductId: prod.id,
              twinControls: {
                ...prev.twinControls,
                unitCost: prod.unitPurchaseCost + prod.productionCost,
                sellingPrice: prod.sellingPrice,
                packagingCostPerUnit: prod.packagingCostPerUnit,
                orderQuantity: prod.plannedOrderQty,
                expectedUnitsSold: Math.min(
                  prod.plannedOrderQty,
                  Math.round(prod.plannedOrderQty * 0.7)
                ),
              },
            }));
          }}
          onUpdateExistingProductVision={(prodId, vision, img) => {
            updateActiveProject((prev) => ({
              ...prev,
              products: prev.products.map((p) =>
                p.id === prodId
                  ? {
                      ...p,
                      visionNotes: vision,
                      images: img && !p.images.includes(img) ? [img, ...p.images] : p.images,
                    }
                  : p
              ),
            }));
          }}
        />
      )}

      {view === 'twin' && (
        <DigitalTwin
          project={activeProject}
          language={language}
          precision={precision}
          onUpdateTwin={(controls) =>
            updateActiveProject((prev) => ({ ...prev, twinControls: controls }))
          }
          onSaveScenario={(scenario) =>
            updateActiveProject((prev) => ({
              ...prev,
              savedScenarios: [...prev.savedScenarios, scenario],
            }))
          }
        />
      )}

      {view === 'reverse-lab' && (
        <ReverseDecisionLab
          project={activeProject}
          language={language}
          precision={precision}
          onUpdateAssumptions={(assumptions) =>
            updateActiveProject((prev) => ({ ...prev, assumptions }))
          }
        />
      )}

      {view === 'capital-shield' && (
        <CapitalShield
          project={activeProject}
          language={language}
          precision={precision}
          onUpdateFinancial={(patch) =>
            updateActiveProject((prev) => ({
              ...prev,
              financial: { ...prev.financial, ...patch },
            }))
          }
          onNavigateReengineer={() => setView('reengineer')}
        />
      )}

      {view === 'market-lab' && (
        <MicroMarketLab
          project={activeProject}
          language={language}
          precision={precision}
          onAddExperiment={(exp) =>
            updateActiveProject((prev) => ({
              ...prev,
              experiments: [exp, ...prev.experiments],
            }))
          }
          onUpdateExperiment={(exp) =>
            updateActiveProject((prev) => ({
              ...prev,
              experiments: prev.experiments.map((e) => (e.id === exp.id ? exp : e)),
            }))
          }
        />
      )}

      {view === 'reengineer' && (
        <DecisionReengineering
          project={activeProject}
          language={language}
          precision={precision}
          onApplyToTwin={(controls, planName) => {
            updateActiveProject((prev) => {
              const updated = {
                ...prev,
                twinControls: controls,
                savedScenarios: [
                  ...prev.savedScenarios,
                  {
                    id: `scen_reeng_${Date.now().toString(36)}`,
                    name: planName,
                    controls,
                    notes:
                      language === 'ar'
                        ? 'مُطبّق من محرك إعادة هندسة القرار'
                        : 'Applied from Decision Re-engineering',
                    createdAt: new Date().toISOString(),
                  },
                ],
              };
              const metrics = calculateFinancialMetrics(controls, updated.financial);
              const prevFp = updated.fingerprints[updated.fingerprints.length - 1];
              return {
                ...updated,
                fingerprints: [
                  ...updated.fingerprints,
                  createDecisionFingerprintSnapshot(updated, metrics, prevFp, language),
                ],
              };
            });
          }}
        />
      )}

      {view === 'time-machine' && (
        <CommercialTimeMachine
          project={activeProject}
          language={language}
          precision={precision}
        />
      )}

      {view === 'competitors' && (
        <CompetitorsView
          project={activeProject}
          language={language}
          precision={precision}
          onAddCompetitor={(c) =>
            updateActiveProject((prev) => ({
              ...prev,
              competitors: [c, ...prev.competitors],
            }))
          }
          onDeleteCompetitor={(id) =>
            updateActiveProject((prev) => ({
              ...prev,
              competitors: prev.competitors.filter((c) => c.id !== id),
            }))
          }
        />
      )}

      {view === 'marketing' && (
        <SmartMarketingView
          project={activeProject}
          language={language}
          onSaveAsset={(asset) =>
            updateActiveProject((prev) => ({
              ...prev,
              marketingAssets: [asset, ...prev.marketingAssets],
            }))
          }
        />
      )}

      {view === 'reports' && (
        <ReportsAndDecisionCenter
          project={activeProject}
          language={language}
          precision={precision}
          onSaveFingerprint={(fp) =>
            updateActiveProject((prev) => ({
              ...prev,
              fingerprints: [...prev.fingerprints, fp],
            }))
          }
        />
      )}

      {view === 'advisor' && (
        <AdvisorPanel project={activeProject} language={language} />
      )}

      {view === 'settings' && (
        <SettingsView
          language={language}
          precision={precision}
          session={currentSession}
          onToggleLanguage={toggleLanguage}
          onChangePrecision={setPrecision}
          onResetDemo={handleResetDemo}
          onClearAllLocalData={handleClearAllLocalData}
          onLogout={() => {
            setSession(null);
            setView('auth');
          }}
        />
      )}
    </DashboardLayout>
  );
}
