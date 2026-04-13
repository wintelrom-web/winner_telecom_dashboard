import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, X, Trash2, User, Phone, MapPin, Calendar, Shield } from 'lucide-react';
import { updateClient, deleteClient, blockClientAccess, activateClientAccess } from '../services/api';

const Edit = ({ client, onBack, onClientUpdated, onClientDeleted }) => {
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    telephone: '',
    quartier: '',
    prix: '1Mo 5000F',
    statut: 'actif',
    date_debut: '',
    date_fin: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        matricule: client.matricule || '',
        nom: client.nom || '',
        telephone: client.telephone || '',
        quartier: client.quartier || '',
        prix: client.prix || '1Mo 5000F',
        statut: client.statut || 'actif',
        date_debut: client.subscription?.date_debut || '',
        date_fin: client.subscription?.date_fin || ''
      });
    }
  }, [client]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateClient(client.id, formData);
      showMessage('success', 'Client mis à jour avec succès');
      if (onClientUpdated) onClientUpdated();
      setTimeout(() => onBack(), 1500);
    } catch (error) {
      console.error('Error updating client:', error);
      showMessage('error', 'Erreur lors de la mise à jour du client');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    
    try {
      await deleteClient(client.id);
      showMessage('success', 'Client supprimé avec succès');
      if (onClientDeleted) onClientDeleted();
      setTimeout(() => onBack(), 1500);
    } catch (error) {
      console.error('Error deleting client:', error);
      showMessage('error', 'Erreur lors de la suppression du client');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const toggleStatus = async () => {
    setLoading(true);
    
    try {
      const newStatus = formData.statut === 'actif' ? 'inactif' : 'actif';
      
      if (newStatus === 'inactif') {
        await blockClientAccess(client.id);
      } else {
        await activateClientAccess(client.id);
      }
      
      setFormData(prev => ({ ...prev, statut: newStatus }));
      showMessage('success', `Statut changé vers ${newStatus}`);
    } catch (error) {
      console.error('Error toggling status:', error);
      showMessage('error', 'Erreur lors du changement de statut');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (statut) => {
    const styles = {
      actif: { bg: '#dcfce7', color: '#166534', icon: Shield },
      inactif: { bg: '#fef2f2', color: '#dc2626', icon: X },
      expiré: { bg: '#fef3c7', color: '#d97706', icon: Calendar },
      bloqué: { bg: '#f3f4f6', color: '#374151', icon: Shield }
    };
    
    const style = styles[statut] || styles.actif;
    const Icon = style.icon;
    
    return (
      <span 
        style={{
          backgroundColor: style.bg,
          color: style.color,
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.875rem',
          fontWeight: '600',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.25rem'
        }}
      >
        <Icon size={14} />
        {statut}
      </span>
    );
  };

  return (
    <div className="edit-client-container">
      {/* Header */}
      <div className="edit-header">
        <div className="header-content">
          <button onClick={onBack} className="btn btn-secondary">
            <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
            Retour
          </button>
          <h1>Modifier le Client</h1>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Form */}
      <div className="edit-form-container">
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="form-grid">
            {/* Matricule */}
            <div className="form-group">
              <label className="form-label">
                <User size={16} style={{ marginRight: '0.5rem' }} />
                Matricule
              </label>
              <input
                type="text"
                name="matricule"
                value={formData.matricule}
                onChange={handleChange}
                className="form-input"
                placeholder="Entrez le matricule"
                required
              />
            </div>

            {/* Nom */}
            <div className="form-group">
              <label className="form-label">
                <User size={16} style={{ marginRight: '0.5rem' }} />
                Nom complet
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                className="form-input"
                placeholder="Entrez le nom du client"
                required
              />
            </div>

            {/* Téléphone */}
            <div className="form-group">
              <label className="form-label">
                <Phone size={16} style={{ marginRight: '0.5rem' }} />
                Téléphone
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                className="form-input"
                placeholder="Entrez le numéro de téléphone"
                required
              />
            </div>

            {/* Quartier */}
            <div className="form-group">
              <label className="form-label">
                <MapPin size={16} style={{ marginRight: '0.5rem' }} />
                Quartier
              </label>
              <input
                type="text"
                name="quartier"
                value={formData.quartier}
                onChange={handleChange}
                className="form-input"
                placeholder="Entrez le quartier"
                required
              />
            </div>

            {/* Prix */}
            <div className="form-group">
              <label className="form-label">
                <Shield size={16} style={{ marginRight: '0.5rem' }} />
                Prix
              </label>
              <select
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="1Mo 5000F">1Mo 5000F</option>
                <option value="Access 10000F">Access 10000F</option>
                <option value="Premium 15000F">Premium 15000F</option>
                <option value="VIP 20000F">VIP 20000F</option>
              </select>
            </div>

            {/* Date début abonnement */}
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} style={{ marginRight: '0.5rem' }} />
                Date début abonnement
              </label>
              <input
                type="date"
                name="date_debut"
                value={formData.date_debut}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {/* Date fin abonnement */}
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} style={{ marginRight: '0.5rem' }} />
                Date fin abonnement
              </label>
              <input
                type="date"
                name="date_fin"
                value={formData.date_fin}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            {/* Statut */}
            <div className="form-group">
              <label className="form-label">
                <Shield size={16} style={{ marginRight: '0.5rem' }} />
                Statut
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {getStatusBadge(formData.statut)}
                <button
                  type="button"
                  onClick={toggleStatus}
                  disabled={loading}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem' }}
                >
                  {formData.statut === 'actif' ? 'Désactiver' : 'Activer'}
                </button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <div className="left-actions">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="btn btn-danger"
                disabled={loading}
              >
                <Trash2 size={16} style={{ marginRight: '0.5rem' }} />
                Supprimer
              </button>
            </div>
            
            <div className="right-actions">
              <button
                type="button"
                onClick={onBack}
                className="btn btn-secondary"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <Save size={16} style={{ marginRight: '0.5rem' }} />
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Confirmer la suppression</h3>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
              >
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p>Êtes-vous sûr de vouloir supprimer le client <strong>{formData.nom}</strong> ?</p>
              <p style={{ color: '#dc2626', fontSize: '0.875rem' }}>
                Cette action est irréversible.
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={loading}
              >
                <Trash2 size={16} style={{ marginRight: '0.5rem' }} />
                {loading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Edit;
