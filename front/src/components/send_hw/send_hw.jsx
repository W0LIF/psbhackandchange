import React from 'react';
import './send_hw.css';

const Home_work = () => {
  const [formData, setFormData] = useState({
    lastName: '',
    firstName: '',
    email: '',
    taskDescription: '',
    file: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      file: e.target.files[0]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Данные формы:', formData);
    // Здесь будет логика отправки данных
    alert('Задание отправлено!');
  };

  return (
    <div className="submission-container">
      <div className="submission-card">
        <h1 className="submission-title">Отправка выполненного задания</h1>
        
        <form onSubmit={handleSubmit} className="submission-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="lastName">Фамилия</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="firstName">Имя</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="taskDescription">Описание задания</label>
            <textarea
              id="taskDescription"
              name="taskDescription"
              value={formData.taskDescription}
              onChange={handleInputChange}
              rows="4"
              placeholder="Опишите ваше задание..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="fileUpload" className="file-label">
              Загрузите свое выполненное задание
            </label>
            <input
              type="file"
              id="fileUpload"
              onChange={handleFileChange}
              className="file-input"
              required
            />
            {formData.file && (
              <div className="file-info">
                Выбран файл: {formData.file.name}
              </div>
            )}
          </div>

          <button type="submit" className="submit-button">
            Отправить задание
          </button>
        </form>
      </div>
    </div>
  );
};

export default Home_work;