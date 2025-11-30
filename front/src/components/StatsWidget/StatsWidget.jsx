import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './StatsWidget.css';

const StatsWidget = ({ isAuthenticated, currentUser }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalHomeworks: 0,
    gradedHomeworks: 0,
    averageGrade: 0,
    upcomingDeadlines: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !currentUser?.email) {
      return;
    }

    const loadStats = async () => {
      try {
        setLoading(true);
        const email = currentUser.email;

        // Загружаем курсы
        const coursesRes = await fetch(`/api/courses?email=${encodeURIComponent(email)}`);
        const coursesData = await coursesRes.json().catch(() => ({}));
        const courses = Array.isArray(coursesData.courses) ? coursesData.courses : [];
        
        // Загружаем домашние задания
        const hwRes = await fetch(`/api/homeworks?email=${encodeURIComponent(email)}`);
        const hwData = await hwRes.json().catch(() => ({}));
        const homeworks = Array.isArray(hwData.homeworks) ? hwData.homeworks : [];

        // Загружаем оценки
        const gradesRes = await fetch(`/api/students/${encodeURIComponent(email)}/grades`);
        const gradesData = await gradesRes.json().catch(() => ({}));

        // Загружаем расписание для подсчета дедлайнов
        const scheduleRes = await fetch(`/api/schedule?email=${encodeURIComponent(email)}`);
        const scheduleData = await scheduleRes.json().catch(() => ({}));
        const schedule = Array.isArray(scheduleData.schedule) ? scheduleData.schedule : [];

        // Вычисляем статистику
        const completedCourses = courses.filter(c => c.progress === 100).length;
        const gradedHomeworks = homeworks.filter(hw => hw.grade != null).length;
        const averageGrade = gradesData.overallAverage || 0;
        const upcomingDeadlines = schedule.filter(item => 
          !item.isCompleted && item.daysRemaining >= 0 && item.daysRemaining <= 7
        ).length;

        setStats({
          totalCourses: courses.length,
          completedCourses,
          totalHomeworks: homeworks.length,
          gradedHomeworks,
          averageGrade,
          upcomingDeadlines
        });
      } catch (e) {
        console.error('Stats loading error:', e);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [isAuthenticated, currentUser]);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="stats-widget">
        <div className="stats-loading">Загрузка статистики...</div>
      </div>
    );
  }

  return (
    <div className="stats-widget">
      <div className="stats-header">
        <h2 className="stats-title">📊 Ваша статистика</h2>
        <button 
          className="stats-view-all"
          onClick={() => navigate('/profile')}
        >
          Подробнее →
        </button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCourses}</div>
            <div className="stat-label">Курсов</div>
            {stats.totalCourses > 0 && (
              <div className="stat-sublabel">
                {stats.completedCourses} завершено
              </div>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalHomeworks}</div>
            <div className="stat-label">Заданий отправлено</div>
            {stats.totalHomeworks > 0 && (
              <div className="stat-sublabel">
                {stats.gradedHomeworks} проверено
              </div>
            )}
          </div>
        </div>

        <div className="stat-card stat-card-highlight">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-value">{stats.averageGrade.toFixed(1)}</div>
            <div className="stat-label">Средний балл</div>
            {stats.averageGrade > 0 && (
              <div className="stat-sublabel">
                {stats.gradedHomeworks > 0 ? 'Отличная работа!' : 'Продолжайте в том же духе!'}
              </div>
            )}
          </div>
        </div>

        <div className="stat-card stat-card-urgent">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-value">{stats.upcomingDeadlines}</div>
            <div className="stat-label">Дедлайнов на неделе</div>
            {stats.upcomingDeadlines > 0 && (
              <div className="stat-sublabel">
                Не забудьте выполнить!
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="stats-actions">
        <button 
          className="stats-action-button"
          onClick={() => navigate('/schedule')}
        >
          📅 Расписание
        </button>
        <button 
          className="stats-action-button"
          onClick={() => navigate('/grades')}
        >
          📊 Журнал оценок
        </button>
      </div>
    </div>
  );
};

export default StatsWidget;

