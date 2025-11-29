// src/components/TopicDetail.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './homework.css';

const TopicDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId, topicId, title } = location.state || {};
  
  // Получаем текущего пользователя из App через пропсы или localStorage
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  
  useEffect(() => {
    // Попробуем получить email из localStorage или других источников
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      setCurrentUserEmail(storedEmail);
      setFormData(prev => ({ ...prev, email: storedEmail }));
    }
  }, []);
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    email: currentUser?.email || '',
    taskDescription: '',
    file: null
  });
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingHomework, setExistingHomework] = useState(null);
  const [isNewVersion, setIsNewVersion] = useState(false);

  // Проверяем, есть ли уже отправленное задание по этой теме
  useEffect(() => {
    const email = formData.email || currentUserEmail;
    if (email && topicId) {
      const checkExisting = async () => {
        try {
          const res = await fetch(`/api/homeworks?email=${encodeURIComponent(email)}`);
          const data = await res.json().catch(() => ({}));
          if (res.ok && data.homeworks) {
            const existing = data.homeworks.find(hw => hw.topic_id === topicId);
            if (existing) {
              setExistingHomework(existing);
              setIsNewVersion(true);
            }
          }
        } catch (e) {
          // Игнорируем ошибки при проверке
        }
      };
      checkExisting();
    }
  }, [formData.email, currentUserEmail, topicId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file: file
      }));
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.file) {
      setError('Нужно выбрать файл');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('lastName', formData.lastName);
      data.append('firstName', formData.firstName);
      data.append('email', formData.email);
      data.append('taskDescription', formData.taskDescription);
      if (courseId !== undefined) data.append('courseId', courseId);
      if (topicId !== undefined) data.append('topicId', topicId);
      // Если это новая версия существующего задания
      if (isNewVersion && existingHomework) {
        const parentId = existingHomework.parent_homework_id || existingHomework.id;
        data.append('parentHomeworkId', parentId);
      }
      data.append('file', formData.file);

      const res = await fetch('/api/homeworks', {
        method: 'POST',
        body: data
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json?.error || 'Не удалось отправить задание');
        return;
      }

      const versionText = json.homework?.version > 1 ? ` (версия ${json.homework.version})` : '';
      setSuccess(`Задание отправлено${versionText}!`);
      setFormData({
        lastName: '',
        firstName: '',
        email: formData.email, // Сохраняем email
        taskDescription: '',
        file: null
      });
      setFileName('');
      setExistingHomework(null);
      setIsNewVersion(false);
      
      // Можно вернуть пользователя назад через 2 секунды
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } catch (err) {
      setError('Сервер недоступен, попробуйте позже');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="topic-detail-container">
      <header className="topic-header">
        <button 
          className="back-button"
          onClick={handleBack}
        >
          ← Назад
        </button>
        <h1 className="topic-title">Отправка задания</h1>
      </header>

      <div className="topic-content">
        <div className="homework-section">
          <div className="submission-container">
            <div className="submission-card">
              <h1 className="submission-title">Отправка выполненного задания {title ? `по теме "${title}"` : ''}</h1>

              {isNewVersion && existingHomework && (
                <div className="version-notice">
                  <p>⚠️ У вас уже есть отправленное задание по этой теме.</p>
                  <p>Это будет новая версия задания (текущая версия: {existingHomework.version || 1}).</p>
                  {existingHomework.grade != null && (
                    <p>Текущая оценка: {existingHomework.grade}</p>
                  )}
                </div>
              )}

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}
              
              <form onSubmit={handleSubmit} className="submission-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="lastName">Фамилия</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="firstName">Имя</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="taskDescription">Описание задания</label>
                  <textarea
                    id="taskDescription"
                    name="taskDescription"
                    value={formData.taskDescription}
                    onChange={handleInputChange}
                    rows="4"
                    placeholder="Опишите ваше задание..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="fileUpload" className="file-label">
                    Загрузите свое выполненное задание
                  </label>
                  <input
                    type="file"
                    id="fileUpload"
                    onChange={handleFileChange}
                    className="file-input"
                    required
                  />
                  {fileName && (
                    <div className="file-info">
                      Выбран файл: {fileName}
                    </div>
                  )}
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? 'Отправка...' : 'Отправить задание'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default TopicDetail;