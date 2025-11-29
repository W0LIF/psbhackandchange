// components/Header/Header.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = ({ onAuthClick }) => {
  const location = useLocation();

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
      </div>
    </header>
  );
};

export default Header;