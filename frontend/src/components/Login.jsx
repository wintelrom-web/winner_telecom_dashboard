import React, { useState } from 'react';
import { Lock, User } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check credentials
    if (credentials.username === 'WINTEL' && credentials.password === 'WINNER@2021') {
      onLogin(true);
    } else {
      setError('Nom d\'utilisateur ou mot de passe incorrect');
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-circle">
              <span>WT</span>
            </div>
          </div>
          <h1>WINNER TELECOM</h1>
          <p className="login-subtitle">Connexion à votre espace</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">Nom d'utilisateur</label>
            <div className="input-group">
              <User size={20} className="input-icon" />
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                placeholder="Entrez votre nom d'utilisateur"
                className="login-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <div className="input-group">
              <Lock size={20} className="input-icon" />
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                placeholder="Entrez votre mot de passe"
                className="login-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-btn"
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Connexion en cours...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Système de gestion des clients Winner Telecom</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
