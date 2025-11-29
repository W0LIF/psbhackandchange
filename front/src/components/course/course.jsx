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

  // Добавляем данные курсов
  const courses = [
    { id: 1, title: "Курс 1", progress: 75 },
    { id: 2, title: "Курс 2", progress: 50 },
    { id: 3, title: "Курс 3", progress: 25 }
  ];

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

  // Добавляем функцию для клика по курсу
  const handleCourseClick = (courseId) => {
    console.log('Переход к курсу:', courseId);
    // Здесь можно добавить навигацию
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
          <div className="courses-list">
            {courses.map(course => (
              <div key={course.id} className="course-item">
                <div className="course-header">
                  <h2 className="course-title">{course.title}</h2>
                </div>
                
                <div className="course-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-percentage">{course.progress}%</span>
                </div>
                
                <button 
                  className="course-button"
                  onClick={() => handleCourseClick(course.id)}
                >
                  Перейти →
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Course;