// App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header/Header.jsx';
import HomePage from './page/mainpage/page.jsx';
import ProfilePage from './page/profile/profile.jsx';
import AuthModal from './components/autorezation/autorezation.jsx';
import Courses from './components/my_course/information.jsx';
import CourseDetail from './page/name_course/name_course.jsx';
import TopicDetail from './page/homeTheme/homeTheme.jsx';
import Homework from './components/homework/homework.jsx';
import SchedulePage from './page/schedule/schedule.jsx';
import MaterialsPage from './page/materials/materials.jsx';
import GradesPage from './page/grades/grades.jsx';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // { email, fullName? }

  const handleAuthSuccess = (success, user) => {
    setIsAuthenticated(success);
    setCurrentUser(user || null);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
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
          <Route path="/" element={<HomePage isAuthenticated={isAuthenticated} currentUser={currentUser} />} />
          <Route path="/profile" element={<ProfilePage isAuthenticated={isAuthenticated} currentUser={currentUser} />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/topic" element={<CourseDetail />} /> 
          <Route path="/topicNumber" element={<TopicDetail />} />
          <Route path="/homework" element={<Homework />} />
          <Route path="/schedule" element={<SchedulePage isAuthenticated={isAuthenticated} currentUser={currentUser} />} />
          <Route path="/materials" element={<MaterialsPage isAuthenticated={isAuthenticated} currentUser={currentUser} />} />
          <Route path="/grades" element={<GradesPage isAuthenticated={isAuthenticated} currentUser={currentUser} />} />
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