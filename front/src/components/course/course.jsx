import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './course.css';

const Course = ({ isAuthenticated = true, currentUser }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setCourses([]);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const email = currentUser?.email;
        const url = email ? `/api/courses?email=${encodeURIComponent(email)}` : '/api/courses';
        const res = await fetch(url);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error || 'Не удалось загрузить курсы');
          setCourses([]);
          return;
        }
        setCourses(Array.isArray(data.courses) ? data.courses : []);
      } catch (e) {
        setError('Сервер недоступен, попробуйте позже');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, currentUser]);

  const handleCourseClick = (courseId) => {
    navigate('/topic', { state: { courseId } });
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
          {loading && <div className="loading">Загрузка курсов...</div>}
          
          {error && <div className="error-message">{error}</div>}
          
          {!loading && !error && (
            <div className="courses-container">
              {courses.length === 0 ? (
                <div className="no-courses">Курсы не найдены</div>
              ) : (
                courses.map(course => (
                  <div key={course.id} className="course-item">
                    <div className="course-header">
                      <h2 className="course-title">{course.title}</h2>
                      <p className="course-description">{course.description}</p>
                    </div>
                    
                    <div className="course-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${course.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="progress-percentage">{course.progress || 0}%</span>
                    </div>
                    
                    <button 
                      className="course-button"
                      onClick={() => handleCourseClick(course.id)}
                    >
                      Перейти →
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Course;