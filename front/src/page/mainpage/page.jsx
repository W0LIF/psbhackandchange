import React from 'react';
import Course from '../../components/course/course.jsx';
import './page.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <h1>Учебная платформа</h1>
        <p>Добро пожаловать на главную страницу</p>
      </section>
      <Course isAuthenticated={false} />
    </div>
  );
};

export default HomePage;