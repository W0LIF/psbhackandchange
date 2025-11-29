import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">Учебная платформа</div>
        <nav className="nav">
          <ul className="nav-list">
            <li className="nav-item"><a href="#" className="nav-link">ПСБ</a></li>
            <li className="nav-item"><a href="#" className="nav-link">Курсы</a></li>
            <li className="nav-item"><a href="#" className="nav-link">Расписание</a></li>
            <li className="nav-item"><a href="#" className="nav-link">Учебные материалы</a></li>
          </ul>
        </nav>
        <button className="auth-button">Войти</button>
      </div>
    </header>
  );
};

export default Header;