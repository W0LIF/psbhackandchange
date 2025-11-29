import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './profile.css';

const ProfilePage = ({ isAuthenticated, currentUser }) => {
  const navigate = useNavigate();
  const [homeworks, setHomeworks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [gradesData, setGradesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const email = currentUser && currentUser.email;
    if (!isAuthenticated || !email) {
      setHomeworks([]);
      setCourses([]);
      setGradesData(null);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Загружаем домашние задания
        const hwRes = await fetch(`/api/homeworks?email=${encodeURIComponent(email)}`);
        const hwData = await hwRes.json().catch(() => ({}));
        if (hwRes.ok) {
          setHomeworks(Array.isArray(hwData.homeworks) ? hwData.homeworks : []);
        }

        // Загружаем курсы с прогрессом
        const coursesRes = await fetch(`/api/courses?email=${encodeURIComponent(email)}`);
        const coursesData = await coursesRes.json().catch(() => ({}));
        if (coursesRes.ok) {
          setCourses(Array.isArray(coursesData.courses) ? coursesData.courses : []);
        }

        // Загружаем статистику успеваемости
        const gradesRes = await fetch(`/api/students/${encodeURIComponent(email)}/grades`);
        const gradesData = await gradesRes.json().catch(() => ({}));
        if (gradesRes.ok) {
          setGradesData(gradesData);
        }
      } catch (e) {
        setError('Сервер недоступен, попробуйте позже');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isAuthenticated, currentUser]);

  const displayEmail = currentUser?.email || 'ivanov@example.com';

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Профиль пользователя</h1>
          <Link to="/" className="back-link">
            ← На главную
          </Link>
        </div>
        
        <div className="profile-content">
          <div className="profile-info">
            <div className="info-section">
              <h2>Основная информация</h2>
              <div className="info-field">
                <label>ФИО</label>
                <div className="field-value">{currentUser?.fullName || 'Иванов Иван Иванович'}</div>
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
                <div className="field-value">{displayEmail}</div>
              </div>
            </div>

            <div className="info-section">
              <h2>Мои курсы</h2>
              {courses.length > 0 ? (
                <div className="courses-progress-list">
                  {courses.map(course => (
                    <div key={course.id} className="course-progress-item">
                      <div className="course-progress-header">
                        <span className="course-name">{course.title}</span>
                        <span className="course-progress-value">{course.progress || 0}%</span>
                      </div>
                      <div className="course-progress-bar">
                        <div 
                          className="course-progress-fill"
                          style={{ width: `${course.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="field-value">Нет активных курсов</div>
              )}
            </div>

            {gradesData && (
              <div className="info-section">
                <h2>Статистика успеваемости</h2>
                <div className="grades-summary">
                  <div className="summary-item">
                    <div className="summary-label">Средний балл</div>
                    <div className="summary-value">{gradesData.overallAverage || 0}</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-label">Проверено заданий</div>
                    <div className="summary-value">{gradesData.totalGraded || 0}</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-label">Всего отправлено</div>
                    <div className="summary-value">{gradesData.totalSubmitted || 0}</div>
                  </div>
                </div>
                <Link to="/grades" className="grades-link">
                  Подробный журнал успеваемости →
                </Link>
              </div>
            )}

            {gradesData && gradesData.courses && gradesData.courses.length > 0 && (
              <div className="info-section">
                <h2>Журнал успеваемости по курсам</h2>
                <div className="courses-grades-list">
                  {gradesData.courses.map(course => (
                    <div key={course.courseId} className="course-grade-item">
                      <div className="course-grade-header">
                        <h3 className="course-grade-title">{course.courseTitle}</h3>
                        <div className="course-grade-average">
                          Средний балл: <strong>{course.averageGrade || 0}</strong>
                        </div>
                      </div>
                      <div className="course-grade-stats">
                        <span className="course-grade-stat">
                          Проверено: {course.totalGraded || 0}
                        </span>
                      </div>
                      {Object.keys(course.topics).length > 0 && (
                        <div className="course-topics-grades">
                          {Object.values(course.topics).map(topic => (
                            <div key={topic.topicId} className="topic-grade-mini">
                              <div className="topic-grade-mini-header">
                                <span className="topic-grade-mini-title">{topic.topicTitle}</span>
                                {topic.averageGrade > 0 && (
                                  <span className="topic-grade-mini-average">
                                    {topic.averageGrade}
                                  </span>
                                )}
                              </div>
                              {topic.grades && topic.grades.length > 0 && (
                                <div className="topic-grade-mini-grades">
                                  {topic.grades.map((grade, idx) => (
                                    <span key={idx} className="grade-badge">
                                      v{grade.version}: {grade.grade}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <Link to="/grades" className="grades-link">
                  Подробный журнал успеваемости →
                </Link>
              </div>
            )}

            <div className="info-section">
              <h2>О себе:</h2>
              <div className="about-text">
                Веб-разработчик с опытом создания адаптивных сайтов и одностраничных приложений на JavaScript и React. Владею HTML, CSS и TypeScript. Хочу развиваться в создании сложных пользовательских интерфейсов
              </div>
            </div>
          </div>

          <div className="completed-tasks">
            <h2>Мои задания</h2>
            {loading && <div className="tasks-loading">Загрузка...</div>}
            {error && <div className="tasks-error">{error}</div>}
            {!loading && !error && homeworks.length === 0 && (
              <div className="tasks-empty">Вы ещё не отправляли заданий.</div>
            )}
            {!loading && !error && homeworks.length > 0 && (
              <div className="tasks-list">
                {homeworks.map(hw => (
                  <div key={hw.id} className="task-item">
                    <div className="task-title">
                      {hw.task_description || `Домашка от ${new Date(hw.created_at).toLocaleString()}`}
                    </div>
                    {(hw.courseTitle || hw.topicTitle) && (
                      <div className="task-meta">
                        {hw.courseTitle && <span className="task-course">Курс: {hw.courseTitle}</span>}
                        {hw.topicTitle && <span className="task-topic">Тема: {hw.topicTitle}</span>}
                        {hw.version && hw.version > 1 && (
                          <span className="task-version">Версия {hw.version}</span>
                        )}
                      </div>
                    )}
                    <div className={`task-status ${hw.grade != null ? 'completed' : 'in-progress'}`}>
                      {hw.grade != null ? `Оценка: ${hw.grade}` : 'Ожидает проверки'}
                    </div>
                    {hw.comment && (
                      <div className="task-comment">Комментарий преподавателя: {hw.comment}</div>
                    )}
                    <div className="task-date">
                      Отправлено: {new Date(hw.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;