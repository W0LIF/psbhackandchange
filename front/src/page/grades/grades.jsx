// src/page/grades/grades.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './grades.css';

const GradesPage = ({ isAuthenticated, currentUser }) => {
  const navigate = useNavigate();
  const [gradesData, setGradesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !currentUser?.email) {
      navigate('/');
      return;
    }

    const loadGrades = async () => {
      try {
        setLoading(true);
        setError('');
        const email = currentUser.email;
        const res = await fetch(`/api/students/${encodeURIComponent(email)}/grades`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error || 'Не удалось загрузить журнал успеваемости');
          return;
        }
        setGradesData(data);
      } catch (e) {
        setError('Сервер недоступен, попробуйте позже');
      } finally {
        setLoading(false);
      }
    };

    loadGrades();
  }, [isAuthenticated, currentUser, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="grades-page">
      <header className="grades-header">
        <button className="back-button" onClick={handleBack}>
          ← Назад
        </button>
        <h1 className="grades-title">Журнал успеваемости</h1>
      </header>

      <div className="grades-content">
        {loading && <div className="grades-loading">Загрузка данных...</div>}
        {error && <div className="grades-error">{error}</div>}
        
        {!loading && !error && gradesData && (
          <>
            <div className="grades-summary">
              <div className="summary-card">
                <h2>Общая статистика</h2>
                <div className="summary-stats">
                  <div className="stat-item">
                    <div className="stat-label">Средний балл</div>
                    <div className="stat-value">{gradesData.overallAverage || 0}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Проверено заданий</div>
                    <div className="stat-value">{gradesData.totalGraded || 0}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Всего отправлено</div>
                    <div className="stat-value">{gradesData.totalSubmitted || 0}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="courses-grades">
              <h2>Оценки по курсам</h2>
              {gradesData.courses && gradesData.courses.length > 0 ? (
                gradesData.courses.map(course => (
                  <div key={course.courseId} className="course-grades-card">
                    <div className="course-grades-header">
                      <h3>{course.courseTitle}</h3>
                      <div className="course-average">
                        Средний балл: <strong>{course.averageGrade || 0}</strong>
                      </div>
                    </div>
                    
                    {Object.keys(course.topics).length > 0 ? (
                      <div className="topics-grades">
                        {Object.values(course.topics).map(topic => (
                          <div key={topic.topicId} className="topic-grades-item">
                            <div className="topic-grades-header">
                              <h4>{topic.topicTitle}</h4>
                              <span className="topic-average">
                                Средний: {topic.averageGrade || 0}
                              </span>
                            </div>
                            
                            {topic.grades && topic.grades.length > 0 ? (
                              <div className="grades-list">
                                {topic.grades.map((grade, idx) => (
                                  <div key={idx} className="grade-item">
                                    <div className="grade-info">
                                      <span className="grade-version">
                                        Версия {grade.version}
                                      </span>
                                      <span className="grade-value">
                                        Оценка: <strong>{grade.grade}</strong>
                                      </span>
                                      <span className="grade-date">
                                        {new Date(grade.feedbackCreatedAt || grade.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    {grade.comment && (
                                      <div className="grade-comment">
                                        Комментарий: {grade.comment}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="no-grades">Нет оценок</div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="no-topics">Нет данных по темам</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-courses">Нет данных по курсам</div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GradesPage;

