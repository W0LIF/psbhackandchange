// src/components/TopicDetail.jsx
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './homework.css';

const TopicDetail = () => {
  const navigate = useNavigate();
  const { courseId, topicId } = useParams();
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    email: '',
    taskDescription: '',
    file: null
  });
  const [fileName, setFileName] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Данные формы:', formData);
    alert('Задание отправлено!');
    navigate(-1); // Возвращаемся назад после отправки
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
              <h1 className="submission-title">Отправка выполненного задания</h1>
              
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

                <button type="submit" className="submit-button">
                  Отправить задание
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