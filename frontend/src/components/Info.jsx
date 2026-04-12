import React from 'react';
import { ArrowLeft, User, MapPin, Phone, Calendar, CreditCard, AlertTriangle, CheckCircle, XCircle, Edit, Shield, ShieldOff, DollarSign } from 'lucide-react';

const Info = ({ client, onBack, onEdit, onBlockAccess, onActivateAccess, onManagePayment, onRefresh }) => {
  if (!client) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Aucun client sélectionné</p>
        <button onClick={onBack} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Retour
        </button>
      </div>
    );
  }

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
    <div style={{ 
      padding: '1.5rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      position: 'relative',
      zIndex: '10',
      backgroundColor: '#ffffff'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: '#e5e7eb',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '1rem'
          }}
        >
          <ArrowLeft size={18} />
          Retour
        </button>
      </div>

      {/* Client Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        borderRadius: '16px',
        padding: '2rem',
        color: 'white',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 'bold',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {client.photo_url ? (
              <img 
                src={client.photo_url} 
                alt={client.nom}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '50%'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.style.background = 'rgba(255,255,255,0.2)';
                  e.target.parentElement.innerHTML = client.nom ? client.nom.charAt(0).toUpperCase() : '?';
                }}
              />
            ) : (
              client.nom ? client.nom.charAt(0).toUpperCase() : '?'
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '1.75rem' }}>{client.nom}</h1>
            <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>{client.matricule}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              background: 'rgba(255,255,255,0.2)',
              color: 'white'
            }}>
              {getStatusIcon(client.statut)}
              {client.statut}
            </span>
            
            <button 
              onClick={() => {
                if (window.confirm(`Voulez-vous vraiment étendre l'abonnement de ${client.nom} d'un mois?`)) {
                  // Appeler la fonction de paiement
                  onManagePayment && onManagePayment(client, 'extend');
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: '#10b981',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#059669'}
              onMouseOut={(e) => e.target.style.background = '#10b981'}
            >
              <CreditCard size={18} />
              PAYE
            </button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        
        {/* Quartier */}
        <div style={styles.infoCard}>
          <div style={styles.iconBox}>
            <MapPin size={24} />
          </div>
          <div>
            <label style={styles.label}>Quartier</label>
            <p style={styles.value}>{client.quartier}</p>
          </div>
        </div>

        {/* Téléphone */}
        <div style={styles.infoCard}>
          <div style={{...styles.iconBox, background: '#d1fae5', color: '#10b981'}}>
            <Phone size={24} />
          </div>
          <div>
            <label style={styles.label}>Téléphone</label>
            <p style={styles.value}>{client.telephone}</p>
          </div>
        </div>

        {/* Prix */}
        <div style={styles.infoCard}>
          <div style={{...styles.iconBox, background: '#fef3c7', color: '#f59e0b'}}>
            <DollarSign size={24} />
          </div>
          <div>
            <label style={styles.label}>Prix</label>
            <p style={styles.value}>{client.prix || 'N/A'}</p>
          </div>
        </div>

        {/* Date de création */}
        <div style={styles.infoCard}>
          <div style={{...styles.iconBox, background: '#fef3c7', color: '#f59e0b'}}>
            <Calendar size={24} />
          </div>
          <div>
            <label style={styles.label}>Date de création</label>
            <p style={styles.value}>{formatDate(client.date_creation)}</p>
          </div>
        </div>

      </div>

      {/* Subscription Section */}
      {client.subscription && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            margin: '0 0 1rem 0', 
            fontSize: '1.125rem', 
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CreditCard size={20} style={{ color: '#3b82f6' }} />
            Abonnement
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div style={{ 
              padding: '1rem',
              background: '#ecfdf5',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Date début</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', color: '#1f2937', fontWeight: '600' }}>
                {formatDate(client.subscription.date_debut)}
              </p>
            </div>
            
            <div style={{ 
              padding: '1rem',
              background: client.subscription.échéance_proche ? '#fef3c7' : '#f3f4f6',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Date fin</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', color: '#1f2937', fontWeight: '600' }}>
                {formatDate(client.subscription.date_fin)}
              </p>
            </div>
            
            <div style={{ 
              padding: '1rem',
              background: client.subscription.jours_restants <= 0 ? '#fee2e2' : 
                         client.subscription.jours_restants <= 7 ? '#fef3c7' : '#ecfdf5',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>Jours restants</p>
              <p style={{ 
                margin: '0.5rem 0 0 0', 
                fontSize: '1.25rem', 
                fontWeight: '700',
                color: client.subscription.jours_restants <= 0 ? '#ef4444' : 
                       client.subscription.jours_restants <= 7 ? '#f59e0b' : '#10b981'
              }}>
                {client.subscription.jours_restants || 0}
              </p>
            </div>
          </div>

          {client.subscription.échéance_proche && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: '#fef3c7',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#92400e'
            }}>
              <AlertTriangle size={18} />
              <span style={{ fontWeight: '500' }}>Échéance proche - Paiement à effectuer</span>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button 
          onClick={() => onEdit && onEdit(client)}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Edit size={18} />
          Modifier
        </button>
        
        {client.subscription && (
          <>
            <button 
              onClick={() => {
                if (client.subscription.est_actif) {
                  // Bloquer l'accès
                  if (window.confirm('Voulez-vous vraiment bloquer l\'accès de ce client?')) {
                    // Appeler la fonction pour bloquer
                    onBlockAccess && onBlockAccess(client.id);
                  }
                } else {
                  // Activer l'accès
                  if (window.confirm('Voulez-vous vraiment activer l\'accès de ce client?')) {
                    // Appeler la fonction pour activer
                    onActivateAccess && onActivateAccess(client.id);
                  }
                }
              }}
              className={`btn ${client.subscription.est_actif ? 'btn-danger' : 'btn-success'}`}
              style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {client.subscription.est_actif ? <ShieldOff size={18} /> : <Shield size={18} />}
              {client.subscription.est_actif ? 'Bloquer' : 'Activer'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  infoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: '#dbeafe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#3b82f6'
  },
  label: {
    fontSize: '0.75rem',
    color: '#6b7280',
    display: 'block',
    marginBottom: '0.25rem'
  },
  value: {
    margin: 0,
    fontSize: '1rem',
    color: '#1f2937',
    fontWeight: '600'
  }
};

export default Info;
