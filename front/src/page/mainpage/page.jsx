import React from 'react';
import Course from '../../components/course/course.jsx';
import StatsWidget from '../../components/StatsWidget/StatsWidget.jsx';
import './page.css';

const HomePage = ({ isAuthenticated, currentUser }) => {
  return (
    <div className="home-page">
      <section className="hero">
        <h1>Учебная платформа</h1>
        <p>Добро пожаловать на главную страницу</p>
      </section>
      
      {isAuthenticated && (
        <div className="home-content">
          <StatsWidget isAuthenticated={isAuthenticated} currentUser={currentUser} />
        </div>
      )}
      
      <Course isAuthenticated={isAuthenticated} currentUser={currentUser} />
    </div>
  );
};

export default HomePage;