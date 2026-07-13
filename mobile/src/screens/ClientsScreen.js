import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { getClients, deleteClient } from '../services/api';

export default function ClientsScreen({ navigation }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadClients = async () => {
    try {
      setError('');
      const data = await getClients();
      setClients(data || []);
    } catch (error) {
      console.error(error);
      setError('Impossible de charger les clients. Vérifiez le backend et l’adresse API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClients(); }, []);

  const handleDelete = (client) => {
    Alert.alert('Supprimer', `Supprimer ${client.nom} ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Oui', onPress: async () => { await deleteClient(client.id); loadClients(); } },
    ]);
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  const filteredClients = (clients || []).filter((item) => {
    const term = search.toLowerCase();
    return `${item.nom} ${item.matricule} ${item.telephone} ${item.ville}`.toLowerCase().includes(term);
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.header}>Clients</Text>
        <Text style={styles.subheader}>Cherchez et gérez vos contacts rapidement</Text>
      </View>
      {error ? <Text style={styles.errorBox}>{error}</Text> : null}
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher client"
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        contentContainerStyle={styles.listContent}
        data={filteredClients}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('ClientDetails', { client: item })}>
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.nom}</Text>
                <Text style={styles.meta}>{item.ville} • {item.quartier}</Text>
                <Text style={styles.meta}>{item.telephone}</Text>
                <Text style={styles.meta}>{item.prix || 'Non renseigné'}</Text>
                <Text style={[styles.meta, item.statut === 'actif' ? styles.active : styles.inactive]}>{item.statut || 'Non renseigné'}</Text>
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
                <Text style={styles.deleteText}>Suppr.</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Aucun client trouvé.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  headerCard: { backgroundColor: '#ffffff', borderRadius: 20, padding: 16, marginBottom: 12, boxShadow: '0px 8px 18px rgba(148, 163, 184, 0.14)', elevation: 3 },
  header: { fontSize: 24, fontWeight: '800', color: '#0f172a' },
  subheader: { fontSize: 13, color: '#64748b', marginTop: 4 },
  searchInput: { backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0', fontSize: 15 },
  errorBox: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: 10, borderRadius: 12, marginBottom: 12, fontSize: 13 },
  listContent: { paddingBottom: 90 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 14, borderRadius: 16, marginBottom: 10, elevation: 2, boxShadow: '0px 3px 10px rgba(148, 163, 184, 0.14)', borderWidth: 1, borderColor: '#eef2f7' },
  name: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  meta: { color: '#64748b', marginTop: 4 },
  active: { color: '#16a34a' },
  inactive: { color: '#dc2626' },
  deleteButton: { backgroundColor: '#ef4444', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  deleteText: { color: '#fff', fontWeight: '600' },
  empty: { color: '#64748b', textAlign: 'center', marginTop: 24 },
});
