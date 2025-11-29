import React from 'react'
import Header from '../../components/Header/Header.jsx'
import Course from '../../components/course/course.jsx'
import './page.css'

const HomePage = () => {
  return (
    <div className="home-page">
      <Header/>
      <section className="hero">
        <h1>Учебная платформа</h1>
      </section>
      <Course isAuthenticated={false} />
    </div>
  )
}

export default HomePage