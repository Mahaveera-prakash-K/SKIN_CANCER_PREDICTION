import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { HistoryPage } from './pages/HistoryPage';
import { MetricsPage } from './pages/MetricsPage';
import { ComparisonPage } from './pages/ComparisonPage';
import { ExplainabilityPage } from './pages/ExplainabilityPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';
import { AuthModal } from './components/AuthModal';
import { PredictionDetailModal } from './components/PredictionDetailModal';
import { User, ModelVersion, PredictionRecord, SystemHealth } from './types';
import { api } from './services/api';
import { Menu } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [models, setModels] = useState<ModelVersion[]>([]);
  const [activeModel, setActiveModel] = useState<ModelVersion | null>(null);
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);

  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionRecord | null>(null);

  // Initialize Auth state from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('dermascan_user');
    const token = localStorage.getItem('dermascan_token');
    if (savedUser && token) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('dermascan_user');
        localStorage.removeItem('dermascan_token');
      }
    }

    const handleAuthChange = () => {
      const u = localStorage.getItem('dermascan_user');
      setCurrentUser(u ? JSON.parse(u) : null);
    };
    window.addEventListener('dermascan_auth_changed', handleAuthChange);
    return () => window.removeEventListener('dermascan_auth_changed', handleAuthChange);
  }, []);

  // Fetch Models & System Health
  const loadSystemInfo = async () => {
    try {
      const [health, modelsList, active] = await Promise.all([
        api.getHealth(),
        api.getModels(),
        api.getActiveModel(),
      ]);
      setSystemHealth(health);
      setModels(modelsList);
      setActiveModel(active);
    } catch (e) {
      console.error('Failed to load initial system status:', e);
    }
  };

  useEffect(() => {
    loadSystemInfo();
  }, []);

  // Fetch Predictions when logged in
  const loadPredictions = async () => {
    if (!currentUser) {
      setPredictions([]);
      return;
    }
    try {
      const preds = await api.getPredictions();
      setPredictions(preds);
    } catch (e) {
      console.warn('Could not load user predictions:', e);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('dermascan_token');
    localStorage.removeItem('dermascan_user');
    setCurrentUser(null);
    setPredictions([]);
    setCurrentTab('landing');
  };

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    loadPredictions();
    setCurrentTab('dashboard');
  };

  const handleModelActivated = (updatedModel: ModelVersion) => {
    setActiveModel(updatedModel);
    setModels((prev) =>
      prev.map((m) => ({
        ...m,
        is_active: m.model_id === updatedModel.model_id,
      }))
    );
  };

  const handleDeletePrediction = (id: number) => {
    setPredictions((prev) => prev.filter((p) => p.id !== id));
    if (selectedPrediction?.id === id) {
      setSelectedPrediction(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        user={currentUser}
        activeModel={activeModel}
        systemHealth={systemHealth}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (Rendered when inside workspace tabs) */}
        {currentTab !== 'landing' && (
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            userRole={currentUser?.role}
            onLogout={handleLogout}
            isOpenMobile={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Mobile hamburger button for workspace tabs */}
          {currentTab !== 'landing' && (
            <div className="lg:hidden p-4 border-b border-neutral-800 flex items-center justify-between">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300"
              >
                <Menu className="w-5 h-5" />
              </button>
              <span className="text-xs font-mono font-bold text-neutral-400 capitalize">
                {currentTab.replace('-', ' ')}
              </span>
            </div>
          )}

          <div className={currentTab === 'landing' ? '' : 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto'}>
            {currentTab === 'landing' && (
              <LandingPage
                onAnalyzeClick={() => {
                  if (!currentUser) {
                    handleOpenAuth('login');
                  } else {
                    setCurrentTab('analyze');
                  }
                }}
                onExploreModelsClick={() => setCurrentTab('comparison')}
              />
            )}

            {currentTab === 'dashboard' && (
              <DashboardPage
                predictions={predictions}
                activeModel={activeModel}
                systemHealth={systemHealth}
                onNavigate={setCurrentTab}
                onSelectPrediction={setSelectedPrediction}
              />
            )}

            {currentTab === 'analyze' && (
              <AnalyzePage
                onPredictionSuccess={(res) => {
                  loadPredictions();
                }}
                onNavigateHistory={() => setCurrentTab('history')}
              />
            )}

            {currentTab === 'history' && (
              <HistoryPage
                predictions={predictions}
                onDeletePrediction={handleDeletePrediction}
                onSelectPrediction={setSelectedPrediction}
              />
            )}

            {currentTab === 'metrics' && <MetricsPage />}

            {currentTab === 'comparison' && (
              <ComparisonPage
                models={models}
                activeModel={activeModel}
                isAdmin={currentUser?.role === 'ADMIN'}
                onModelActivated={handleModelActivated}
              />
            )}

            {currentTab === 'explainability' && <ExplainabilityPage />}

            {currentTab === 'profile' && currentUser && (
              <ProfilePage
                user={currentUser}
                onUpdateUser={(updated) => {
                  setCurrentUser(updated);
                  localStorage.setItem('dermascan_user', JSON.stringify(updated));
                }}
              />
            )}

            {currentTab === 'admin' && currentUser?.role === 'ADMIN' && (
              <AdminPage
                models={models}
                activeModel={activeModel}
                onModelActivated={handleModelActivated}
                systemHealth={systemHealth}
                onRefreshHealth={loadSystemInfo}
              />
            )}
          </div>
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Prediction Detail Modal */}
      <PredictionDetailModal
        prediction={selectedPrediction}
        onClose={() => setSelectedPrediction(null)}
      />
    </div>
  );
}
