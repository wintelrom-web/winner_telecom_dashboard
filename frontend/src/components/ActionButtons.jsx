import React from 'react';
import { UserPlus, FileText, Settings, Users, DollarSign } from 'lucide-react';

const ActionButtons = ({ onAction }) => {
  const buttons = [
    {
      label: 'Ajouter Client',
      icon: <UserPlus size={20} />,
      action: 'addClient',
      className: 'btn-primary'
    },
            {
      label: 'Rapports',
      icon: <FileText size={20} />,
      action: 'reports',
      className: 'btn-primary'
    },
    {
      label: 'Paramètres',
      icon: <Settings size={20} />,
      action: 'settings',
      className: 'btn-secondary'
    }
  ];

  const handleClick = (action) => {
    if (onAction) {
      onAction(action);
    }
  };

  return (
    <div className="action-buttons">
      {buttons.map((button, index) => (
        <button
          key={index}
          onClick={() => handleClick(button.action)}
          className={`btn ${button.className}`}
        >
          {button.icon}
          {button.label}
        </button>
      ))}
    </div>
  );
};

export default ActionButtons;
