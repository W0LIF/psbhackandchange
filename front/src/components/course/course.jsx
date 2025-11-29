import React, { useState } from 'react';
import './course.css';

const Course = ({ isAuthenticated = true }) => {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    email: '',
    taskDescription: '',
    file: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Данные формы:', formData);
    alert('Задание отправлено!');
  };

  return (
    <div className="platform-content">
      {!isAuthenticated ? (
        // Контент для неавторизованного пользователя
        <section className="platform-features">
          <h2>Что вы найдете на платформе</h2>
          <div className="features-grid">
            <div className="feature-item">
              <h3>Курсы</h3>
              <p>Интерактивные курсы и видеоуроки</p>
            </div>
            <div className="feature-item">
              <h3>Кейс-стадии</h3>
              <p>Терекиссия и кейс-стадия</p>
            </div>
            <div className="feature-item">
              <h3>Вебинары</h3>
              <p>Вебинары от экспертов</p>
            </div>
            <div className="feature-item">
              <h3>Обратная связь</h3>
              <p>Общение и обмен опытом на форуме</p>
            </div>
            <div className="feature-item">
              <h3>Награда</h3>
              <p>Персональный прогресс и сертификаты</p>
            </div>
          </div>
        </section>
      ) : (
        // Контент для авторизованного пользователя
        <>
          <section className="my-courses">
            <h2>Мои курсы</h2>
            <div className="courses-grid">
              <div className="course-card">
                <h3>Курс 1</h3>
                <div className="course-progress">75%</div>
                <button className="course-button">Перейти</button>
              </div>
              <div className="course-card">
                <h3>Курс 2</h3>
                <div className="course-progress">45%</div>
                <button className="course-button">Перейти</button>
              </div>
              <div className="course-card">
                <h3>Курс 3</h3>
                <div className="course-progress">20%</div>
                <button className="course-button">Перейти</button>
              </div>
            </div>
          </section>

          {/* Форма отправки задания */}
          <section className="homework-section">
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
                    {formData.file && (
                      <div className="file-info">
                        Выбран файл: {formData.file.name}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="submit-button">
                    Отправить задание
                  </button>
                </form>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Course;