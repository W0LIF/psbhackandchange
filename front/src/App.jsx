// App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header/Header.jsx';
import HomePage from './page/mainpage/page.jsx';
import ProfilePage from './page/profile/profile.jsx';
import AuthModal from './components/autorezation/autorezation.jsx';
import Course from './components/course/course.jsx'; // Предполагаемый путь к компоненту Course

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handleAuthSuccess = (success) => {
    setIsAuthenticated(success);
    // После успешной авторизации можно перенаправить на профиль или оставить на главной
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    // Дополнительная логика выхода: очистка токенов и т.д.
  };

  return (
    <Router>
      <div className="App">
        <Header 
          onAuthClick={() => setIsAuthModalOpen(true)} 
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
        
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                isAuthenticated={isAuthenticated}
                onAuthClick={() => setIsAuthModalOpen(true)}
              />
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProfilePage 
                isAuthenticated={isAuthenticated}
                onAuthRequired={() => setIsAuthModalOpen(true)}
              />
            } 
          />
          {/* Добавьте другие маршруты по необходимости */}
        </Routes>

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </Router>
  );
}

export default App;