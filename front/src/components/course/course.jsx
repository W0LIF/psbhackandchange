import React from 'react';
import './course.css';

const Course = ({ isAuthenticated = false }) => {
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
      )}
    </div>
  );
};

export default Course;