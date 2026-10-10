import React, { useState } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import MessageCreation from './pages/MessageCreation.jsx';
import MessageInquiry from './pages/MessageInquiry.jsx';
import { authStorage } from './services/api.js';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState(() => {
    return authStorage.getToken() ? 'create-message' : 'login';
  });
  const [operatorId, setOperatorId] = useState(() => {
    const user = authStorage.getUser();
    return user?.email || user?.username || 'operator@swiftmx.bank';
  });

  const handleLoginSuccess = (user) => {
    setOperatorId(user || 'operator@swiftmx.bank');
    setCurrentView('create-message');
  };

  const handleSignOut = () => {
    authStorage.clear();
    setCurrentView('login');
  };

  return (
    <div className="app-root">
      {currentView === 'login' && (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}

      {currentView === 'create-message' && (
        <MessageCreation
          operatorId={operatorId}
          onNavigateBack={handleSignOut}
          onNavigateToInquiry={() => setCurrentView('inquiry')}
        />
      )}

      {currentView === 'inquiry' && (
        <MessageInquiry
          operatorId={operatorId}
          onNavigateToCreation={() => setCurrentView('create-message')}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  );
}

export default App;
