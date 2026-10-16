// DAIO Commander - Main Application
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreProvider, useStore } from '@/context/StoreContext';
import { applyBrandStyles } from '@/config/branding';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { LandingPage } from '@/pages/LandingPage';
import { AssetDiscoveryPage } from '@/pages/AssetDiscoveryPage';
import { HiddenScannerPage } from '@/pages/HiddenScannerPage';
import { LossEstimatorPage } from '@/pages/LossEstimatorPage';
import { TemplateGeneratorPage } from '@/pages/TemplateGeneratorPage';
import { DataValuePage } from '@/pages/DataValuePage';
import { PartnershipPage } from '@/pages/PartnershipPage';
import { Toaster } from '@/components/ui/sonner';
import './App.css';

function App() {
  const { currentPage, brandMode } = useStore();

  // Apply brand styles when mode changes
  useEffect(() => {
    applyBrandStyles(brandMode);
  }, [brandMode]);

  // Page components mapping
  const pages = {
    landing: LandingPage,
    'asset-discovery': AssetDiscoveryPage,
    'hidden-scanner': HiddenScannerPage,
    'loss-estimator': LossEstimatorPage,
    'template-generator': TemplateGeneratorPage,
    'data-value': DataValuePage,
    partnership: PartnershipPage,
  };

  const CurrentPageComponent = pages[currentPage];

  return (
    <div className="app-container">
      <Header />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="page-container"
            >
              <CurrentPageComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

function AppWithProvider() {
  return (
    <StoreProvider>
      <App />
    </StoreProvider>
  );
}

export default AppWithProvider;
