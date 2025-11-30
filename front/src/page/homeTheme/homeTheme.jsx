// src/components/TopicDetail.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './homeTheme.css';

const TopicDetail = ({ isAuthenticated, currentUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseId, topicId, title, description } = location.state || {};
  const [topicData, setTopicData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (topicId) {
      const loadTopic = async () => {
        try {
          setLoading(true);
          setError('');
          const res = await fetch(`/api/topics/${topicId}`);
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setError(data?.error || 'Не удалось загрузить тему');
            return;
          }
          setTopicData(data);
        } catch (e) {
          setError('Сервер недоступен, попробуйте позже');
        } finally {
          setLoading(false);
        }
      };
      loadTopic();
    }
  }, [topicId]);

  const handleBack = () => {
    navigate(-1);
  };

  // Навигация на страницу с формой
  const handleGoToForm = () => {
    if (!isAuthenticated) {
      // Можно показать модальное окно авторизации или перенаправить
      alert('Для отправки задания необходимо войти в аккаунт');
      return;
    }
    navigate('/homework', { state: { courseId, topicId, title } });
  };

  const displayTitle = topicData?.title || title || 'Название темы';
  const displayDescription = topicData?.description || description || 'Описание темы. Здесь находится подробное описание текущей темы курса.';
  const displayContent = topicData?.content || '';

  return (
    <div className="topic-detail-container">
      <header className="topic-header">
        <button 
          className="back-button"
          onClick={handleBack}
        >
          ← Назад
        </button>
        <h1 className="topic-title">{displayTitle}</h1>
      </header>

      <div className="topic-content">
        {loading && <div className="topic-loading">Загрузка материалов...</div>}
        {error && <div className="topic-error">{error}</div>}
        
        <section className="description-section">
          <h2>Описание темы</h2>
          <p className="topic-description">
            {displayDescription}
          </p>
        </section>

        {displayContent && (
          <section className="materials-section">
            <h2>Материалы темы</h2>
            <div className="material-content">
              <p>{displayContent}</p>
              {topicData?.materials && topicData.materials.length > 0 && (
                <div className="materials-list">
                  {topicData.materials.map((material, idx) => (
                    <div key={idx} className="material-item">
                      {material.type === 'text' && (
                        <div className="material-text">{material.content}</div>
                      )}
                      {material.type === 'video' && (
                        <div className="material-video">
                          <iframe 
                            src={material.url} 
                            title={material.title || `Видео ${idx + 1}`}
                            allowFullScreen
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="assignment-section">
          <h2 className="assignment-title">Задание</h2>
          <p className="assignment-description">
            Изучите материалы темы и выполните задание. {isAuthenticated ? 'Вы можете загрузить выполненное задание через форму ниже.' : 'Для отправки задания необходимо войти в аккаунт.'}
          </p>

          {/* Кнопка для перехода к полной форме - только для авторизованных */}
          {isAuthenticated && (
            <div className="form-link-section">
              <button 
                className="form-link-button"
                onClick={handleGoToForm}
              >
                📝 Отправить выполненное задание
              </button>
            </div>
          )}
          
          {!isAuthenticated && (
            <div className="form-link-section">
              <p className="auth-required-message">
                ⚠️ Для отправки задания необходимо войти в аккаунт
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TopicDetail;