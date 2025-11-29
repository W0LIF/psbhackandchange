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
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const switchToRegister = () => {
    setIsLogin(false);
    setErrors({});
    setFormData({
      fullName: '',
      login: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setErrors({});
    setFormData({
      fullName: '',
      login: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очищаем ошибку при вводе
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    
    // Проверка заполнения полей
    const newErrors = {};
    if (!formData.login.trim()) {
      newErrors.login = 'Логин обязателен для заполнения';
    }
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен для заполнения';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Проверка логина и пароля (тестовые данные)
    if (formData.login !== 'test' || formData.password !== '123456') {
      setErrors({ general: 'Неверный логин или пароль' });
      return;
    }

    console.log('Авторизация:', formData);
    onAuthSuccess(true);
    onClose();
    navigate('/');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    
    // Проверка заполнения полей
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'ФИО обязательно для заполнения';
    }
    if (!formData.login.trim()) {
      newErrors.login = 'Логин обязателен для заполнения';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
    }
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен для заполнения';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Подтвердите пароль';
    }

    // Проверка формата email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Введите корректный email адрес';
    }

    // Проверка совпадения паролей
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Регистрация:', formData);
    onAuthSuccess(true);
    onClose();
    navigate('/');
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        {isLogin ? (
          <form className="auth-form" onSubmit={handleLogin} noValidate>
            <h2>Авторизация</h2>
            
            {/* Общая ошибка */}
            {errors.general && <div className="error-message">{errors.general}</div>}
            
            <div className="form-group">
              <input 
                type="text" 
                name="login"
                placeholder="Логин" 
                value={formData.login}
                onChange={handleInputChange}
                className={errors.login ? 'error' : ''}
              />
              {errors.login && <span className="error-text">{errors.login}</span>}
            </div>
            <div className="form-group">
              <input 
                type="password" 
                name="password"
                placeholder="Пароль" 
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
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
          <form className="auth-form" onSubmit={handleRegister} noValidate>
            <h2>Регистрация</h2>
            
            <div className="form-group">
              <input 
                type="text" 
                name="fullName"
                placeholder="ФИО" 
                value={formData.fullName}
                onChange={handleInputChange}
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && <span className="error-text">{errors.fullName}</span>}
            </div>
            <div className="form-group">
              <input 
                type="text" 
                name="login"
                placeholder="Логин" 
                value={formData.login}
                onChange={handleInputChange}
                className={errors.login ? 'error' : ''}
              />
              {errors.login && <span className="error-text">{errors.login}</span>}
            </div>
            <div className="form-group">
              <input 
                type="email" 
                name="email"
                placeholder="Email" 
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            <div className="form-group">
              <input 
                type="password" 
                name="password"
                placeholder="Пароль" 
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            <div className="form-group">
              <input 
                type="password" 
                name="confirmPassword"
                placeholder="Подтвердить пароль" 
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
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