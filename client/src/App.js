import React, { useState } from 'react';
import './App.css';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm'; // 👈 Import RegisterForm
import { FiLogOut } from 'react-icons/fi';

function App() {
  const [refresh, setRefresh] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [showRegister, setShowRegister] = useState(false); // 👈 Nouveau state

  const handleTaskAdded = () => setRefresh(prev => !prev);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return (
      <div className="auth-container">
        {showRegister ? (
          <>
            <RegisterForm onRegisterSuccess={() => setShowRegister(false)} />
            <div className="switch-auth">
              <span>Déjà un compte ? </span>
              <button onClick={() => setShowRegister(false)} className="link-btn">Se connecter</button>
            </div>
          </>
        ) : (
          <>
            <LoginForm onLogin={handleLogin} />
            <div className="switch-auth">
              <span>Pas encore inscrit ? </span>
              <button onClick={() => setShowRegister(true)} className="link-btn">S'inscrire</button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>Gestionnaire de Tâches</h1>
        <button className="icon-btn logout-icon" onClick={handleLogout} title="Déconnexion">
          <FiLogOut />
        </button>
      </div>
      <TaskForm onTaskAdded={handleTaskAdded} />
      <TaskList key={refresh} />
    </div>
  );
}

export default App;
