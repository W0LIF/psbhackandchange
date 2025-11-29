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
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(data?.error || 'Не удалось загрузить материалы');
          return;
        }
        setMaterials(Array.isArray(data.materials) ? data.materials : []);
        if (data.courses) {
          setCourses(Array.isArray(data.courses) ? data.courses : []);
        }
      } catch (e) {
        setError('Сервер недоступен, попробуйте позже');
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
        {error && <div className="materials-error">{error}</div>}

        {!loading && !error && (
          <>
            {materials.length === 0 ? (
              <div className="materials-empty">
                <p>Материалы не найдены</p>
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
                      <div className="material-course-badge">{material.courseTitle}</div>
                      <h3 className="material-topic-title">{material.topicTitle}</h3>
                    </div>
                    <p className="material-description">{material.topicDescription}</p>
                    {material.content && (
                      <div className="material-preview">
                        {material.content.substring(0, 150)}...
                      </div>
                    )}
                    {material.materials && material.materials.length > 0 && (
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
