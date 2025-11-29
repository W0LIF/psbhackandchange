import React, { useState } from 'react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        {isLogin ? (
          // Форма авторизации
          <div className="auth-form">
            <h2>Авторизация</h2>
            <div className="form-group">
              <input type="text" placeholder="Логин" />
            </div>
            <div className="form-group">
              <input type="password" placeholder="Пароль" />
            </div>
            <button className="submit-button">Войти</button>
            <div className="switch-form">
              <span>Нет аккаунта? </span>
              <button className="switch-button" onClick={switchToRegister}>
                Зарегистрироваться
              </button>
            </div>
          </div>
        ) : (
          // Форма регистрации
          <div className="auth-form">
            <h2>Регистрация</h2>
            <div className="form-group">
              <input type="text" placeholder="ФИО" />
            </div>
            <div className="form-group">
              <input type="text" placeholder="Логин" />
            </div>
            <div className="form-group">
              <input type="email" placeholder="Email" />
            </div>
            <div className="form-group">
              <input type="password" placeholder="Пароль" />
            </div>
            <div className="form-group">
              <input type="password" placeholder="Подтвердить пароль" />
            </div>
            <button className="submit-button">Зарегистрироватся</button>
            <div className="switch-form">
              <span>Уже есть аккаунт? </span>
              <button className="switch-button" onClick={switchToLogin}>
                Войти
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;