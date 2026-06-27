import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, X, Trash2, User, Phone, MapPin, Calendar } from 'lucide-react';
import { updateClient, deleteClient } from '../services/api';

const VILLES_CAMEROUN = [
  'Yaoundé',  // Centre
  'Douala',   // Littoral
  'Bafoussam',  // West
  'Garoua',  // North
  'Maroua',  // Far North
  'Bamenda',  // Northwest
  'Buea',     // Southwest
  'Bertoua',  // East
  'Ebolowa',  // South
  'Ngaoundéré',  // Adamawa
];

const QUARTIERS_CAMEROUN = {
  'Yaoundé': ['Centre Administrative', 'Bastos', 'Ngoussou', 'Mvog-Ada', 'Elig-Mfomo', 'Ekoudou', 'Etoug-Ebe', 'Mokolo', 'Nkol-Eton', 'Nkol-Afamba','Damas','Ezala','barriere','Obam','Nkolnda'],
  'Douala': ['Douala 1er', 'Douala 2e', 'Douala 3e', 'Douala 4e', 'Douala 5e', 'Bonaberi', 'Nkongsamba', 'Kotto', 'New Bell', 'Bonapriso', 'Japoma', 'Mouelle'],
  'Bafoussam': ['Bafoussam 1er', 'Bafoussam 2e', 'Bafoussam 3e', 'Tchecoua', 'Foumbot', 'Foumban', 'Bandjoun', 'Soumtcha', 'Bangante', 'Magba'],
  'Garoua': ['Garoua 1er', 'Garoua 2e', 'Garoua 3e', 'Maga', 'Tchamba', 'Touboro', 'Tchanaga', 'Poli'],
  'Maroua': ['Maroua 1er', 'Maroua 2e', 'Maroua 3e', 'Tokombéri', 'Mokolo', 'Kalerah', 'Bouda'],
  'Bamenda': ['Bamenda 1er', 'Bamenda 2e', 'Bamenda 3e', 'Bamenda 4e', 'Bambui', 'Wum', 'Kumbo', 'Oku', 'Njinike'],
  'Buea': ['Buea 1er', 'Buea 2e', 'Buea 3e', 'Tiko', 'Muyuka', 'Kumba', 'Mamfe', 'Widikum'],
  'Bertoua': ['Bertoua 1er', 'Bertoua 2e', 'Betare-Oya', 'Garoua-Boulaï', 'Lomie', 'Somalomo', 'Mandjou'],
  'Ebolowa': ['Ebolowa 1er', 'Ebolowa 2e', 'Meyomessala', 'Ntui', 'Mfou', 'Bikok', 'Djoum'],
  'Ngaoundéré': ['Ngaoundéré 1er', 'Ngaoundéré 2e', 'Ngaoundal', 'Tcholliré', 'Moutoun', 'Baboua'],
};

const Edit = ({ client, onBack, onClientUpdated, onClientDeleted }) => {
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    telephone: '',
    quartier: '',
    ville: '',
    prix: '1Mo 5000F',
    date_debut: '',
    date_fin: ''
  });
  const [quartiers, setQuartiers] = useState([]);
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
        ville: client.ville || 'Douala',
        prix: client.prix || '1Mo 5000F',
        date_debut: client.subscription?.date_debut || '',
        date_fin: client.subscription?.date_fin || ''
      });
      if (client.ville && QUARTIERS_CAMEROUN[client.ville]) {
        setQuartiers(QUARTIERS_CAMEROUN[client.ville]);
      }
    }
  }, [client]);

  useEffect(() => {
    if (formData.ville && QUARTIERS_CAMEROUN[formData.ville]) {
      setQuartiers(QUARTIERS_CAMEROUN[formData.ville]);
    } else {
      setQuartiers([]);
    }
  }, [formData.ville]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'ville') {
      setFormData(prev => ({
        ...prev,
        ville: value,
        quartier: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
              <select
                name="quartier"
                value={formData.quartier}
                onChange={handleChange}
                className="form-input"
                required
                disabled={!formData.ville}
              >
                <option value="">-- Sélectionner un quartier --</option>
                {quartiers.map(quartier => (
                  <option key={quartier} value={quartier}>{quartier}</option>
                ))}
              </select>
            </div>

            {/* Ville */}
            <div className="form-group">
              <label className="form-label">
                <MapPin size={16} style={{ marginRight: '0.5rem' }} />
                Ville
              </label>
              <select
                name="ville"
                value={formData.ville}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="">-- Sélectionner une ville --</option>
                {VILLES_CAMEROUN.map(ville => (
                  <option key={ville} value={ville}>{ville}</option>
                ))}
              </select>
            </div>

            {/* Prix */}
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} style={{ marginRight: '0.5rem' }} />
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
