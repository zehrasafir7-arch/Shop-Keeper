import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/auth/LoginPage.js';
import { RegisterPage } from './pages/auth/RegisterPage.js';
import { ForgotPasswordModal } from './pages/auth/ForgotPasswordModal.js';
import { BusinessSetupWizard } from './pages/onboarding/BusinessSetupWizard.js';
import { DashboardPage } from './pages/dashboard/DashboardPage.js';
import { PosBillingPage } from './pages/billing/PosBillingPage.js';
import { WeeklySalesPage } from './pages/sales/WeeklySalesPage.js';
import { SalesListPage } from './pages/sales/SalesListPage.js';
import { ProductsPage } from './pages/products/ProductsPage.js';
import { CustomersPage } from './pages/customers/CustomersPage.js';
import { ExpensesPage } from './pages/expenses/ExpensesPage.js';
import { OffersPage } from './pages/offers/OffersPage.js';
import { ShopkeeperAIPage } from './pages/ai/ShopkeeperAIPage.js';
import { SettingsPage } from './pages/settings/SettingsPage.js';

import { Sidebar } from './components/layout/Sidebar.js';
import { Header } from './components/layout/Header.js';
import { BottomNav } from './components/layout/BottomNav.js';
import { PWAInstallBanner } from './components/common/PWAInstallBanner.js';
import { api } from './lib/api.js';
import type { AppNotification } from './types/index.js';

import { ToastProvider } from './components/common/Toast.js';

type AuthView = 'landing' | 'login' | 'register';

function MainApp() {
  const { user, activeBusiness, loading } = useAuth();

  const [authView, setAuthView] = useState<AuthView>('landing');
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Global Quick Action Modal triggers
  const [isQuickProductOpen, setIsQuickProductOpen] = useState(false);
  const [isQuickCustomerOpen, setIsQuickCustomerOpen] = useState(false);
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const loadNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    if (user && activeBusiness) {
      loadNotifications();
    }
  }, [user?.id, activeBusiness?.id, refreshKey]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 animate-pulse flex items-center justify-center font-bold text-lg mb-3">
          SP
        </div>
        <p className="text-sm font-semibold tracking-wide text-slate-300">Loading Shopkeeper Pro...</p>
      </div>
    );
  }

  // Not logged in: Show Landing, Login, or Register
  if (!user || !activeBusiness) {
    return (
      <>
        {authView === 'landing' && (
          <LandingPage
            onGoToLogin={() => setAuthView('login')}
            onGoToRegister={() => setAuthView('register')}
          />
        )}
        {authView === 'login' && (
          <LoginPage
            onGoToRegister={() => setAuthView('register')}
            onGoToLanding={() => setAuthView('landing')}
            onOpenForgotPassword={() => setIsForgotPassOpen(true)}
          />
        )}
        {authView === 'register' && (
          <RegisterPage
            onGoToLogin={() => setAuthView('login')}
            onGoToLanding={() => setAuthView('landing')}
          />
        )}
        <ForgotPasswordModal
          isOpen={isForgotPassOpen}
          onClose={() => setIsForgotPassOpen(false)}
        />
      </>
    );
  }

  // Business Onboarding Wizard if not finished
  if (!activeBusiness.setupCompleted) {
    return <BusinessSetupWizard onComplete={() => setCurrentTab('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Desktop & Mobile Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setIsMobileMenuOpen(false);
        }}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen pb-16 lg:pb-0">
        {/* PWA In-App Install Banner */}
        <PWAInstallBanner />

        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onNavigateTab={(tab) => setCurrentTab(tab)}
          notifications={notifications}
          onRefreshData={() => setRefreshKey((k) => k + 1)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1">
          {currentTab === 'dashboard' && (
            <DashboardPage
              key={refreshKey}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenNewProductModal={() => {
                setCurrentTab('products');
                setIsQuickProductOpen(true);
              }}
              onOpenNewCustomerModal={() => {
                setCurrentTab('customers');
                setIsQuickCustomerOpen(true);
              }}
              onOpenNewExpenseModal={() => {
                setCurrentTab('expenses');
                setIsQuickExpenseOpen(true);
              }}
            />
          )}

          {currentTab === 'billing' && (
            <PosBillingPage
              key={refreshKey}
              onRefreshData={() => setRefreshKey((k) => k + 1)}
            />
          )}

          {currentTab === 'weekly-sales' && <WeeklySalesPage key={refreshKey} />}

          {currentTab === 'sales' && <SalesListPage key={refreshKey} />}

          {(currentTab === 'products' || currentTab === 'inventory') && (
            <ProductsPage
              key={refreshKey}
              isAddProductOpen={isQuickProductOpen}
              onCloseAddProduct={() => setIsQuickProductOpen(false)}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersPage
              key={refreshKey}
              isAddCustomerOpen={isQuickCustomerOpen}
              onCloseAddCustomer={() => setIsQuickCustomerOpen(false)}
            />
          )}

          {currentTab === 'expenses' && (
            <ExpensesPage
              key={refreshKey}
              isAddExpenseOpen={isQuickExpenseOpen}
              onCloseAddExpense={() => setIsQuickExpenseOpen(false)}
            />
          )}

          {currentTab === 'offers' && <OffersPage key={refreshKey} />}

          {currentTab === 'ai-assistant' && <ShopkeeperAIPage key={refreshKey} />}

          {currentTab === 'settings' && <SettingsPage key={refreshKey} />}
        </main>
      </div>

      {/* Mobile Touch Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
