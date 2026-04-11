import React from 'react';
import { Users, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const StatsCards = ({ stats, onCardClick }) => {
  const cards = [
    {
      id: 'total',
      title: 'Total Clients',
      value: stats.total_clients || 0,
      icon: <Users size={24} />,
      color: '#3b82f6',
      bgColor: '#eff6ff'
    },
    {
      id: 'actifs',
      title: 'Abonnements Actifs',
      value: stats.abonnements_actifs || 0,
      icon: <CheckCircle size={24} />,
      color: '#10b981',
      bgColor: '#ecfdf5'
    },
    {
      id: 'expirés',
      title: 'Expirés',
      value: stats.expirés || 0,
      icon: <XCircle size={24} />,
      color: '#ef4444',
      bgColor: '#fef2f2'
    },
    {
      id: 'échéances',
      title: 'Échéances Proches',
      value: stats.échéances_proches || 0,
      icon: <AlertTriangle size={24} />,
      color: '#f59e0b',
      bgColor: '#fffbeb'
    }
  ];

  const handleCardClick = (cardId) => {
    if (onCardClick) {
      onCardClick(cardId);
    }
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem'
    }}>
      {cards.map((card, index) => (
        <div
          key={index}
          onClick={() => handleCardClick(card.id)}
          style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '2px solid transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            e.currentTarget.style.borderColor = card.color;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '0.5rem',
            backgroundColor: card.bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: card.color
          }}>
            {card.icon}
          </div>
          <div>
            <p style={{
              color: '#6b7280',
              fontSize: '0.875rem',
              margin: 0,
              marginBottom: '0.25rem'
            }}>
              {card.title}
            </p>
            <p style={{
              color: card.color,
              fontSize: '1.5rem',
              fontWeight: 'bold',
              margin: 0
            }}>
              {card.value}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
