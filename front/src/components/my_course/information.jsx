// src/components/Courses.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './information.css';

const Courses = () => {
  const navigate = useNavigate();
  const courses = [
    { id: 1, title: "Курс 1", progress: 75 },
    { id: 2, title: "Курс 2", progress: 50 },
    { id: 3, title: "Курс 3", progress: 25 }
  ];

  const handleBack = () => {
    navigate(-1);
  };

  const handleCourseClick = (courseId) => {
    navigate(`/topic`);
  };

  return (
    <div className="courses-container">
      <header className="courses-header">
        <button 
          className="back-button"
          onClick={handleBack}
        >
          ← Назад
        </button>
        <h1 className="courses-title">Мои курсы</h1>
      </header>
      
      <div className="courses-list">
        {courses.map(course => (
          <div key={course.id} className="course-item">
            <div className="course-header">
              <h2 className="course-title">{course.title}</h2>
            </div>
            
            <div className="course-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <span className="progress-percentage">{course.progress}%</span>
            </div>
            
            <button 
              className="course-button"
              onClick={() => handleCourseClick(course.id)}
            >
              Перейти →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;