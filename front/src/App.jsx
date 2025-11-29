// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header/Header.jsx';
import HomePage from './page/mainpage/page.jsx'; // Предполагаемый путь
import ProfilePage from './page/profile/profile.jsx'; // Предполагаемый путь
import AuthModal from './components/autorezation/autorezation.jsx'; // Переименуйте файл в AuthModal.jsx

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  return (
    <Router>
      <div className="App">
        <Header onAuthClick={() => setIsAuthModalOpen(true)} />
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>

        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setIsAuthModalOpen(false)} 
        />
      </div>
    </Router>
  );
}

export default App;