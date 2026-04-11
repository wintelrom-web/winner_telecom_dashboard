import React, { useState } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Download, FileSpreadsheet } from 'lucide-react';
import { getClients } from '../services/api';

const Settings = ({ onBack, darkMode, onDarkModeToggle }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const toggleDarkMode = () => {
    if (onDarkModeToggle) {
      onDarkModeToggle(!darkMode);
    }
  };

  const exportClientData = async () => {
    setLoading(true);
    try {
      const clients = await getClients();
      
      if (clients.length === 0) {
        showMessage('error', 'Aucune donnée client à exporter');
        return;
      }

      exportPDF(clients);
      
      showMessage('success', `${clients.length} clients exportés avec succès`);
    } catch (error) {
      console.error('Error exporting clients:', error);
      showMessage('error', 'Erreur lors de l\'exportation des données');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = (clients) => {
    const printWindow = window.open('', '_blank');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Liste des Clients - Winner Telecom</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1e3a8a; text-align: center; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
          th { background-color: #1e3a8a; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .status-actif { color: #10b981; font-weight: bold; }
          .status-expiré { color: #ef4444; font-weight: bold; }
          .status-bloqué { color: #7c3aed; font-weight: bold; }
          .footer { margin-top: 20px; text-align: center; font-size: 10px; color: #666; }
        </style>
      </head>
      <body>
        <h1>WINNER TELECOM - Liste des Clients</h1>
        <table>
          <thead>
            <tr>
              <th>Matricule</th>
              <th>Nom</th>
              <th>Quartier</th>
              <th>Téléphone</th>
              <th>Statut</th>
              <th>Expiration</th>
              <th>Jours Restants</th>
            </tr>
          </thead>
          <tbody>
            ${clients.map(client => `
              <tr>
                <td>${client.matricule}</td>
                <td>${client.nom}</td>
                <td>${client.quartier}</td>
                <td>${client.telephone}</td>
                <td class="status-${client.statut}">${client.statut.toUpperCase()}</td>
                <td>${client.subscription?.date_fin || '-'}</td>
                <td>${client.subscription?.jours_restants ?? '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          Document généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
        </div>
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerTitle}>
            <h1 style={styles.title}>
              <SettingsIcon size={24} style={{ marginRight: '0.5rem' }} />
              Paramètres
            </h1>
            <p style={styles.subtitle}>Personnalisez votre expérience</p>
          </div>
          {onBack && (
            <button onClick={onBack} style={styles.backButton}>
              ← Retour
            </button>
          )}
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div style={{
          ...styles.message,
          background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: message.type === 'success' ? '#065f46' : '#991b1b'
        }}>
          {message.text}
        </div>
      )}

      <div style={styles.content}>
        {/* Dark Mode Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
            <h2 style={styles.sectionTitle}>Mode {darkMode ? 'Sombre' : 'Clair'}</h2>
          </div>
          
          <div style={styles.card}>
            <div style={styles.cardContent}>
              <div style={styles.iconBox}>
                {darkMode ? <Moon size={24} /> : <Sun size={24} />}
              </div>
              <div style={styles.cardText}>
                <h3 style={styles.cardTitle}>Mode {darkMode ? 'Sombre' : 'Clair'}</h3>
                <p style={styles.cardDesc}>
                  {darkMode 
                    ? 'Le mode sombre est activé'
                    : 'Le mode clair est activé'}
                </p>
              </div>
            </div>
            <button 
              onClick={toggleDarkMode}
              style={{
                ...styles.toggleButton,
                background: darkMode ? '#3b82f6' : '#e5e7eb',
                color: darkMode ? 'white' : '#374151',
                border: 'none'
              }}
            >
              {darkMode ? <Moon size={16} /> : <Sun size={16} />}
              {darkMode ? 'Sombre' : 'Clair'}
            </button>
          </div>
        </div>

        {/* Export Data Section */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <Download size={20} />
            <h2 style={styles.sectionTitle}>Exporter les Données</h2>
          </div>
          
          <div style={styles.card}>
            <div style={styles.cardContent}>
              <div style={{...styles.iconBox, background: '#dbeafe', color: '#3b82f6'}}>
                <FileSpreadsheet size={24} />
              </div>
              <div style={styles.cardText}>
                <h3 style={styles.cardTitle}>Exporter les Clients en PDF</h3>
                <p style={styles.cardDesc}>Téléchargez toutes les données des clients</p>
              </div>
            </div>
            
            <button 
              onClick={exportClientData}
              disabled={loading}
              style={{
                ...styles.exportButton,
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? (
                <>
                  <span style={styles.spinner}></span>
                  Export...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Exporter PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '1rem',
    maxWidth: '600px',
    margin: '0 auto'
  },
  header: {
    marginBottom: '1.5rem'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  headerTitle: {
    flex: 1,
    minWidth: '200px'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937',
    margin: '0 0 0.25rem 0',
    display: 'flex',
    alignItems: 'center'
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0
  },
  backButton: {
    padding: '0.5rem 1rem',
    background: '#e5e7eb',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151'
  },
  message: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    textAlign: 'center',
    fontSize: '0.875rem',
    fontWeight: '500'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },
  section: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.25rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
    paddingBottom: '0.75rem',
    borderBottom: '1px solid #e5e7eb',
    color: '#3b82f6'
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  cardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  iconBox: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: '#ecfdf5',
    color: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  cardText: {
    flex: 1
  },
  cardTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 0.25rem 0'
  },
  cardDesc: {
    fontSize: '0.8125rem',
    color: '#6b7280',
    margin: 0
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    borderRadius: '8px',
    fontSize: '0.8125rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  exportButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  }
};

export default Settings;
