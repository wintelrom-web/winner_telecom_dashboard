import React, { useState } from 'react';
import { createClient } from '../services/api';
import { UserPlus, Phone, MapPin, Tag, AlertCircle, CheckCircle, Calendar, Image } from 'lucide-react';

const AddClientForm = ({ onClose, onClientAdded }) => {
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    telephone: '',
    quartier: '',
    ville: 'Abidjan',
    prix: '',
    date_debut: '',
    date_fin: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (error || success) {
      setError('');
      setSuccess('');
    }
    if (name === 'telephone') {
      const phoneRegex = /^[6-9]\d{0,8}$/;
      if (value && !phoneRegex.test(value)) {
        return;
      }
    }
    setFormData({
      ...formData,
      [name]: value || ''
    });
  };

  const validateForm = () => {
    if (!formData.nom.trim()) {
      setError('Le nom complet est requis');
      return false;
    }
    if (!formData.telephone.trim()) {
      setError('Le numéro de téléphone est requis');
      return false;
    }
    if (formData.telephone.length !== 9) {
      setError('Le numéro de téléphone doit contenir 9 chiffres');
      return false;
    }
    if (!/^[6-9]\d{8}$/.test(formData.telephone)) {
      setError('Le numéro de téléphone doit commencer par 6, 7, 8 ou 9');
      return false;
    }
    if (!formData.quartier.trim()) {
      setError('Le quartier est requis');
      return false;
    }
    if (!formData.ville.trim()) {
      setError('La ville est requise');
      return false;
    }
    if (!formData.date_debut) {
      setError('La date de début est obligatoire');
      return false;
    }
    if (!formData.date_fin) {
      setError('La date de fin est obligatoire');
      return false;
    }
    if (!formData.prix) {
      setError('Veuillez sélectionner une offre d\'abonnement');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const clientData = new FormData();
      clientData.append('matricule', formData.matricule);
      clientData.append('nom', formData.nom.trim());
      clientData.append('telephone', formData.telephone.trim());
      clientData.append('quartier', formData.quartier.trim());
      clientData.append('ville', formData.ville.trim());
      clientData.append('prix', formData.prix);
      clientData.append('date_debut', formData.date_debut);
      clientData.append('date_fin', formData.date_fin);

      await createClient(clientData);
      setSuccess('Client créé avec succès!');

      setFormData({
        matricule: '',
        nom: '',
        telephone: '',
        quartier: '',
        ville: 'Abidjan',
        prix: '',
        date_debut: '',
        date_fin: '',
        image: null
      });
      setImagePreview(null);

      setTimeout(() => {
        onClientAdded();
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Error creating client:', error);
      if (error.response?.data) {
        const backendError = error.response.data;
        if (backendError.telephone) {
          setError('Ce numéro de téléphone existe déjà');
        } else if (backendError.matricule) {
          setError('Ce matricule existe déjà');
        } else if (backendError.detail) {
          setError(backendError.detail);
        } else {
          setError('Erreur lors de la création du client. Veuillez réessayer.');
        }
      } else {
        setError('Erreur de connexion au serveur. Veuillez vérifier votre connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="error-message">
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      {success && (
        <div className="success-message">
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="matricule">
          <Tag size={16} style={{ marginRight: '0.5rem' }} />
          Matricule
        </label>
        <input
          type="text"
          id="matricule"
          name="matricule"
          value={formData.matricule}
          onChange={handleChange}
          placeholder="Saisir le matricule manuellement"
          className="form-input"
          required
        />
        <small>Saisir un matricule unique (ex: WT202600001)</small>
      </div>

      <div className="form-group">
        <label htmlFor="nom">
          <UserPlus size={16} style={{ marginRight: '0.5rem' }} />
          Nom complet *
        </label>
        <input
          type="text"
          id="nom"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          required
          placeholder="Jean Dupont"
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="prix">
          <Tag size={16} style={{ marginRight: '0.5rem' }} />
          Prix *
        </label>
        <select
          id="prix"
          name="prix"
          value={formData.prix}
          onChange={handleChange}
          required
          className="form-input"
        >
          <option value="">-- Sélectionner une offre --</option>
          <option value="1Mo 5000F">1Mo Classique - 5000F</option>
          <option value="Access 10000F">Access - 10000F</option>
          <option value="Premium 15000F">Premium - 15000F</option>
          <option value="VIP 20000F">VIP - 20000F</option>
        </select>
        <small>Sélectionner l'offre d'abonnement</small>
      </div>

      <div className="form-group">
        <label htmlFor="ville">
          <MapPin size={16} style={{ marginRight: '0.5rem' }} />
          Ville *
        </label>
        <input
          type="text"
          id="ville"
          name="ville"
          value={formData.ville}
          onChange={handleChange}
          required
          placeholder="Ex: Abidjan, Yamoussoukro..."
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="telephone">
          <Phone size={16} style={{ marginRight: '0.5rem' }} />
          Téléphone *
        </label>
        <input
          type="tel"
          id="telephone"
          name="telephone"
          value={formData.telephone}
          onChange={handleChange}
          required
          placeholder="6XXXXXXXX"
          maxLength={9}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="quartier">
          <MapPin size={16} style={{ marginRight: '0.5rem' }} />
          Quartier *
        </label>
        <input
          type="text"
          id="quartier"
          name="quartier"
          value={formData.quartier}
          onChange={handleChange}
          required
          placeholder="Ex: Plateau, Yopougon, Cocody..."
          className="form-input"
        />
      </div>

      <div className="form-group">
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                <UserPlus size={24} />
              </div>
            <button
              type="button"
              onClick={removeImage}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
          id="date_debut"
          name="date_debut"
          value={formData.date_debut}
          onChange={handleChange}
          required
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label htmlFor="date_fin">
          <Calendar size={16} style={{ marginRight: '0.5rem' }} />
          Date de fin *
        </label>
        <input
          type="date"
          id="date_fin"
          name="date_fin"
          value={formData.date_fin}
          onChange={handleChange}
          required
          className="form-input"
        />
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          onClick={onClose} 
          className="btn btn-secondary"
          disabled={loading}
        >
          Annuler
        </button>
        <button 
          type="submit" 
          disabled={loading} 
          className="btn btn-primary"
        >
          {loading ? (
            <>
              <div className="loading-spinner" style={{ marginRight: '0.5rem' }}></div>
              Création...
            </>
          ) : (
            <>
              <UserPlus size={16} style={{ marginRight: '0.5rem' }} />
              Créer Client
            </>
          )}
        </button>
        </div>
      </form>
    </div>
  );
};

export default AddClientForm;
