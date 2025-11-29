// components/autorezation/autorezation.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './autorezation.css';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    login: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const navigate = useNavigate();

  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Авторизация:', formData);
    onAuthSuccess(true);
    onClose();
    navigate('/'); // Перенаправляем на главную
  };

  const handleRegister = (e) => {
    e.preventDefault();
    console.log('Регистрация:', formData);
    onAuthSuccess(true);
    onClose();
    navigate('/'); // Перенаправляем на главную
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        {isLogin ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <h2>Авторизация</h2>
            <div className="form-group">
              <input 
                type="text" 
                name="login"
                placeholder="Логин" 
                value={formData.login}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input 
                type="password" 
                name="password"
                placeholder="Пароль" 
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="submit-button">Войти</button>
            <div className="switch-form">
              <span>Нет аккаунта? </span>
              <button type="button" className="switch-button" onClick={switchToRegister}>
                Зарегистрироваться
              </button>
            </div>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <h2>Регистрация</h2>
            <div className="form-group">
              <input 
                type="text" 
                name="fullName"
                placeholder="ФИО" 
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input 
                type="text" 
                name="login"
                placeholder="Логин" 
                value={formData.login}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input 
                type="email" 
                name="email"
                placeholder="Email" 
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input 
                type="password" 
                name="password"
                placeholder="Пароль" 
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <input 
                type="password" 
                name="confirmPassword"
                placeholder="Подтвердить пароль" 
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            <button type="submit" className="submit-button">Зарегистрироваться</button>
            <div className="switch-form">
              <span>Уже есть аккаунт? </span>
              <button type="button" className="switch-button" onClick={switchToLogin}>
                Войти
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;