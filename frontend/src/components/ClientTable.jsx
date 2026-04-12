import React, { useState } from 'react';
import { Search, Filter, Users, Edit, Info, DollarSign, CreditCard } from 'lucide-react';
import { blockClientAccess, activateClientAccess, updateClient, payerAbonnement } from '../services/api';

const ClientTable = ({ clients, searchTerm, setSearchTerm, onEditClient, onRefresh, onViewClient, filterMonth, setFilterMonth, filterYear, setFilterYear }) => {
  const [loading, setLoading] = useState(false);

  const toggleClientStatus = async (clientId, currentStatus) => {
    setLoading(true);
    try {
      if (currentStatus === 'actif') {
        await blockClientAccess(clientId);
      } else {
        await activateClientAccess(clientId);
      }
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error toggling client status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (client) => {
    setLoading(true);
    try {
      const response = await payerAbonnement(client.id);
      console.log('Paiement effectué:', response);
      alert(`Paiement de ${client.prix} effectué avec succès pour ${client.nom}!`);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Erreur lors du paiement:', error);
      alert('Erreur lors du traitement du paiement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut) => {
    const styles = {
      actif: 'status-active',
      inactif: 'status-inactive',
      expiré: 'status-expired',
      bloqué: 'status-warning'
    };
    
    return (
      <span className={`status-badge ${styles[statut] || styles.actif}`}>
        {statut}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="table-container">
      <div className="search-container">
        <h2>Quartiers</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search 
              style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9ca3af'
              }} 
              size={20} 
            />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ paddingLeft: '2.5rem', width: '300px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Filter size={20} />
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            >
              <option value="">Mois</option>
              <option value="1">Janvier</option>
              <option value="2">Février</option>
              <option value="3">Mars</option>
              <option value="4">Avril</option>
              <option value="5">Mai</option>
              <option value="6">Juin</option>
              <option value="7">Juillet</option>
              <option value="8">Août</option>
              <option value="9">Septembre</option>
              <option value="10">Octobre</option>
              <option value="11">Novembre</option>
              <option value="12">Décembre</option>
            </select>
            
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              style={{
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '0.875rem'
              }}
            >
              <option value="">Année</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
            
            {(filterMonth || filterYear) && (
              <button
                onClick={() => {
                  setFilterMonth('');
                  setFilterYear('');
                }}
                className="btn btn-secondary"
                style={{ padding: '0.5rem', fontSize: '0.75rem' }}
              >
                Effacer
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Quartier</th>
              <th>Nom</th>
              <th>Téléphone</th>
              <th>Prix</th>
              <th>Statut</th>
              <th>Échéance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.matricule}</td>
                <td>{client.quartier}</td>
                <td>{client.nom}</td>
                <td>{client.telephone}</td>
                <td>
                  <span style={{
                    background: '#f3f4f6',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151'
                  }}>
                    {client.prix || 'N/A'}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => toggleClientStatus(client.id, client.statut)}
                    disabled={loading}
                    className="status-toggle-btn"
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: '0'
                    }}
                  >
                    {getStatusBadge(client.statut)}
                  </button>
                </td>
                <td>{client.subscription?.date_fin ? formatDate(client.subscription.date_fin) : 'N/A'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => onViewClient && onViewClient(client)}
                      style={{
                        padding: '0.5rem',
                        background: '#e5e7eb',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Voir les infos"
                    >
                      <Info size={14} style={{ color: '#374151' }} />
                    </button>
                    <button
                      onClick={() => onEditClient && onEditClient(client)}
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem' }}
                    >
                      <Edit size={14} style={{ marginRight: '0.25rem' }} />
                      Edit
                    </button>
                    <button
                      onClick={() => handlePayment(client)}
                      className="btn btn-success"
                      style={{ 
                        padding: '0.5rem 1rem',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                      disabled={loading}
                    >
                      <CreditCard size={14} />
                      PAYE
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {clients.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: '#6b7280' }}>Aucun client trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientTable;
