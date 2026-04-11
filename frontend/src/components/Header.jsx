import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';

const Header = ({ onLogout }) => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo-container">
            <div className="logo">
              <span>WT</span>
            </div>
            <h1 className="company-name">WINNER TELECOM</h1>
            <span className="subtitle">GESTION CLIENTS</span>
          </div>
          
          <div className="user-section">
            <div className="user-info">
              <div className="user-avatar">
                <User size={16} />
              </div>
              <span>Admin</span>
            </div>
            <div className="header-actions">
              <button className="menu-button">
                <Menu size={20} />
              </button>
              {onLogout && (
                <button 
                  className="logout-button"
                  onClick={onLogout}
                  title="Se déconnecter"
                >
                  <LogOut size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
