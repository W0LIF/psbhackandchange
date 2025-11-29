// components/Header/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ onAuthClick, isAuthenticated, onLogout }) => {
  const location = useLocation();
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

  const handleProfileButtonClick = () => {
    if (!isAuthenticated) {
      setShowAuthDropdown(!showAuthDropdown);
      setShowProfileDropdown(false);
    } else {
      setShowProfileDropdown(!showProfileDropdown);
      setShowAuthDropdown(false);
    }
  };

  const handleLogin = () => {
    setShowAuthDropdown(false);
    if (onAuthClick) {
      onAuthClick();
    }
  };

  const handleLogout = () => {
    setShowProfileDropdown(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleRegister = () => {
    setShowAuthDropdown(false);
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
          {isAuthenticated && (
            <Link 
              to="/profile" 
              className={location.pathname === '/profile' ? 'nav-link active' : 'nav-link'}
            >
              Профиль
            </Link>
          )}
        </nav>
        
        <div className="auth-section">
          <div className={isAuthenticated ? "profile-dropdown-container" : "auth-dropdown-container"} 
               ref={isAuthenticated ? profileDropdownRef : authDropdownRef}>
            <button 
              className="profile-button"
              onClick={handleProfileButtonClick}
              onMouseEnter={() => isAuthenticated ? setShowProfileDropdown(true) : setShowAuthDropdown(true)}
            >
              Профиль
            </button>
            {!isAuthenticated && showAuthDropdown && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={handleLogin}>
                  Войти
                </button>
                <button className="dropdown-item" onClick={handleRegister}>
                  Регистрация
                </button>
              </div>
            )}
            {isAuthenticated && showProfileDropdown && (
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item" onClick={handleProfileClick}>
                  Мой материалы
                </Link>
                <button className="dropdown-item">Мои курсы</button>
                <button className="dropdown-item">Настройки</button>
                <button className="dropdown-item" onClick={handleLogout}>
                  Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;