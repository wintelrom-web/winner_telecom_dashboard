import React, { useState, useEffect } from 'react';
import Header from './Header';
import StatsCards from './StatsCards';
import ActionButtons from './ActionButtons';
import ClientTable from './ClientTable';
import Modal from './Modal';
import AddClientForm from './AddClientForm';
import Reports from './Reports';
import Settings from './Settings';
import Edit from './Edit';
import Info from './Info';
import { getDashboardStats, getClients, blockClientAccess, activateClientAccess } from '../services/api';

const Dashboard = ({ onLogout }) => {
  const [stats, setStats] = useState({
    total_clients: 0,
    abonnements_actifs: 0,
    expirés: 0,
    échéances_proches: 0
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'reports', 'info'
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [modals, setModals] = useState({
    addClient: false,
    settings: false
  });
  const [filterStatus, setFilterStatus] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const fetchData = async () => {
    try {
      const [statsData, clientsData] = await Promise.all([
        getDashboardStats(),
        getClients()
      ]);
      setStats(statsData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  const handleDarkModeToggle = (enable) => {
    setDarkMode(enable);
    localStorage.setItem('darkMode', enable);
    if (enable) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  const filteredClients = Array.isArray(clients) ? clients.filter(client => {
    // First apply search term
    const matchesSearch = 
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.quartier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telephone.includes(searchTerm);
    
    // Then apply status filter from card click
    if (!matchesSearch) return false;
    
    if (filterStatus === null) return true;
    if (filterStatus === 'actif') return client.statut === 'actif';
    if (filterStatus === 'expiré') return client.statut === 'expiré';
    if (filterStatus === 'échéance') return client.subscription?.échéance_proche === true;
    
    return true;
  }) : [];

  const handleOpenModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const handleCloseModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const handleClientAdded = async () => {
    await fetchData(); // Refresh data after adding client
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
  };

  const handleClientUpdated = async () => {
    await fetchData(); // Refresh data after updating client
    setEditingClient(null);
  };

  const handleClientDeleted = async () => {
    await fetchData(); // Refresh data after deleting client
    setEditingClient(null);
  };

  const handleBackFromEdit = () => {
    setEditingClient(null);
  };

  const handleViewClient = (client) => {
    setViewingClient(client);
    setCurrentView('info');
  };

  const handleBackFromInfo = () => {
    setViewingClient(null);
    setCurrentView('dashboard');
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleBlockAccess = async (clientId) => {
    try {
      await blockClientAccess(clientId);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error blocking access:', error);
      alert('Erreur lors du blocage de l\'accès');
    }
  };

  const handleActivateAccess = async (clientId) => {
    try {
      await activateClientAccess(clientId);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error activating access:', error);
      alert('Erreur lors de l\'activation de l\'accès');
    }
  };

  const handleManagePayment = (client) => {
    // Ouvrir une modal de paiement ou rediriger vers une page de paiement
    alert(`Gestion du paiement pour ${client.nom} - Fonctionnalité à implémenter`);
  };

  const handleCardClick = (cardId) => {
    // cardId can be: 'total', 'actifs', 'expirés', 'échéances'
    if (cardId === 'total') {
      setFilterStatus(null); // Show all
      setSearchTerm('');
    } else if (cardId === 'actifs') {
      setFilterStatus('actif');
      setSearchTerm('');
    } else if (cardId === 'expirés') {
      setFilterStatus('expiré');
      setSearchTerm('');
    } else if (cardId === 'échéances') {
      setFilterStatus('échéance');
      setSearchTerm('');
    }
  };

  const handleAction = (action) => {
    switch (action) {
      case 'addClient':
        handleOpenModal('addClient');
        break;
      case 'reports':
        setCurrentView('reports');
        break;
      case 'settings':
        handleOpenModal('settings');
        break;
      default:
        console.log(`${action} clicked`);
    }
  };

  if (loading && currentView === 'dashboard') {
    return (
      <div className="loading-container">
        <div className="loading-text">Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header onLogout={onLogout} />
      <div className="container" style={{ padding: '1.5rem 1rem' }}>
        {editingClient ? (
          <Edit 
            client={editingClient}
            onBack={handleBackFromEdit}
            onClientUpdated={handleClientUpdated}
            onClientDeleted={handleClientDeleted}
          />
        ) : viewingClient && currentView === 'info' ? (
          <Info 
            client={viewingClient}
            onBack={handleBackFromInfo}
            onEdit={handleEditClient}
            onRefresh={fetchData}
            onBlockAccess={handleBlockAccess}
            onActivateAccess={handleActivateAccess}
            onManagePayment={handleManagePayment}
          />
        ) : (
          <>
            {currentView === 'dashboard' && (
              <div className="dashboard-content">
                <StatsCards stats={stats} onCardClick={handleCardClick} />
                <ActionButtons onAction={handleAction} />
                <ClientTable 
                  clients={filteredClients} 
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onEditClient={handleEditClient}
                  onRefresh={fetchData}
                  onViewClient={handleViewClient}
                />
              </div>
            )}

            {currentView === 'reports' && (
              <div>
                <button 
                  onClick={() => handleViewChange('dashboard')} 
                  className="btn btn-secondary"
                  style={{ marginBottom: '1rem' }}
                >
                  ← Retour au Dashboard
                </button>
                <Reports />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <Modal 
        isOpen={modals.addClient} 
        onClose={() => handleCloseModal('addClient')}
        title="Ajouter un Nouveau Client"
      >
        <AddClientForm 
          onClose={() => handleCloseModal('addClient')}
          onClientAdded={handleClientAdded}
        />
      </Modal>

      <Modal 
        isOpen={modals.settings} 
        onClose={() => handleCloseModal('settings')}
        title="Paramètres"
      >
        <Settings darkMode={darkMode} onDarkModeToggle={handleDarkModeToggle} />
      </Modal>
    </div>
  );
};

export default Dashboard;
