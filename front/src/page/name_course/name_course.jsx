// src/components/CourseDetail.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './name_corse.css';

const CourseDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const courseId = location.state?.courseId || 1;

  const [topics, setTopics] = useState([]);
  const [courseTitle, setCourseTitle] = useState('Название курса');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/courses/${courseId}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error || 'Не удалось загрузить курс');
          setTopics([]);
          return;
        }
        setCourseTitle(data.course?.title || 'Название курса');
        setTopics(Array.isArray(data.topics) ? data.topics : []);
      } catch (e) {
        setError('Сервер недоступен, попробуйте позже');
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleTopicClick = (topic) => {
    navigate(`/topicNumber`, { state: { topicId: topic.id, courseId, title: topic.title, description: topic.description } });
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
          <h1 className="name-course-title">{courseTitle}</h1>
          {/* Пустой элемент для балансировки */}
          <div className="header-spacer"></div>
        </div>
      </header>
      
      <div className="topics-list">
        {loading && <div className="topics-loading">Загрузка тем...</div>}
        {error && <div className="topics-error">{error}</div>}
        {!loading && !error && topics.map(topic => (
          <div key={topic.id} className="topic-item">
            <div className="topic-content">
              <h3 className="topic-title">{topic.title}</h3>
              <p className="topic-description">{topic.description}</p>
            </div>
          <button 
              className="topic-button"
              onClick={() => handleTopicClick(topic)}
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