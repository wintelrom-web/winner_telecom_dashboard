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
import Finance from './Finance';
import { getDashboardStats, getClients } from '../services/api';

const Dashboard = ({ onLogout }) => {
  const [stats, setStats] = useState({
    total_clients: 0,
    abonnements_actifs: 0,
    expirer: 0,
    échéances_proches: 0,
    total_versements: 0
  });
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState(() => {
    const savedView = localStorage.getItem('dashboard_currentView');
    return savedView || 'dashboard';
  });
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(() => {
    const savedViewingClient = localStorage.getItem('dashboard_viewingClient');
    return savedViewingClient ? JSON.parse(savedViewingClient) : null;
  });
  const [modals, setModals] = useState({
    addClient: false,
    settings: false
  });
  const [filterVille, setFilterVille] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [cardFilter, setCardFilter] = useState(null);
  const [cardFilterTitle, setCardFilterTitle] = useState('');
  const [fetchingFiltered, setFetchingFiltered] = useState(false);

  useEffect(() => {
    localStorage.setItem('dashboard_currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    if (viewingClient) {
      localStorage.setItem('dashboard_viewingClient', JSON.stringify(viewingClient));
    } else {
      localStorage.removeItem('dashboard_viewingClient');
    }
  }, [viewingClient]);

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
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  useEffect(() => {
    if (currentView === 'filtered_clients') {
      const fetchFilteredClients = async () => {
        setFetchingFiltered(true);
        try {
          const params = {};
          if (cardFilter) {
            params.statut = cardFilter;
          }
          const data = await getClients(params);
          setClients(data);
        } catch (error) {
          console.error('Error fetching filtered clients:', error);
        } finally {
          setFetchingFiltered(false);
        }
      };
      fetchFilteredClients();
    }
  }, [currentView, cardFilter]);

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
    const filteredSearch = 
      client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.quartier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telephone.includes(searchTerm);
    
    if (!filteredSearch) return false;
    
    if (filterVille && client.ville !== filterVille) return false;
    
    if (filterMonth) {
      const clientMonth = client.subscription?.date_fin ? 
        new Date(client.subscription.date_fin).getMonth() + 1 : null;
      if (clientMonth !== parseInt(filterMonth)) return false;
    }
    
    if (filterYear) {
      const clientYear = client.subscription?.date_fin ? 
        new Date(client.subscription.date_fin).getFullYear() : null;
      if (clientYear !== parseInt(filterYear)) return false;
    }
    
    return true;
  }) : [];

  const handleOpenModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
  };

  const handleCloseModal = (modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
  };

  const handleClientAdded = async () => {
    await fetchData();
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
  };

  const handleClientUpdated = async () => {
    await fetchData();
    if (viewingClient) {
      const updatedClients = await getClients();
      const updatedClient = updatedClients.find(c => c.id === viewingClient.id);
      if (updatedClient) {
        setViewingClient(updatedClient);
      }
    }
    setEditingClient(null);
  };

  const handleClientDeleted = async () => {
    await fetchData();
    setEditingClient(null);
  };

  const handleBackFromEdit = () => {
    setEditingClient(null);
  };

  const handleGoHome = () => {
    setCurrentView('dashboard');
  };

  const handleViewClient = (client) => {
    try {
      if (!client || !client.id) {
        console.error('Invalid client data:', client);
        alert('Erreur: Données du client invalides');
        return;
      }
      setViewingClient(client);
      setCurrentView('info');
    } catch (error) {
      console.error('Error navigating to client info:', error);
      alert('Erreur lors de l\'affichage des informations du client');
    }
  };

  const handleBackFromInfo = () => {
    setViewingClient(null);
    setCurrentView('dashboard');
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const handleManagePayment = async (client, action = 'manage') => {
    try {
      if (action === 'extend') {
        const { payerAbonnement } = await import('../services/api');
        const result = await payerAbonnement(client.id);
        
        alert(`Paiement effectué avec succès!\n\nClient: ${result.client_nom}\nMatricule: ${result.client_matricule}\nMontant: ${result.prix}\nDate début: ${result.date_debut}\nDate fin: ${result.date_fin}\nJours restants: ${result.jours_restants}`);
        
        const updatedClient = { ...client, subscription: { ...client.subscription, date_debut: result.date_debut, date_fin: result.date_fin, jours_restants: result.jours_restants, est_actif: true } };
        setViewingClient(updatedClient);
        fetchData();
      } else {
        alert(`Gestion du paiement pour ${client.nom} - Fonctionnalité à implémenter`);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Erreur lors du traitement du paiement. Veuillez réessayer.');
    }
  };

  const handleCardClick = async (cardId) => {
    let filter = null;
    let title = '';
    switch (cardId) {
      case 'total':
        title = 'Tous les Clients';
        break;
      case 'actifs':
        filter = 'actif';
        title = 'Abonnements Actifs';
        break;
      case 'expirer':
        filter = 'expiré';
        title = 'Clients Expirés';
        break;
      case 'échéances':
        filter = 'échéance';
        title = 'Échéances Proches';
        break;
    }
    setCardFilter(filter);
    setCardFilterTitle(title);
    setCurrentView('filtered_clients');
    setSearchTerm('');
    setFilterVille('');
    setFilterMonth('');
    setFilterYear('');
  };

  const handleRefreshFiltered = async () => {
    try {
      const params = {};
      if (cardFilter) {
        params.statut = cardFilter;
      }
      const data = await getClients(params);
      setClients(data);
    } catch (error) {
      console.error('Error refreshing filtered clients:', error);
    }
  };

  const handleBackFromFiltered = async () => {
    await fetchData();
    setCurrentView('dashboard');
  };

  const handleAction = (action) => {
    switch (action) {
      case 'addClient':
        handleOpenModal('addClient');
        break;
      case 'clientDetails':
        setCurrentView('dashboard');
        break;
      case 'reports':
        setCurrentView('reports');
        break;
      case 'finance':
        setCurrentView('finance');
        break;
      case 'settings':
        handleOpenModal('settings');
        break;
      default:
        console.log(`${action} clicked`);
    }
  };

  if ((loading && currentView === 'dashboard') || (fetchingFiltered && currentView === 'filtered_clients')) {
    return (
      <div className="loading-container">
        <div className="loading-text">Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Header onLogout={onLogout} onGoHome={handleGoHome} />
      <div className="container" style={{ padding: '1.5rem 1rem' }}>
        {editingClient ? (
          <Edit 
            client={editingClient}
            onBack={handleBackFromEdit}
            onClientUpdated={handleClientUpdated}
            onClientDeleted={handleClientDeleted}
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
                  filterVille={filterVille}
                  setFilterVille={setFilterVille}
                  filterMonth={filterMonth}
                  setFilterMonth={setFilterMonth}
                  filterYear={filterYear}
                  setFilterYear={setFilterYear}
                />
              </div>
            )}

            {currentView === 'filtered_clients' && (
              <div>
                <button 
                  onClick={handleBackFromFiltered} 
                  className="btn btn-secondary"
                  style={{ marginBottom: '1rem' }}
                >
                  ← Retour au Dashboard
                </button>
                <h2 style={{ marginBottom: '1rem' }}>{cardFilterTitle}</h2>
                <ClientTable 
                  clients={filteredClients} 
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  onEditClient={handleEditClient}
                  onRefresh={handleRefreshFiltered}
                  onViewClient={handleViewClient}
                  filterVille={filterVille}
                  setFilterVille={setFilterVille}
                  filterMonth={filterMonth}
                  setFilterMonth={setFilterMonth}
                  filterYear={filterYear}
                  setFilterYear={setFilterYear}
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
            {currentView === 'finance' && (
              <div>
                <button 
                  onClick={() => handleViewChange('dashboard')} 
                  className="btn btn-secondary"
                  style={{ marginBottom: '1rem' }}
                >
                  ← Retour au Dashboard
                </button>
                <Finance onBack={() => handleViewChange('dashboard')} />
              </div>
            )}
            {currentView === 'info' && viewingClient && (
              <Info 
                client={viewingClient}
                onBack={handleBackFromInfo}
                onEdit={handleEditClient}
                onManagePayment={handleManagePayment}
                onRefresh={fetchData}
              />
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
