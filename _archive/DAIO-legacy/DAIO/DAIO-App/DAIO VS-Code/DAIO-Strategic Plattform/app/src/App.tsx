// DAIO Strategic Platform
// 10 Web-Apps: 5 für Bedarfserkennung + 5 für Mechanismenerklärung

import { useState } from "react";
import { useTranslation } from "@/i18n";
// Button import removed - not used
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  TrendingDown,
  Scan,
  UserX,
  TestTube,
  DollarSign,
  GitBranch,
  Shield,
  Map,
  RotateCcw,
  BarChart3,
  ChevronRight,
} from "lucide-react";

// Part 1: Need Apps
import { LossSimulator } from "@/apps/need/LossSimulator";
import { InvisibleWealthScanner } from "@/apps/need/InvisibleWealthScanner";
import { KeyPersonRisk } from "@/apps/need/KeyPersonRisk";
import { StressTestTool } from "@/apps/need/StressTestTool";
import { LostCounter } from "@/apps/need/LostCounter";

// Part 2: Mechanism Apps
import { GovernanceFlow } from "@/apps/mechanism/GovernanceFlow";
import { NoCustodyArch } from "@/apps/mechanism/NoCustodyArch";
import { AccessContinuityMap } from "@/apps/mechanism/AccessContinuityMap";
import { AssetLifecycle } from "@/apps/mechanism/AssetLifecycle";
import { ContinuityIndex } from "@/apps/mechanism/ContinuityIndex";

type AppId =
  | "loss-simulator"
  | "wealth-scanner"
  | "key-person"
  | "stress-test"
  | "lost-counter"
  | "governance-flow"
  | "no-custody"
  | "continuity-map"
  | "lifecycle"
  | "continuity-index";

interface AppConfig {
  id: AppId;
  name: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType;
  section: "need" | "mechanism";
}

// App registry — names/descriptions resolved at render time via t()
const APP_REGISTRY = [
  { id: "loss-simulator" as AppId, nameKey: "apps.lossSimulator.name", descKey: "apps.lossSimulator.description", icon: <TrendingDown className="w-5 h-5" />, component: LossSimulator, section: "need" as const },
  { id: "wealth-scanner" as AppId, nameKey: "apps.wealthScanner.name", descKey: "apps.wealthScanner.description", icon: <Scan className="w-5 h-5" />, component: InvisibleWealthScanner, section: "need" as const },
  { id: "key-person" as AppId, nameKey: "apps.keyPerson.name", descKey: "apps.keyPerson.description", icon: <UserX className="w-5 h-5" />, component: KeyPersonRisk, section: "need" as const },
  { id: "stress-test" as AppId, nameKey: "apps.stressTest.name", descKey: "apps.stressTest.description", icon: <TestTube className="w-5 h-5" />, component: StressTestTool, section: "need" as const },
  { id: "lost-counter" as AppId, nameKey: "apps.lostCounter.name", descKey: "apps.lostCounter.description", icon: <DollarSign className="w-5 h-5" />, component: LostCounter, section: "need" as const },
  { id: "governance-flow" as AppId, nameKey: "apps.governanceFlow.name", descKey: "apps.governanceFlow.description", icon: <GitBranch className="w-5 h-5" />, component: GovernanceFlow, section: "mechanism" as const },
  { id: "no-custody" as AppId, nameKey: "apps.noCustody.name", descKey: "apps.noCustody.description", icon: <Shield className="w-5 h-5" />, component: NoCustodyArch, section: "mechanism" as const },
  { id: "continuity-map" as AppId, nameKey: "apps.continuityMap.name", descKey: "apps.continuityMap.description", icon: <Map className="w-5 h-5" />, component: AccessContinuityMap, section: "mechanism" as const },
  { id: "lifecycle" as AppId, nameKey: "apps.lifecycle.name", descKey: "apps.lifecycle.description", icon: <RotateCcw className="w-5 h-5" />, component: AssetLifecycle, section: "mechanism" as const },
  { id: "continuity-index" as AppId, nameKey: "apps.continuityIndex.name", descKey: "apps.continuityIndex.description", icon: <BarChart3 className="w-5 h-5" />, component: ContinuityIndex, section: "mechanism" as const },
];

function App() {
  const { t, lang, setLang } = useTranslation();
  const [currentApp, setCurrentApp] = useState<AppId>("loss-simulator");
  const [activeSection, setActiveSection] = useState<"need" | "mechanism">("need");

  const APPS: AppConfig[] = APP_REGISTRY.map((entry) => ({
    id: entry.id,
    name: t(entry.nameKey),
    description: t(entry.descKey),
    icon: entry.icon,
    component: entry.component,
    section: entry.section,
  }));

  const currentAppConfig = APPS.find((a) => a.id === currentApp)!;
  const CurrentComponent = currentAppConfig.component;

  const needApps = APPS.filter((a) => a.section === "need");
  const mechanismApps = APPS.filter((a) => a.section === "mechanism");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Back2IQ" className="h-9 w-auto" />
                <div>
                  <h1 className="font-bold text-slate-900 dark:text-white text-lg">
                    Back2IQ
                  </h1>
                  <p className="text-xs text-slate-500 -mt-1">
                    {t('header.aheadByDesign')}
                  </p>
                </div>
              </div>
              <div>
                <h1 className="font-bold text-slate-900 dark:text-white">
                  {t('header.title')}
                </h1>
                <p className="text-xs text-slate-500">
                  {t('header.subtitle')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Language toggle */}
              <div className="flex items-center gap-1 text-sm font-medium">
                <button
                  type="button"
                  onClick={() => setLang('de')}
                  className={`px-2 py-0.5 rounded ${lang === 'de' ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  DE
                </button>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-2 py-0.5 rounded ${lang === 'en' ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  EN
                </button>
              </div>
              <Badge variant="outline" className="hidden sm:flex">
                {currentAppConfig.name}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs
          value={activeSection}
          onValueChange={(v) => {
            setActiveSection(v as "need" | "mechanism");
            setCurrentApp(v === "need" ? "loss-simulator" : "governance-flow");
          }}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="need" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {t('tabs.need')}
            </TabsTrigger>
            <TabsTrigger value="mechanism" className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              {t('tabs.mechanism')}
            </TabsTrigger>
          </TabsList>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    {activeSection === "need"
                      ? t('sidebar.needHeading')
                      : t('sidebar.mechanismHeading')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(activeSection === "need" ? needApps : mechanismApps).map((app) => (
                    <button
                      type="button"
                      key={app.id}
                      onClick={() => setCurrentApp(app.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                        currentApp === app.id
                          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          currentApp === app.id
                            ? "bg-blue-500 text-white"
                            : "bg-slate-100 dark:bg-slate-700 text-slate-500"
                        }`}
                      >
                        {app.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{app.name}</div>
                      </div>
                      {currentApp === app.id && (
                        <ChevronRight className="w-4 h-4 text-blue-500" />
                      )}
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="bg-slate-100 dark:bg-slate-800/50">
                <CardContent className="pt-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {activeSection === "need"
                      ? t('sidebar.needInfo')
                      : t('sidebar.mechanismInfo')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main App Area */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardHeader className="border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600">
                      {currentAppConfig.icon}
                    </div>
                    <div>
                      <CardTitle>{currentAppConfig.name}</CardTitle>
                      <CardDescription>{currentAppConfig.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CurrentComponent />
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-700 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <div>{t('footer.tagline')}</div>
            <div>{t('footer.noCustody')}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
