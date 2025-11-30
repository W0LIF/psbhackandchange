// components/autorezation/autorezation.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './autorezation.css';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    group: '', // group used for registration
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const resetForm = (toLogin = true) => {
    setIsLogin(toLogin);
    setErrors({});
    setFormData({
      fullName: '',
      login: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  const switchToRegister = () => {
    resetForm(false);
  };

  const switchToLogin = () => {
    resetForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name] || errors.general) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        general: name === 'email' || name === 'password' ? '' : prev.general
      }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email обязателен для заполнения';
    }
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен для заполнения';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // важно для refreshToken в cookie
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors({
          general: data?.error || 'Ошибка авторизации'
        });
        return;
      }

      const user = data && data.user ? data.user : { email: formData.email.trim().toLowerCase() };

      onAuthSuccess(true, user);
      onClose();
      navigate('/');
    } catch (err) {
      setErrors({ general: 'Сервер недоступен, попробуйте позже' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'ФИО обязательно для заполнения';
    }
    if (!formData.group.trim()) {
      newErrors.group = 'Группа обязателена для заполнения';
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Введите корректный email адрес';
    }

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});

      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: formData.email.trim().toLowerCase(),
            password: formData.password,
            name: formData.fullName.trim(),
            group: formData.group || null
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrors({
          general: data?.error || 'Ошибка регистрации'
        });
        return;
      }

      const registeredUser = data && data.email
        ? { email: data.email, id: data.id, fullName: data.student && data.student.name ? data.student.name : null }
        : { email: formData.email.trim().toLowerCase() };

      // после успешной регистрации предлагаем залогиниться теми же данными
      setFormData(prev => ({
        ...prev,
        email: formData.email.trim().toLowerCase()
      }));
      setIsLogin(true);
      onAuthSuccess(true, registeredUser);
      onClose();
      navigate('/');
    } catch (err) {
      setErrors({ general: 'Сервер недоступен, попробуйте позже' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <div className="auth-layout">
          <div className="auth-image" />
          <div className="auth-form-wrapper">
            {isLogin ? (
              <form className="auth-form" onSubmit={handleLogin} noValidate>
                <h2>Авторизация</h2>
                
                {errors.general && <div className="error-message">{errors.general}</div>}
                
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
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Вход...' : 'Войти'}
                </button>
                <div className="switch-form">
                  <button type="button" className="switch-link" onClick={switchToRegister}>
                    Зарегистрироваться
                  </button>
                </div>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleRegister} noValidate>
                <h2>Регистрация</h2>

                {errors.general && <div className="error-message">{errors.general}</div>}
                
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
                    name="group"
                    placeholder="Группа" 
                    value={formData.group}
                    onChange={handleInputChange}
                    className={errors.group ? 'error' : ''}
                  />
                  {errors.group && <span className="error-text">{errors.group}</span>}
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
                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                </button>
                <div className="switch-form">
                  <button type="button" className="switch-link" onClick={switchToLogin}>
                    Войти
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
