// components/Header/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ onAuthClick }) => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const authDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);

  // Обработчик клика вне dropdown для его закрытия
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target)) {
        setShowAuthDropdown(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAuthButtonClick = () => {
    if (!isLoggedIn) {
      setShowAuthDropdown(!showAuthDropdown);
      setShowProfileDropdown(false);
    } else {
      setShowProfileDropdown(!showProfileDropdown);
      setShowAuthDropdown(false);
    }
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
    setShowAuthDropdown(false);
    // Здесь можно добавить логику входа
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowProfileDropdown(false);
    // Здесь можно добавить логику выхода
  };

  const handleRegister = () => {
    setShowAuthDropdown(false);
    // Здесь можно открыть модальное окно регистрации
    if (onAuthClick) {
      onAuthClick();
    }
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">Учебная платформа</Link>
        </div>
        
        <nav className="nav">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
          >
            Главная
          </Link>
          <Link 
            to="/profile" 
            className={location.pathname === '/profile' ? 'nav-link active' : 'nav-link'}
          >
            Профиль
          </Link>
        </nav>
        
        <div className="auth-section">
          {!isLoggedIn ? (
            <div className="auth-dropdown-container" ref={authDropdownRef}>
              <button 
                className="auth-button"
                onClick={handleAuthButtonClick}
                onMouseEnter={() => setShowAuthDropdown(true)}
              >
                Войти
              </button>
              {showAuthDropdown && (
                <div className="dropdown-menu">
                  <button className="dropdown-item" onClick={() => { setShowAuthDropdown(false); onAuthClick(); }}>
                    Войти
                  </button>
                  <button className="dropdown-item" onClick={handleRegister}>
                    Регистрация
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="profile-dropdown-container" ref={profileDropdownRef}>
              <button 
                className="profile-button"
                onClick={handleAuthButtonClick}
                onMouseEnter={() => setShowProfileDropdown(true)}
              >
                Профиль
              </button>
              {showProfileDropdown && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item" onClick={handleProfileClick}>
                    Мой профиль
                  </Link>
                  <button className="dropdown-item">Мои курсы</button>
                  <button className="dropdown-item">Настройки</button>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Выйти
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;