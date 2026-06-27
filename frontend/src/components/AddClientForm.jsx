import React, { useState, useEffect } from 'react';
import { createClient, getVilles, getQuartiers } from '../services/api';
import { UserPlus, Phone, MapPin, Tag, AlertCircle, CheckCircle, Calendar } from 'lucide-react';

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
  'Yaoundé': ['Centre Administrative', 'Bastos', 'Ngoussou', 'Mvog-Ada', 'Elig-Mfomo', 'Ekoudou', 'Etoug-Ebe', 'Mokolo', 'Nkol-Eton', 'Nkol-Afamba', 'Ngoa-Ekelle', 'Académie', 'Essos', 'Tsinga', 'Okigbo', 'Nkomo', 'Nlongkak', 'Mahbeye', 'Carrefour', 'Messamebede'],
  'Douala': ['Douala 1er', 'Douala 2e', 'Douala 3e', 'Douala 4e', 'Douala 5e', 'Bonaberi', 'Nkongsamba', 'Kotto', 'New Bell', 'Bonapriso', 'Japoma', 'Mouelle', 'Deido', 'Plateau', 'Bonamoussadi', 'Nyalla', 'Cite des Palmiers', 'Makea', 'Logbaba', 'Ndogbong'],
  'Bafoussam': ['Bafoussam 1er', 'Bafoussam 2e', 'Bafoussam 3e', 'Tchecoua', 'Foumbot', 'Foumban', 'Bandjoun', 'Soumtcha', 'Bangante', 'Magba', 'Kékem', 'Mbouda', 'Galim', 'Babadjou', 'Bamendjou', 'Bangourain', 'Batcha', 'Kouoptamo'],
  'Garoua': ['Garoua 1er', 'Garoua 2e', 'Garoua 3e', 'Maga', 'Tchamba', 'Touboro', 'Tchanaga', 'Poli', 'Dembo', 'Bogo', 'Moussoro', 'Yagoua', 'Kalfou', 'Guider', 'Figuil', 'Rey Bouba', 'Touboro', 'Bénoué'],
  'Maroua': ['Maroua 1er', 'Maroua 2e', 'Maroua 3e', 'Tokombéri', 'Mokolo', 'Kalerah', 'Bouda', 'Mora', 'Kosei', 'Bogo', 'Dargala', 'Guidiguis', 'Maga', 'Waza', 'Yagoua', 'Blangoual', 'Guirvidig', 'Mara'],
  'Bamenda': ['Bamenda 1er', 'Bamenda 2e', 'Bamenda 3e', 'Bamenda 4e', 'Bambui', 'Wum', 'Kumbo', 'Oku', 'Njinike', 'Santa', 'Bafut', 'Pinyin', 'Nkwen', 'Mankon', 'Bali', 'Ndop', 'Widikum', 'Bambili', 'Ntame', 'Mbengwi'],
  'Buea': ['Buea 1er', 'Buea 2e', 'Buea 3e', 'Tiko', 'Muyuka', 'Kumba', 'Mamfe', 'Widikum', 'Limbe', 'Idenau', 'Bamusso', 'Dibombari', 'Bonaleo', 'Molyko', 'Great Soppo', 'Small Soppo', 'Bonduma', 'Wokoko', 'Wight', 'Bismarck'],
  'Bertoua': ['Bertoua 1er', 'Bertoua 2e', 'Betare-Oya', 'Garoua-Boulaï', 'Lomie', 'Somalomo', 'Mandjou', 'Bélabo', 'Yokadouma', 'Ngoura', 'Batouri', 'Mandjou', 'Kette', 'Messamena', 'Nguelebok', 'Mbang', 'Abong Mbang', 'Lolodorf'],
  'Ebolowa': ['Ebolowa 1er', 'Ebolowa 2e', 'Meyomessala', 'Ntui', 'Mfou', 'Bikok', 'Djoum', 'Sangmélima', 'Mintom', 'Kribi', 'Lolodorf', 'Oveng', 'Zoétélé', 'Meyomessi', 'Bipinde', 'Mvengue', 'Ngoulemakong', 'Afanmega'],
  'Ngaoundéré': ['Ngaoundéré 1er', 'Ngaoundéré 2e', 'Ngaoundal', 'Tcholliré', 'Moutoun', 'Baboua', 'Tibati', 'Yalimou', 'Martap', 'Nganha', 'Belel', 'Banyo', 'Mbe', 'Galim-Tignère', 'Mayo-Baléo', 'Tignère', 'Djamboutou', 'Koundé', 'Faro', 'Poli'],
};

const AddClientForm = ({ onClose, onClientAdded }) => {
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    telephone: '',
    quartier: '',
    ville: 'Douala',
    prix: '',
    date_debut: '',
    date_fin: '',
  });
const [quartiers, setQuartiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchQuartiers = async () => {
      if (formData.ville && QUARTIERS_CAMEROUN[formData.ville]) {
        setQuartiers(QUARTIERS_CAMEROUN[formData.ville]);
      } else {
        setQuartiers([]);
      }
    };
    fetchQuartiers();
  }, [formData.ville]);

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
    if (name === 'ville') {
      setFormData({
        ...formData,
        ville: value,
        quartier: ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value || ''
      });
    }
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
        ville: 'Douala',
        prix: '',
        date_debut: '',
        date_fin: ''
      });

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
        <select
          id="ville"
          name="ville"
          value={formData.ville}
          onChange={handleChange}
          required
          className="form-input"
        >
          <option value="">-- Sélectionner une ville --</option>
          {VILLES_CAMEROUN.map(ville => (
            <option key={ville} value={ville}>{ville}</option>
          ))}
        </select>
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
        <select
          id="quartier"
          name="quartier"
          value={formData.quartier}
          onChange={handleChange}
          required
          className="form-input"
          disabled={!formData.ville}
        >
          <option value="">-- Sélectionner un quartier --</option>
          {quartiers.map(quartier => (
            <option key={quartier} value={quartier}>{quartier}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="date_debut">
          <Calendar size={16} style={{ marginRight: '0.5rem' }} />
          Date de début *
        </label>
        <input
          type="date"
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
  );
};

export default AddClientForm;
