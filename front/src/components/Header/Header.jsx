// components/Header/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';


const Header = ({ onAuthClick, isAuthenticated, onLogout }) => {
  const location = useLocation();
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const authDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const searchRef = useRef(null);
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
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

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
          <Link to="/" className="logo-link">
            <img 
              src="/logo.svg" 
              alt="Учебная платформа" 
              width="40" 
              height="40"
            />
          </Link>
        </div>

        <nav className="nav">
          <Link to="/courses" className="nav-link">
            Курсы
          </Link>
          <button
            className="nav-link nav-link-button"
            type="button"
            onClick={() => navigate('/schedule')}
          >
            Расписание
          </button>
          <button
            className="nav-link nav-link-button"
            type="button"
            onClick={() => navigate('/materials')}
          >
            Учебные материалы
          </button>
        </nav>

        <div className="search-container" ref={searchRef}>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              className="search-input"
              placeholder="Поиск по курсам и материалам..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSearchResults(true)}
            />
            <button type="submit" className="search-button">
              🔍
            </button>
          </form>
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
                  Мой профиль
                </Link>
                <button className="dropdown-item" onClick={handleMyCourse}>Мои курсы</button>
                <button className="dropdown-item" onClick={() => { setShowProfileDropdown(false); navigate('/grades'); }}>
                  Журнал успеваемости
                </button>
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