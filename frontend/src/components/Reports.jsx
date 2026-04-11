import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, Users, DollarSign, PieChart, BarChart3, Download, FileDown, Calendar, UserCheck, AlertTriangle, Clock, MapPin } from 'lucide-react';
import { getClients, getDashboardStats } from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reports = () => {
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, statsData] = await Promise.all([
          getClients(),
          getDashboardStats()
        ]);
        setClients(clientsData);
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching data for reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Chargement des rapports...</div>
      </div>
    );
  }

  // Calculate additional metrics with real data
  const clientsByStatus = clients.reduce((acc, client) => {
    acc[client.statut] = (acc[client.statut] || 0) + 1;
    return acc;
  }, {});

  const clientsByQuartier = clients.reduce((acc, client) => {
    acc[client.quartier] = (acc[client.quartier] || 0) + 1;
    return acc;
  }, {});

  const clientsWithSubscriptions = clients.filter(client => client.subscription).length;
  const clientsWithoutSubscriptions = clients.length - clientsWithSubscriptions;

  // Calculate real subscription metrics
  const activeSubscriptions = clients.filter(client => 
    client.subscription && client.subscription.est_actif && !client.subscription.est_expiré
  ).length;
  
  const expiredSubscriptions = clients.filter(client => 
    client.subscription && client.subscription.est_expiré
  ).length;

  const expiringSoonSubscriptions = clients.filter(client => 
    client.subscription && client.subscription.échéance_proche
  ).length;

  // Calculate percentages for charts
  const totalClients = clients.length || 1; // Prevent division by zero
  const activePercentage = ((clientsByStatus.actif || 0) / totalClients) * 100;
  const expiredPercentage = ((clientsByStatus.expiré || 0) / totalClients) * 100;
  const blockedPercentage = ((clientsByStatus.bloqué || 0) / totalClients) * 100;
  const withSubsPercentage = (clientsWithSubscriptions / totalClients) * 100;
  const withoutSubsPercentage = (clientsWithoutSubscriptions / totalClients) * 100;

  // Real monthly data based on client creation dates
  const getMonthlyData = () => {
    const monthlyData = {};
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    const currentMonth = new Date().getMonth();
    
    // Initialize all months with 0
    months.forEach(month => {
      monthlyData[month] = 0;
    });

    // Count clients by month
    clients.forEach(client => {
      const month = new Date(client.date_creation || client.date_mise_a_jour).getMonth();
      const monthName = months[month];
      monthlyData[monthName]++;
    });

    return Object.entries(monthlyData).slice(-6); // Last 6 months
  };

  const monthlyData = getMonthlyData();
  const maxMonthlyCount = Math.max(...monthlyData.map(([, count]) => count), 1);

  const chartData = [
    { label: 'Actifs', value: activePercentage, color: '#10b981', count: clientsByStatus.actif || 0 },
    { label: 'Expirés', value: expiredPercentage, color: '#ef4444', count: clientsByStatus.expiré || 0 },
    { label: 'Bloqués', value: blockedPercentage, color: '#f97316', count: clientsByStatus.bloqué || 0 }
  ];

  const subscriptionData = [
    { label: 'Avec Abonnement', value: withSubsPercentage, color: '#2563eb', count: clientsWithSubscriptions },
    { label: 'Sans Abonnement', value: withoutSubsPercentage, color: '#6b7280', count: clientsWithoutSubscriptions }
  ];

  // Enhanced PDF Generation with real data
  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Add custom font for better support (you might need to add this)
    doc.setFont('helvetica');
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(31, 41, 55);
    doc.text('Rapport des Clients et Abonnements', 105, 20, { align: 'center' });
    
    // Date
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 105, 30, { align: 'center' });
    
    // Statistics Section
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Statistiques Générales', 20, 50);
    
    // Stats Table
    const statsData = [
      ['Métrique', 'Valeur'],
      ['Total Clients', stats.total_clients || 0],
      ['Abonnements Actifs', stats.abonnements_actifs || 0],
      ['Échéances Proches', stats.échéances_proches || 0],
      ['Expirés', stats.expirés || 0]
    ];
    
    doc.autoTable({
      head: [statsData[0]],
      body: statsData.slice(1),
      startY: 60,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 20, right: 20 }
    });
    
    // Client Status Section
    const finalY = doc.lastAutoTable.finalY || 120;
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Répartition par Statut', 20, finalY + 20);
    
    const statusData = [
      ['Statut', 'Nombre', 'Pourcentage'],
      ['Actifs', clientsByStatus.actif || 0, `${activePercentage.toFixed(1)}%`],
      ['Expirés', clientsByStatus.expiré || 0, `${expiredPercentage.toFixed(1)}%`],
      ['Bloqués', clientsByStatus.bloqué || 0, `${blockedPercentage.toFixed(1)}%`]
    ];
    
    doc.autoTable({
      head: [statusData[0]],
      body: statusData.slice(1),
      startY: finalY + 30,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 20, right: 20 }
    });
    
    // Subscription Coverage Section
    const finalY2 = doc.lastAutoTable.finalY || 180;
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Couverture des Abonnements', 20, finalY2 + 20);
    
    const subscriptionDataPDF = [
      ['Type', 'Nombre', 'Pourcentage'],
      ['Avec Abonnement', clientsWithSubscriptions, `${withSubsPercentage.toFixed(1)}%`],
      ['Sans Abonnement', clientsWithoutSubscriptions, `${withoutSubsPercentage.toFixed(1)}%`]
    ];
    
    doc.autoTable({
      head: [subscriptionDataPDF[0]],
      body: subscriptionDataPDF.slice(1),
      startY: finalY2 + 30,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 20, right: 20 }
    });
    
    // Quartier Distribution Section
    const finalY3 = doc.lastAutoTable.finalY || 240;
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('Répartition par Quartier', 20, finalY3 + 20);
    
    const quartierData = [['Quartier', 'Nombre', 'Pourcentage']];
    Object.entries(clientsByQuartier)
      .sort(([,a], [,b]) => b - a)
      .forEach(([quartier, count]) => {
        const percentage = (count / totalClients) * 100;
        quartierData.push([quartier, count, `${percentage.toFixed(1)}%`]);
      });
    
    doc.autoTable({
      head: [quartierData[0]],
      body: quartierData.slice(1),
      startY: finalY3 + 30,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 20, right: 20 }
    });
    
    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text('Winner Telecom - Système de Gestion des Clients', 105, pageHeight - 10, { align: 'center' });
    
    // Save the PDF
    doc.save(`rapport-clients-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Add refresh function
  const refreshData = async () => {
    setLoading(true);
    try {
      const [clientsData, statsData] = await Promise.all([
        getClients(),
        getDashboardStats()
      ]);
      setClients(clientsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="reports-header-content">
          <div>
            <h1>Rapports et Statistiques</h1>
            <p>Aperçu détaillé de l'activité des clients et abonnements</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={refreshData}
              className="btn btn-secondary"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.875rem 1.5rem'
              }}
              disabled={loading}
            >
              <Calendar size={16} />
              Actualiser
            </button>
            <button 
              onClick={generatePDFReport}
              className="btn btn-primary"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '0.875rem 1.75rem'
              }}
            >
              <Download size={16} />
              Télécharger PDF
            </button>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="reports-grid">
        <div className="report-card">
          <div className="report-header">
            <div className="report-icon">
              <TrendingUp size={24} />
            </div>
            <h3>Aperçu Général</h3>
          </div>
          <div className="chart-overview">
            <div className="metric-item">
              <div className="metric-value">{stats.total_clients || 0}</div>
              <div className="metric-label">
                <Users size={14} style={{ marginRight: '0.25rem' }} />
                Total Clients
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{stats.abonnements_actifs || 0}</div>
              <div className="metric-label">
                <UserCheck size={14} style={{ marginRight: '0.25rem' }} />
                Abonnements Actifs
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{stats.échéances_proches || 0}</div>
              <div className="metric-label">
                <Clock size={14} style={{ marginRight: '0.25rem' }} />
                Échéances Proches
              </div>
            </div>
            <div className="metric-item">
              <div className="metric-value">{stats.expirés || 0}</div>
              <div className="metric-label">
                <AlertTriangle size={14} style={{ marginRight: '0.25rem' }} />
                Expirés
              </div>
            </div>
          </div>
        </div>

        <div className="report-card">
          <div className="report-header">
            <div className="report-icon">
              <Users size={24} />
            </div>
            <h3>Statut des Clients</h3>
          </div>
          <div className="pie-chart-container">
            {chartData.map((item, index) => (
              <div key={index} className="pie-segment">
                <div className="pie-label">
                  <div 
                    className="pie-color" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span>{item.label}</span>
                </div>
                <div className="pie-bar">
                  <div 
                    className="pie-fill" 
                    style={{ 
                      width: `${item.value}%`,
                      backgroundColor: item.color 
                    }}
                  ></div>
                </div>
                <div className="pie-count">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-card">
          <div className="report-header">
            <div className="report-icon">
              <DollarSign size={24} />
            </div>
            <h3>Couverture Abonnements</h3>
          </div>
          <div className="subscription-chart">
            {subscriptionData.map((item, index) => (
              <div key={index} className="subscription-bar">
                <div className="subscription-label">
                  <div 
                    className="subscription-color" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span>{item.label}</span>
                </div>
                <div className="subscription-fill-container">
                  <div 
                    className="subscription-fill" 
                    style={{ 
                      width: `${item.value}%`,
                      backgroundColor: item.color 
                    }}
                  ></div>
                  <span className="subscription-percentage">{item.value.toFixed(1)}%</span>
                </div>
                <div className="subscription-count">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-card">
          <div className="report-header">
            <div className="report-icon">
              <BarChart3 size={24} />
            </div>
            <h3>Répartition par Quartier</h3>
          </div>
          <div className="bar-chart">
            {Object.entries(clientsByQuartier)
              .sort(([,a], [,b]) => b - a)
              .map(([quartier, count]) => {
                const percentage = (count / totalClients) * 100;
                return (
                  <div key={quartier} className="bar-item">
                    <div className="bar-label">{quartier}</div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                      <div className="bar-value">{count}</div>
                    </div>
                    <div className="bar-percentage">{percentage.toFixed(1)}%</div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Real-time Insights Summary */}
      <div className="insights-section">
        <h2>Informations Clés en Temps Réel</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
              <TrendingUp size={20} />
            </div>
            <div className="insight-content">
              <h4>Taux de Croissance</h4>
              <p className="insight-value">+{((monthlyData[monthlyData.length - 1]?.[1] || 0) - (monthlyData[monthlyData.length - 2]?.[1] || 0))} ce mois</p>
              <p className="insight-description">Nouveaux clients vs mois précédent</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
              <AlertTriangle size={20} />
            </div>
            <div className="insight-content">
              <h4>Alertes Échéances</h4>
              <p className="insight-value">{stats.échéances_proches || 0} clients</p>
              <p className="insight-description">Abonnements expirant dans 7 jours</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
              <DollarSign size={20} />
            </div>
            <div className="insight-content">
              <h4>Taux de Rétention</h4>
              <p className="insight-value">{withSubsPercentage.toFixed(1)}%</p>
              <p className="insight-description">Clients avec abonnements actifs</p>
            </div>
          </div>
          
          <div className="insight-card">
            <div className="insight-icon" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }}>
              <MapPin size={20} />
            </div>
            <div className="insight-content">
              <h4>Zone Principale</h4>
              <p className="insight-value">
                {Object.entries(clientsByQuartier).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
              </p>
              <p className="insight-description">Quartier avec le plus de clients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Charts Section */}
      <div className="charts-section">
        <h2>Analyse Détaillée</h2>
        
        <div className="detailed-charts">
          <div className="chart-card">
            <h3>Évolution Mensuelle des Clients</h3>
            <div className="monthly-chart">
              {monthlyData.map(([month, count], index) => {
                const height = maxMonthlyCount > 0 ? (count / maxMonthlyCount) * 100 : 0;
                const isActive = index === monthlyData.length - 1;
                return (
                  <div key={month} className={`monthly-bar ${isActive ? 'active' : ''}`} style={{ height: `${height}%` }}>
                    <span>{month}</span>
                    <div className="monthly-count">{count}</div>
                  </div>
                );
              })}
            </div>
            <div className="monthly-legend">
              <span>Nouveaux clients par mois</span>
              <span>Total: {totalClients} clients</span>
            </div>
          </div>

          <div className="chart-card">
            <h3>Performance par Statut</h3>
            <div className="performance-grid">
              <div className="performance-item">
                <div className="performance-circle" style={{ 
                  background: `conic-gradient(#10b981 0% ${activePercentage}%, #e5e7eb ${activePercentage}% 100%)` 
                }}>
                  <div className="performance-center">
                    <div className="performance-number">{activePercentage.toFixed(0)}%</div>
                    <div className="performance-label">Actifs</div>
                  </div>
                </div>
              </div>
              <div className="performance-item">
                <div className="performance-circle" style={{ 
                  background: `conic-gradient(#ef4444 0% ${expiredPercentage}%, #e5e7eb ${expiredPercentage}% 100%)` 
                }}>
                  <div className="performance-center">
                    <div className="performance-number">{expiredPercentage.toFixed(0)}%</div>
                    <div className="performance-label">Expirés</div>
                  </div>
                </div>
              </div>
              <div className="performance-item">
                <div className="performance-circle" style={{ 
                  background: `conic-gradient(#f97316 0% ${blockedPercentage}%, #e5e7eb ${blockedPercentage}% 100%)` 
                }}>
                  <div className="performance-center">
                    <div className="performance-number">{blockedPercentage.toFixed(0)}%</div>
                    <div className="performance-label">Bloqués</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
