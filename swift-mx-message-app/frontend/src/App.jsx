import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import MessageCreation from './pages/MessageCreation.jsx';
import MessageInquiry from './pages/MessageInquiry.jsx';
import { authStorage } from './services/api.js';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState(() => {
    if (!authStorage.getToken()) return 'login';
    return window.history.state?.view || 'create-message';
  });
  const [operatorId, setOperatorId] = useState(() => {
    const user = authStorage.getUser();
    return user?.email || user?.username || 'operator@swiftmx.bank';
  });

  useEffect(() => {
    if (!window.history.state || !window.history.state.view) {
      window.history.replaceState({ view: currentView }, '');
    }

    const handlePopState = (event) => {
      const targetView = event.state?.view || (authStorage.getToken() ? 'create-message' : 'login');
      if (targetView !== 'login' && !authStorage.getToken()) {
        setCurrentView('login');
      } else {
        setCurrentView(targetView);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView]);

  const navigateTo = (view) => {
    if (view !== 'login' && !authStorage.getToken()) {
      setCurrentView('login');
      return;
    }
    if (view === currentView) return;
    window.history.pushState({ view }, '');
    setCurrentView(view);
  };

  const handleLoginSuccess = (user) => {
    setOperatorId(user || 'operator@swiftmx.bank');
    navigateTo('create-message');
  };

  const handleSignOut = () => {
    authStorage.clear();
    navigateTo('login');
  };

  const isAuthenticated = Boolean(authStorage.getToken());
  const activeView = isAuthenticated ? currentView : 'login';

  return (
    <div className="app-root">
      {activeView === 'login' && (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}

      {activeView === 'create-message' && (
        <MessageCreation
          operatorId={operatorId}
          onNavigateBack={handleSignOut}
          onNavigateToInquiry={() => navigateTo('inquiry')}
        />
      )}

      {activeView === 'inquiry' && (
        <MessageInquiry
          operatorId={operatorId}
          onNavigateToCreation={() => navigateTo('create-message')}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  );
}

export default App;
