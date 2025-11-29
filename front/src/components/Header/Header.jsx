<<<<<<< HEAD
// components/Header/Header.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ onAuthClick }) => {
  const location = useLocation();
=======
import React, { useState, useRef, useEffect } from 'react';
import './Header.css';

const Header = () => {
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
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setShowProfileDropdown(false);
  };

  const handleRegister = () => {
    // Логика регистрации
    setShowAuthDropdown(false);
  };
>>>>>>> e74d98744bce1d9543d544fd7c4b2863f4ef4dec

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
          <button className="auth-button" onClick={onAuthClick}>
            Войти
          </button>
        </nav>
<<<<<<< HEAD
=======
        
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
                  <button className="dropdown-item" onClick={handleLogin}>
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
                  <button className="dropdown-item">Мой профиль</button>
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
>>>>>>> e74d98744bce1d9543d544fd7c4b2863f4ef4dec
      </div>
    </header>
  );
};

export default Header;