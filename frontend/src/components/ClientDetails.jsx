import React from 'react';
import { X, User, MapPin, Phone, Calendar, CreditCard, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const ClientDetails = ({ client, onClose }) => {
  if (!client) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'actif':
        return <CheckCircle size={16} style={{ color: '#10b981' }} />;
      case 'expiré':
        return <XCircle size={16} style={{ color: '#ef4444' }} />;
      case 'bloqué':
        return <AlertTriangle size={16} style={{ color: '#7c3aed' }} />;
      default:
        return null;
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'actif':
        return '#10b981';
      case 'expiré':
        return '#ef4444';
      case 'bloqué':
        return '#7c3aed';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2>Informations du Client</h2>
          <button className="close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {/* Client Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #e5e7eb'
          }}>
            {client.image ? (
              <img 
                src={client.image} 
                alt={client.nom} 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #e5e7eb'
                }}
              />
            ) : (
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                {client.nom ? client.nom.charAt(0).toUpperCase() : '?'}
              </div>
            )}
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#1f2937' }}>{client.nom}</h3>
              <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>{client.matricule}</p>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                marginTop: '0.5rem',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                textTransform: 'uppercase',
                background: `${getStatusColor(client.statut)}20`,
                color: getStatusColor(client.statut)
              }}>
                {getStatusIcon(client.statut)}
                {client.statut}
              </span>
            </div>
          </div>

          {/* Client Info Grid */}
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              padding: '0.75rem',
              background: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#dbeafe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6'
              }}>
                <MapPin size={20} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>Quartier</label>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#1f2937', fontWeight: '500' }}>{client.quartier}</p>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              padding: '0.75rem',
              background: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#d1fae5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}>
                <Phone size={20} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>Téléphone</label>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#1f2937', fontWeight: '500' }}>{client.telephone}</p>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem',
              padding: '0.75rem',
              background: '#f9fafb',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b'
              }}>
                <Calendar size={20} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#6b7280', display: 'block' }}>Date de création</label>
                <p style={{ margin: 0, fontSize: '0.9375rem', color: '#1f2937', fontWeight: '500' }}>{formatDate(client.date_creation)}</p>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          {client.subscription && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Abonnement
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ 
                  padding: '0.75rem',
                  background: '#ecfdf5',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Date début</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9375rem', color: '#1f2937', fontWeight: '600' }}>
                  {formatDate(client.subscription.date_fin)}
                  </p>
                </div>
                <div style={{ 
                  gridColumn: 'span 2',
                  padding: '0.75rem',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Jours restants</p>
                  <p style={{ 
                    margin: '0.25rem 0 0 0', 
                    fontSize: '1.25rem', 
                    color: client.subscription.jours_restants <= 0 ? '#ef4444' : client.subscription.jours_restants <= 7 ? '#f59e0b' : '#10b981', 
                    fontWeight: '700' 
                  }}>
                    {client.subscription.jours_restants || 0} jours
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
