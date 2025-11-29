// src/components/TopicDetail.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './homeTheme.css';

const TopicDetail = () => {
  const navigate = useNavigate();
  const { courseId, topicId } = useParams();

  const handleBack = () => {
    navigate(-1);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Файл загружен:', file.name);
      // Здесь можно добавить логику загрузки файла
    }
  };

  // Навигация на страницу с формой
  const handleGoToForm = () => {
    navigate(`//homework`);
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
        <h1 className="topic-title">Название темы</h1>
      </header>

      <div className="topic-content">
        <section className="description-section">
          <p className="topic-description">
            Описание темы. Здесь находится подробное описание текущей темы курса. 
            Текст может содержать любую информацию, необходимую для понимания материала.
          </p>
        </section>

        <section className="assignment-section">
          <h2 className="assignment-title">Задание</h2>
          
          {/* Простая загрузка файла */}
          <div className="upload-area">
            <input 
              type="file" 
              id="file-upload" 
              className="file-input"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload" className="upload-button">
              Загрузить задание
            </label>
            <p className="upload-hint">Нажмите для выбора файла</p>
          </div>

          {/* Кнопка для перехода к полной форме */}
          <div className="form-link-section">
            <button 
              className="form-link-button"
              onClick={handleGoToForm}
            >
              📝 Заполнить форму отправки задания
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TopicDetail;