// components/Header/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';


const Header = ({ onAuthClick, isAuthenticated, onLogout }) => {
  const location = useLocation();
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const authDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const navigate = useNavigate();
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
      if (onAuthClick) {
        onAuthClick();
      }
    } else {
      setShowProfileDropdown(!showProfileDropdown);
      setShowAuthDropdown(false);
    }
  };

  const handleMyCourse = () => {
    setShowProfileDropdown(false);
    navigate('/courses'); // Навигация на страницу курсов через React Router
  };

  const handleLogout = () => {
    setShowProfileDropdown(false);
    if (onLogout) {
      onLogout();
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
        
        <div className="auth-section">
          <div className={isAuthenticated ? "profile-dropdown-container" : "auth-dropdown-container"} 
               ref={isAuthenticated ? profileDropdownRef : authDropdownRef}>
            <button 
              className="profile-button"
              onClick={handleProfileButtonClick}
              onMouseEnter={() => isAuthenticated && setShowProfileDropdown(true)}
            >
              {isAuthenticated ? 'Профиль' : 'Войти'}
            </button>
            {isAuthenticated && showProfileDropdown && (
              <div className="dropdown-menu">
                <Link to="/profile" className="dropdown-item" onClick={handleProfileClick}>
                  Мои материалы
                </Link>
                <button className="dropdown-item" onClick={handleMyCourse}>Мои курсы</button>
                <button className="dropdown-item" >Настройки</button>
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