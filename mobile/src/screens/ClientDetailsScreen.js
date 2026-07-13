import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function ClientDetailsScreen({ route, navigation }) {
  const { client } = route.params || {};

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.header}>{client?.nom || 'Client'}</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Matricule</Text>
        <Text style={styles.value}>{client?.matricule}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Téléphone</Text>
        <Text style={styles.value}>{client?.telephone}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Ville / Quartier</Text>
        <Text style={styles.value}>{client?.ville} • {client?.quartier}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Offre d'abonnement</Text>
        <Text style={styles.value}>{client?.prix || 'Non renseigné'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Statut</Text>
        <Text style={[styles.value, client?.statut === 'actif' ? styles.active : styles.inactive]}>{client?.statut || 'Non renseigné'}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Abonnement</Text>
        {client?.subscription ? (
          <>
            <Text style={styles.value}>Du: {client.subscription.date_debut}</Text>
            <Text style={styles.value}>Au: {client.subscription.date_fin}</Text>
            <Text style={styles.value}>Actif: {client.subscription.est_actif ? 'Oui' : 'Non'}</Text>
          </>
        ) : (
          <Text style={styles.value}>Non renseigné</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f7fb', padding: 16 },
  backButton: { marginBottom: 12 },
  backText: { color: '#2563eb', fontWeight: '600' },
  header: { fontSize: 24, fontWeight: '700', color: '#0f172a', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  label: { color: '#64748b', marginBottom: 4 },
  value: { color: '#0f172a', fontWeight: '600' },
  active: { color: '#16a34a' },
  inactive: { color: '#dc2626' },
});
