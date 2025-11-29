// src/components/CourseDetail.jsx
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './name_corse.css';

const CourseDetail = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();

  const topics = [
    { id: 1, title: "Тема 1", description: "Краткое описание" },
    { id: 2, title: "Тема 2", description: "Краткое описание" },
    { id: 3, title: "Тема 3", description: "Краткое описание" },
    { id: 4, title: "Тема 4", description: "Краткое описание" }
  ];

  const handleBack = () => {
    navigate(-1);
  };

  const handleTopicClick = (topicId) => {
    navigate(`/topicNumber`);
  };

  return (
    <div className="name-course-container">
      <header className="name-course-header">
        <div className="header-content">
          <button 
            className="back-button"
            onClick={handleBack}
          >
            ← Назад
          </button>
          <h1 className="name-course-title">Название курса</h1>
          {/* Пустой элемент для балансировки */}
          <div className="header-spacer"></div>
        </div>
      </header>
      
      <div className="topics-list">
        {topics.map(topic => (
          <div key={topic.id} className="topic-item">
            <div className="topic-content">
              <h3 className="topic-title">{topic.title}</h3>
              <p className="topic-description">{topic.description}</p>
            </div>
            <button 
              className="topic-button"
              onClick={() => handleTopicClick(topic.id)}
            >
              Перейти
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDetail;