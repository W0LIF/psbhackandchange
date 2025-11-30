import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './materials.css';

const MaterialsPage = ({ isAuthenticated, currentUser }) => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        setLoading(true);
        setError('');
        const url = selectedCourse 
          ? `/api/materials?courseId=${selectedCourse}` 
          : '/api/materials';
        const res = await fetch(url);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          setError(errorData?.error || `Ошибка ${res.status}: Не удалось загрузить материалы`);
          setMaterials([]);
          return;
        }
        
        const data = await res.json();
        
        if (!data) {
          setError('Получены пустые данные');
          setMaterials([]);
          return;
        }
        
        setMaterials(Array.isArray(data.materials) ? data.materials : []);
        if (data.courses && Array.isArray(data.courses)) {
          setCourses(data.courses);
        } else {
          setCourses([]);
        }
      } catch (e) {
        console.error('Materials loading error:', e);
        setError('Сервер недоступен, попробуйте позже');
        setMaterials([]);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, [selectedCourse]);

  const handleMaterialClick = (material) => {
    navigate('/topicNumber', {
      state: {
        topicId: material.id,
        courseId: material.courseId,
        title: material.topicTitle,
        description: material.topicDescription
      }
    });
  };

  return (
    <div className="materials-page">
      <div className="materials-container">
        <header className="materials-header">
          <h1 className="materials-title">Учебные материалы</h1>
          <p className="materials-subtitle">Лекции, презентации и дополнительные ресурсы по курсам</p>
        </header>

        {courses.length > 0 && (
          <div className="materials-filters">
            <button
              className={`filter-button ${selectedCourse === null ? 'active' : ''}`}
              onClick={() => setSelectedCourse(null)}
            >
              Все курсы
            </button>
            {courses.map(course => (
              <button
                key={course.id}
                className={`filter-button ${selectedCourse === course.id ? 'active' : ''}`}
                onClick={() => setSelectedCourse(course.id)}
              >
                {course.title}
              </button>
            ))}
          </div>
        )}

        {loading && <div className="materials-loading">Загрузка материалов...</div>}
        {error && (
          <div className="materials-error">
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => {
                setError('');
                setSelectedCourse(null);
              }}
            >
              Попробовать снова
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {materials.length === 0 ? (
              <div className="materials-empty">
                <p>Материалы не найдены</p>
                {selectedCourse && (
                  <button 
                    className="clear-filter-button"
                    onClick={() => setSelectedCourse(null)}
                  >
                    Показать все материалы
                  </button>
                )}
              </div>
            ) : (
              <div className="materials-list">
                {materials.map(material => (
                  <div
                    key={material.id}
                    className="material-card"
                    onClick={() => handleMaterialClick(material)}
                  >
                    <div className="material-card-header">
                      <div className="material-course-badge">{material.courseTitle || 'Без курса'}</div>
                      <h3 className="material-topic-title">{material.topicTitle || 'Без названия'}</h3>
                    </div>
                    <p className="material-description">{material.topicDescription || 'Описание отсутствует'}</p>
                    {material.content && (
                      <div className="material-preview">
                        {material.content.length > 150 
                          ? `${material.content.substring(0, 150)}...` 
                          : material.content}
                      </div>
                    )}
                    {material.materials && Array.isArray(material.materials) && material.materials.length > 0 && (
                      <div className="material-resources">
                        <span className="material-resources-count">
                          📚 {material.materials.length} {material.materials.length === 1 ? 'ресурс' : 'ресурсов'}
                        </span>
                      </div>
                    )}
                    <div className="material-action">
                      <span className="material-link">Открыть материал →</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MaterialsPage;
