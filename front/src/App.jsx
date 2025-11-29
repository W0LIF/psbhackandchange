// App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header/Header.jsx';
import HomePage from './page/mainpage/page.jsx';
import ProfilePage from './page/profile/profile.jsx';
import AuthModal from './components/autorezation/autorezation.jsx';
import Courses from './components/my_course/information.jsx'; // Добавьте этот импорт
import CourseDetail from './page/name_course/name_course.jsx';
import TopicDetail from './page/homeTheme/homeTheme.jsx';
import Homework from './components/homework/homework.jsx'; 

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // Изменил на false по умолчанию
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const handleAuthSuccess = (success) => {
    setIsAuthenticated(success);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
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
          <Route path="/" element={<HomePage isAuthenticated={isAuthenticated} />} />
          <Route path="/profile" element={<ProfilePage isAuthenticated={isAuthenticated} />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/topic" element={<CourseDetail />} /> 
        <Route path="/topicNumber" element={<TopicDetail />} />
        <Route path="/homework" element={<Homework />} />
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