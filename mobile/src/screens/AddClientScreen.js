import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { createClient } from '../services/api';

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

const OFFRES_ABONNEMENT = [
  '1Mo 5000F',
  'Access 10000F',
  'Premium 15000F',
  'VIP 20000F',
];

export default function AddClientScreen({ navigation }) {
  const [form, setForm] = useState({
    matricule: '',
    nom: '',
    telephone: '',
    prix: '',
    ville: 'Douala',
    quartier: '',
    date_debut: '',
    date_fin: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleVilleChange = (ville) => {
    setForm({ ...form, ville, quartier: '' });
  };

  const handleTelephoneChange = (value) => {
    const phoneRegex = /^[6-9]\d{0,8}$/;
    if (value && !phoneRegex.test(value)) {
      return;
    }
    setForm({ ...form, telephone: value });
  };

  const validateForm = () => {
    if (!form.nom.trim()) {
      setError('Le nom complet est requis');
      return false;
    }
    if (!form.telephone.trim()) {
      setError('Le numéro de téléphone est requis');
      return false;
    }
    if (form.telephone.length !== 9) {
      setError('Le numéro de téléphone doit contenir 9 chiffres');
      return false;
    }
    if (!/^[6-9]\d{8}$/.test(form.telephone)) {
      setError('Le numéro de téléphone doit commencer par 6, 7, 8 ou 9');
      return false;
    }
    if (!form.quartier.trim()) {
      setError('Le quartier est requis');
      return false;
    }
    if (!form.ville.trim()) {
      setError('La ville est requise');
      return false;
    }
    if (!form.date_debut) {
      setError('La date de début est obligatoire');
      return false;
    }
    if (!form.date_fin) {
      setError('La date de fin est obligatoire');
      return false;
    }
    if (!form.prix) {
      setError('Veuillez sélectionner une offre d\'abonnement');
      return false;
    }
    return true;
  };


  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Erreur', error);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const clientData = new FormData();
      clientData.append('matricule', form.matricule);
      clientData.append('nom', form.nom.trim());
      clientData.append('telephone', form.telephone.trim());
      clientData.append('quartier', form.quartier.trim());
      clientData.append('ville', form.ville.trim());
      clientData.append('prix', form.prix);
      clientData.append('date_debut', form.date_debut);
      clientData.append('date_fin', form.date_fin);

      await createClient(clientData);
      setSuccess('Client créé avec succès!');

      setForm({
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
        Alert.alert('Succès', 'Client créé avec succès!');
        navigation.goBack();
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
      Alert.alert('Erreur', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.headerCard}>
        <Text style={styles.eyebrow}>Nouveau client</Text>
        <Text style={styles.header}>Ajoutez un profil en quelques secondes</Text>
      </View>

      <View style={styles.formCard}>
        <TextInput style={styles.input} placeholder="Matricule" value={form.matricule} onChangeText={(value) => setForm({ ...form, matricule: value })} />
        <TextInput style={styles.input} placeholder="Nom complet" value={form.nom} onChangeText={(value) => setForm({ ...form, nom: value })} />
        <TextInput style={styles.input} placeholder="Téléphone" value={form.telephone} onChangeText={handleTelephoneChange} keyboardType="phone-pad" maxLength={9} />

        <Text style={styles.label}>Offre d'abonnement</Text>
        <View style={styles.optionList}>
          {OFFRES_ABONNEMENT.map((offre) => (
            <TouchableOpacity key={offre} style={[styles.option, form.prix === offre && styles.optionSelected]} onPress={() => setForm({ ...form, prix: offre })}>
              <Text style={form.prix === offre ? styles.optionTextSelected : styles.optionText}>{offre}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Ville</Text>
        <View style={styles.optionList}>
          {VILLES_CAMEROUN.map((ville) => (
            <TouchableOpacity key={ville} style={[styles.option, form.ville === ville && styles.optionSelected]} onPress={() => handleVilleChange(ville)}>
              <Text style={form.ville === ville ? styles.optionTextSelected : styles.optionText}>{ville}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Quartier</Text>
        <View style={styles.optionList}>
          {QUARTIERS_CAMEROUN[form.ville]?.map((quartier) => (
            <TouchableOpacity key={quartier} style={[styles.option, form.quartier === quartier && styles.optionSelected]} onPress={() => setForm({ ...form, quartier })}>
              <Text style={form.quartier === quartier ? styles.optionTextSelected : styles.optionText}>{quartier}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput style={styles.input} placeholder="Date de début (YYYY-MM-DD)" value={form.date_debut} onChangeText={(value) => setForm({ ...form, date_debut: value })} />
        <TextInput style={styles.input} placeholder="Date de fin (YYYY-MM-DD)" value={form.date_fin} onChangeText={(value) => setForm({ ...form, date_fin: value })} />

        <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Création...' : 'Enregistrer'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  contentContainer: { padding: 16, paddingBottom: 36 },
  headerCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 18, marginBottom: 14, boxShadow: '0px 10px 24px rgba(148, 163, 184, 0.18)', elevation: 3 },
  eyebrow: { color: '#2563eb', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  header: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  formCard: { backgroundColor: '#ffffff', borderRadius: 24, padding: 16, boxShadow: '0px 8px 20px rgba(148, 163, 184, 0.14)', elevation: 3 },
  input: { backgroundColor: '#f8fafc', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 10, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 15 },
  label: { fontSize: 15, fontWeight: '700', color: '#334155', marginTop: 8, marginBottom: 8 },
  optionList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  option: { backgroundColor: '#f8fafc', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 8 },
  optionSelected: { backgroundColor: '#dbeafe', borderColor: '#2563eb' },
  optionText: { color: '#475569' },
  optionTextSelected: { color: '#1d4ed8', fontWeight: '700' },
  button: { backgroundColor: '#2563eb', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 16, boxShadow: '0px 8px 18px rgba(37, 99, 235, 0.24)' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
