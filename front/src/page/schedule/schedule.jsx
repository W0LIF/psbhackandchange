import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './schedule.css';

const SchedulePage = ({ isAuthenticated, currentUser }) => {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !currentUser?.email) {
      return;
    }

    const loadSchedule = async () => {
      try {
        setLoading(true);
        setError('');
        const email = currentUser.email;
        const res = await fetch(`/api/schedule?email=${encodeURIComponent(email)}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error || 'Не удалось загрузить расписание');
          return;
        }
        setSchedule(Array.isArray(data.schedule) ? data.schedule : []);
      } catch (e) {
        setError('Сервер недоступен, попробуйте позже');
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [isAuthenticated, currentUser]);

  const handleTopicClick = (item) => {
    navigate('/topicNumber', { 
      state: { 
        topicId: item.id, 
        courseId: item.courseId, 
        title: item.topicTitle, 
        description: item.topicDescription 
      } 
    });
  };

  const getStatusClass = (item) => {
    if (item.isCompleted) return 'status-completed';
    if (item.isSubmitted) return 'status-submitted';
    if (item.daysRemaining < 0) return 'status-overdue';
    if (item.daysRemaining <= 3) return 'status-urgent';
    return 'status-pending';
  };

  const getStatusText = (item) => {
    if (item.isCompleted) return `✓ Выполнено (оценка: ${item.grade})`;
    if (item.isSubmitted) return '⏳ Ожидает проверки';
    if (item.daysRemaining < 0) return `⚠ Просрочено на ${Math.abs(item.daysRemaining)} дн.`;
    if (item.daysRemaining === 0) return '⚠ Срок сдачи сегодня';
    if (item.daysRemaining === 1) return '⚠ Срок сдачи завтра';
    return `Осталось ${item.daysRemaining} дн.`;
  };

  return (
    <div className="schedule-page">
      <div className="schedule-container">
        <header className="schedule-header">
          <h1 className="schedule-title">Расписание дедлайнов</h1>
          {!isAuthenticated && (
            <p className="schedule-subtitle">Войдите в систему, чтобы увидеть ваше расписание</p>
          )}
        </header>

        {loading && <div className="schedule-loading">Загрузка расписания...</div>}
        {error && <div className="schedule-error">{error}</div>}

        {!loading && !error && isAuthenticated && (
          <>
            {schedule.length === 0 ? (
              <div className="schedule-empty">
                <p>Нет активных дедлайнов</p>
              </div>
            ) : (
              <div className="schedule-list">
                {schedule.map(item => (
                  <div 
                    key={item.id} 
                    className={`schedule-item ${getStatusClass(item)}`}
                    onClick={() => handleTopicClick(item)}
                  >
                    <div className="schedule-item-header">
                      <div className="schedule-item-title">
                        <h3>{item.topicTitle}</h3>
                        <span className="schedule-course">{item.courseTitle}</span>
                      </div>
                      <div className={`schedule-status ${getStatusClass(item)}`}>
                        {getStatusText(item)}
                      </div>
                    </div>
                    
                    <div className="schedule-item-body">
                      <p className="schedule-description">{item.topicDescription}</p>
                      <div className="schedule-meta">
                        <span className="schedule-deadline">
                          📅 Дедлайн: {item.deadlineFormatted}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!isAuthenticated && (
          <div className="schedule-placeholder">
            <p>Войдите в систему, чтобы увидеть ваше расписание дедлайнов</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
