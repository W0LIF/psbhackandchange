import React from 'react';
import './ProfilePage.css';

const ProfilePage = () => {
  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Профиль</h1>
        </div>
        
        <div className="profile-content">
          <div className="profile-info">
            <div className="info-section">
              <h2>Основная информация</h2>
              <div className="info-field">
                <label>ФИО</label>
                <div className="field-value">Иванов Иван Иванович</div>
              </div>
              <div className="info-field">
                <label>Возраст:</label>
                <div className="field-value">28</div>
              </div>
              <div className="info-field">
                <label>Проживание:</label>
                <div className="field-value">Москва</div>
              </div>
              <div className="info-field">
                <label>Email:</label>
                <div className="field-value">ivanov@example.com</div>
              </div>
            </div>

            <div className="info-section">
              <h2>Мои курсы</h2>
              <div className="field-value">
                Веб-разработка, JavaScript, React, TypeScript
              </div>
            </div>

            <div className="info-section">
              <h2>О себе:</h2>
              <div className="about-text">
                Веб-разработчик с опытом создания адаптивных сайтов и одностраничных приложений на JavaScript и React. Владею HTML, CSS и TypeScript. Хочу развиваться в создании сложных пользовательских интерфейсов
              </div>
            </div>
          </div>

          <div className="completed-tasks">
            <h2>Выполненные задания</h2>
            <div className="tasks-list">
              <div className="task-item">
                <div className="task-title">Задание 1: Верстка лендинга</div>
                <div className="task-status">Выполнено</div>
              </div>
              <div className="task-item">
                <div className="task-title">Задание 2: React компоненты</div>
                <div className="task-status">Выполнено</div>
              </div>
              <div className="task-item">
                <div className="task-title">Задание 3: TypeScript типы</div>
                <div className="task-status">В процессе</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;