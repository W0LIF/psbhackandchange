import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './search.css';

const SearchPage = ({ isAuthenticated, currentUser }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState({ courses: [], topics: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults({ courses: [], topics: [] });
      return;
    }

    const search = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json().catch(() => ({}));
        
        if (!res.ok) {
          setError(data?.error || 'Ошибка поиска');
          return;
        }
        
        setResults({
          courses: Array.isArray(data.courses) ? data.courses : [],
          topics: Array.isArray(data.topics) ? data.topics : []
        });
      } catch (e) {
        setError('Сервер недоступен, попробуйте позже');
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [query]);

  const handleCourseClick = (courseId) => {
    navigate('/topic', { state: { courseId } });
  };

  const handleTopicClick = (topic) => {
    navigate('/topicNumber', {
      state: {
        topicId: topic.id,
        courseId: topic.courseId,
        title: topic.title,
        description: topic.description
      }
    });
  };

  return (
    <div className="search-page">
      <div className="search-container-page">
        <header className="search-header">
          <h1 className="search-title">Результаты поиска</h1>
          {query && (
            <p className="search-query">По запросу: "<strong>{query}</strong>"</p>
          )}
        </header>

        {loading && <div className="search-loading">Поиск...</div>}
        {error && <div className="search-error">{error}</div>}

        {!loading && !error && (
          <>
            {!query.trim() ? (
              <div className="search-empty">
                <p>Введите запрос для поиска</p>
              </div>
            ) : (
              <>
                {results.courses.length === 0 && results.topics.length === 0 ? (
                  <div className="search-empty">
                    <p>Ничего не найдено по запросу "{query}"</p>
                  </div>
                ) : (
                  <>
                    {results.courses.length > 0 && (
                      <section className="search-section">
                        <h2 className="search-section-title">Курсы ({results.courses.length})</h2>
                        <div className="search-results-grid">
                          {results.courses.map(course => (
                            <div
                              key={course.id}
                              className="search-result-card course-card"
                              onClick={() => handleCourseClick(course.id)}
                            >
                              <h3 className="result-title">{course.title}</h3>
                              <p className="result-description">{course.description}</p>
                              <div className="result-meta">
                                <span className="result-type">Курс</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {results.topics.length > 0 && (
                      <section className="search-section">
                        <h2 className="search-section-title">Темы и материалы ({results.topics.length})</h2>
                        <div className="search-results-grid">
                          {results.topics.map(topic => (
                            <div
                              key={topic.id}
                              className="search-result-card topic-card"
                              onClick={() => handleTopicClick(topic)}
                            >
                              <h3 className="result-title">{topic.title}</h3>
                              <p className="result-description">{topic.description}</p>
                              <div className="result-meta">
                                <span className="result-course">{topic.courseTitle}</span>
                                <span className="result-type">Тема</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;

