import React, { useState, useEffect } from 'react';
import { FileText, TrendingUp, Users, DollarSign, Download, Calendar, AlertTriangle, Clock, MapPin, RefreshCw, FileSpreadsheet, PieChart, BarChart3 } from 'lucide-react';
import { getClients, getDashboardStats, getPayments } from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Reports = () => {
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({});
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsData, statsData, paymentsData] = await Promise.all([
          getClients(),
          getDashboardStats(),
          getPayments()
        ]);
        setClients(clientsData);
        setStats(statsData);
        setPayments(Array.isArray(paymentsData) ? paymentsData : paymentsData.results || []);
      } catch (error) {
        console.error('Error fetching data for reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount || 0) + ' FCFA';
  };

  const getFilteredClients = () => {
    if (periodFilter === 'all') return clients;
    const now = new Date();
    return clients.filter(client => {
      if (!client.subscription?.date_fin) return false;
      const endDate = new Date(client.subscription.date_fin);
      switch (periodFilter) {
        case 'week': return (endDate - now) / (1000 * 60 * 60 * 24) <= 7;
        case 'month': return (endDate - now) / (1000 * 60 * 60 * 24) <= 30;
        case 'expired': return endDate < now;
        default: return true;
      }
    });
  };

  const filteredClients = getFilteredClients();

  const clientsByQuartier = filteredClients.reduce((acc, client) => {
    acc[client.quartier] = (acc[client.quartier] || 0) + 1;
    return acc;
  }, {});

  const clientsByVille = filteredClients.reduce((acc, client) => {
    acc[client.ville] = (acc[client.ville] || 0) + 1;
    return acc;
  }, {});

  const clientsWithSubscriptions = filteredClients.filter(client => client.subscription).length;
  const clientsWithoutSubscriptions = filteredClients.length - clientsWithSubscriptions;
  const totalFilteredClients = filteredClients.length || 1;
  const withSubsPercentage = (clientsWithSubscriptions / totalFilteredClients) * 100;
  const withoutSubsPercentage = (clientsWithoutSubscriptions / totalFilteredClients) * 100;

  const activeSubscriptions = filteredClients.filter(c => c.subscription?.est_actif).length;
  const expiredSubscriptions = filteredClients.filter(c => !c.subscription?.est_actif && c.subscription).length;

  const totalRevenue = payments.reduce((sum, p) => sum + (parseFloat(p.montant || p.amount || 0)), 0);
  const avgRevenuePerClient = clients.length > 0 ? totalRevenue / clients.length : 0;

  const today = new Date();
  const clientsAddedThisMonth = clients.filter(c => {
    if (!c.date_creation) return false;
    const created = new Date(c.date_creation);
    return created.getMonth() === today.getMonth() && created.getFullYear() === today.getFullYear();
  }).length;

  const getMonthlyData = () => {
    const monthlyData = {};
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    months.forEach(month => {
      monthlyData[month] = { clients: 0, revenue: 0 };
    });

    filteredClients.forEach(client => {
      if (client.date_creation) {
        const month = new Date(client.date_creation).getMonth();
        const monthName = months[month];
        monthlyData[monthName].clients++;
      }
    });

    payments.forEach(payment => {
      if (payment.date_paiement || payment.created_at) {
        const month = new Date(payment.date_paiement || payment.created_at).getMonth();
        const monthName = months[month];
        monthlyData[monthName].revenue += parseFloat(payment.montant || payment.amount || 0);
      }
    });

    return monthlyData;
  };

  const monthlyData = getMonthlyData();
  const lastSixMonths = Object.entries(monthlyData).slice(-6);
  const maxMonthlyClients = Math.max(...Object.values(monthlyData).map(d => d.clients), 1);
  const maxMonthlyRevenue = Math.max(...Object.values(monthlyData).map(d => d.revenue), 1);

  const subscriptionDistribution = [
    { label: 'Actifs', value: activeSubscriptions, color: '#10b981' },
    { label: 'Expirés', value: expiredSubscriptions, color: '#ef4444' },
    { label: 'Sans abonnement', value: clientsWithoutSubscriptions, color: '#6b7280' }
  ].filter(d => d.value > 0);

  const topVilles = Object.entries(clientsByVille)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const topQuartiers = Object.entries(clientsByQuartier)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8);

  const generatePDFReport = () => {
    const doc = new jsPDF();

    doc.setFont('helvetica');
    doc.setFontSize(22);
    doc.setTextColor(31, 41, 55);
    doc.text('Winner Telecom - Rapport', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text(`Période: ${new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`, 105, 28, { align: 'center' });
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`, 105, 35, { align: 'center' });

    let y = 50;

    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('1. Aperçu Général', 15, y);
    y += 10;

    doc.autoTable({
      head: [['Métrique', 'Valeur']],
      body: [
        ['Total Clients', stats.total_clients || 0],
        ['Abonnements Actifs', stats.abonnements_actifs || 0],
        ['Abonnements Expirés', stats.expirer || 0],
        ['Échéances Proches (7 jours)', stats.échéances_proches || 0],
        ['Clients ajoutés ce mois', clientsAddedThisMonth],
        ['Revenu total collecté', formatCurrency(totalRevenue)],
        ['Revenu moyen par client', formatCurrency(avgRevenuePerClient)]
      ],
      startY: y,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 15, right: 15 }
    });

    y = doc.lastAutoTable.finalY + 20;

    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('2. Couverture des Abonnements', 15, y);
    y += 10;

    doc.autoTable({
      head: [['Statut', 'Nombre', 'Pourcentage']],
      body: [
        ['Abonnements Actifs', activeSubscriptions, `${withSubsPercentage.toFixed(1)}%`],
        ['Abonnements Expirés', expiredSubscriptions, `${((expiredSubscriptions / totalFilteredClients) * 100).toFixed(1)}%`],
        ['Sans Abonnement', clientsWithoutSubscriptions, `${withoutSubsPercentage.toFixed(1)}%`]
      ],
      startY: y,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 15, right: 15 }
    });

    y = doc.lastAutoTable.finalY + 20;
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('3. Répartition par Ville', 15, y);
    y += 10;

    doc.autoTable({
      head: [['Ville', 'Nombre de Clients', 'Pourcentage']],
      body: topVilles.map(([ville, count]) => [
        ville,
        count,
        `${((count / totalFilteredClients) * 100).toFixed(1)}%`
      ]),
      startY: y,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 15, right: 15 }
    });

    y = doc.lastAutoTable.finalY + 20;
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('4. Répartition par Quartier', 15, y);
    y += 10;

    doc.autoTable({
      head: [['Quartier', 'Clients', 'Pourcentage']],
      body: topQuartiers.map(([quartier, count]) => [
        quartier,
        count,
        `${((count / totalFilteredClients) * 100).toFixed(1)}%`
      ]),
      startY: y,
      theme: 'grid',
      headStyles: { fillColor: [245, 158, 11], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 15, right: 15 }
    });

    y = doc.lastAutoTable.finalY + 20;
    if (y > 230) { doc.addPage(); y = 20; }

    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text('5. Détail des Clients', 15, y);
    y += 10;

    doc.autoTable({
      head: [['Matricule', 'Nom', 'Ville', 'Quartier', 'Téléphone', 'Prix', 'Échéance']],
      body: filteredClients.slice(0, 50).map(client => [
        client.matricule || 'N/A',
        client.nom || 'N/A',
        client.ville || 'N/A',
        client.quartier || 'N/A',
        client.telephone || 'N/A',
        client.prix || 'N/A',
        client.subscription?.date_fin ? formatDate(client.subscription.date_fin) : 'N/A'
      ]),
      startY: y,
      theme: 'grid',
      headStyles: { fillColor: [139, 92, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 15, right: 15 },
      styles: { fontSize: 7, cellPadding: 2 }
    });

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(`Winner Telecom - Rapport Clients - Page ${i}/${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save(`rapport-winner-telecom-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToCSV = () => {
    const headers = ['Matricule', 'Nom', 'Ville', 'Quartier', 'Téléphone', 'Prix', 'Date Échéance', 'Statut'];
    const rows = filteredClients.map(client => {
      const isExpired = client.subscription?.date_fin && new Date(client.subscription.date_fin) < new Date();
      return [
        client.matricule || '',
        client.nom || '',
        client.ville || '',
        client.quartier || '',
        client.telephone || '',
        client.prix || '',
        client.subscription?.date_fin ? formatDate(client.subscription.date_fin) : 'N/A',
        isExpired ? 'Expiré' : (client.subscription?.est_actif ? 'Actif' : 'Inactif')
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clients-winner-telecom-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      const [clientsData, statsData, paymentsData] = await Promise.all([
        getClients(),
        getDashboardStats(),
        getPayments()
      ]);
      setClients(clientsData);
      setStats(statsData);
      setPayments(Array.isArray(paymentsData) ? paymentsData : paymentsData.results || []);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Chargement des rapports...</div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div className="reports-header-content">
          <div>
            <h1>Rapports et Statistiques</h1>
            <p>Analyse complète de l'activité — {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              style={{
                padding: '0.875rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '0.875rem',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="all">Toutes les périodes</option>
              <option value="expired">Expirés seulement</option>
              <option value="month">Échéance sous 30 jours</option>
              <option value="week">Échéance sous 7 jours</option>
            </select>
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
              <RefreshCw size={16} />
              Actualiser
            </button>
            <button
              onClick={exportToCSV}
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.875rem 1.5rem',
                background: '#f59e0b',
                color: 'white',
                border: 'none'
              }}
            >
              <FileSpreadsheet size={16} />
              Export CSV
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

      <div className="reports-grid">
        <div className="report-card" style={{ gridColumn: 'span 2' }}>
          <div className="report-header">
            <div className="report-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <TrendingUp size={24} />
            </div>
            <h3>Aperçu Général</h3>
          </div>
          <div className="chart-overview">
            <div className="metric-item">
              <div className="metric-value">{stats.total_clients || 0}</div>
              <div className="metric-label"><Users size={14} style={{ marginRight: '0.25rem' }} />Total Clients</div>
            </div>
            <div className="metric-item">
              <div className="metric-value" style={{ color: '#10b981' }}>{activeSubscriptions}</div>
              <div className="metric-label"><DollarSign size={14} style={{ marginRight: '0.25rem' }} />Abonnements Actifs</div>
            </div>
            <div className="metric-item">
              <div className="metric-value" style={{ color: '#ef4444' }}>{stats.expirer || 0}</div>
              <div className="metric-label"><AlertTriangle size={14} style={{ marginRight: '0.25rem' }} />Expirés</div>
            </div>
            <div className="metric-item">
              <div className="metric-value" style={{ color: '#f59e0b' }}>{stats.échéances_proches || 0}</div>
              <div className="metric-label"><Clock size={14} style={{ marginRight: '0.25rem' }} />Échéances Proches</div>
            </div>
            <div className="metric-item">
              <div className="metric-value" style={{ color: '#8b5cf6' }}>{clientsAddedThisMonth}</div>
              <div className="metric-label"><Calendar size={14} style={{ marginRight: '0.25rem' }} />Nouveaux ce Mois</div>
            </div>
            <div className="metric-item">
              <div className="metric-value" style={{ color: '#10b981', fontSize: '1.1rem' }}>{formatCurrency(totalRevenue)}</div>
              <div className="metric-label"><DollarSign size={14} style={{ marginRight: '0.25rem' }} />Revenu Total</div>
            </div>
          </div>
        </div>

        <div className="report-card" style={{ gridColumn: 'span 2' }}>
          <div className="report-header">
            <div className="report-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
              <PieChart size={24} />
            </div>
            <h3>Statut des Abonnements</h3>
          </div>
          <div className="subscription-chart">
            {subscriptionDistribution.map((item, index) => {
              const percentage = totalFilteredClients > 0 ? (item.value / totalFilteredClients) * 100 : 0;
              return (
                <div key={index} className="subscription-bar">
                  <div className="subscription-label">
                    <div className="subscription-color" style={{ backgroundColor: item.color }}></div>
                    <span>{item.label}</span>
                  </div>
                  <div className="subscription-fill-container">
                    <div
                      className="subscription-fill"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: item.color
                      }}
                    ></div>
                    <span className="subscription-percentage">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="subscription-count">{item.value}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="report-card">
          <div className="report-header">
            <div className="report-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <MapPin size={24} />
            </div>
            <h3>Top Villes</h3>
          </div>
          <div className="mini-table-container">
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Ville</th>
                  <th>Clients</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {topVilles.map(([ville, count]) => (
                  <tr key={ville}>
                    <td>{ville}</td>
                    <td><strong>{count}</strong></td>
                    <td>{((count / totalFilteredClients) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
                {topVilles.length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: '#6b7280' }}>Aucune donnée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="report-card">
          <div className="report-header">
            <div className="report-icon" style={{ background: '#ede9fe', color: '#8b5cf6' }}>
              <MapPin size={24} />
            </div>
            <h3>Top Quartiers</h3>
          </div>
          <div className="mini-table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Quartier</th>
                  <th>Clients</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {topQuartiers.map(([quartier, count]) => (
                  <tr key={quartier}>
                    <td>{quartier}</td>
                    <td><strong>{count}</strong></td>
                    <td>{((count / totalFilteredClients) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
                {topQuartiers.length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', color: '#6b7280' }}>Aucune donnée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="charts-section">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <BarChart3 size={20} />
          Analyse Détaillée
        </h2>
        <div className="detailed-charts">
          <div className="chart-card">
            <h3>Nouveaux Clients par Mois</h3>
            <div className="monthly-chart">
              {lastSixMonths.map(([month, data]) => {
                const height = maxMonthlyClients > 0 ? (data.clients / maxMonthlyClients) * 100 : 0;
                return (
                  <div key={month} className="monthly-bar-group">
                    <div className="monthly-bar-blue" style={{ height: `${height}%` }}>
                      <span className="monthly-count">{data.clients}</span>
                    </div>
                    <span className="monthly-label">{month}</span>
                  </div>
                );
              })}
              {lastSixMonths.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </div>

          <div className="chart-card">
            <h3>Revenu Mensuel Estimé</h3>
            <div className="monthly-chart">
              {lastSixMonths.map(([month, data]) => {
                const height = maxMonthlyRevenue > 0 ? (data.revenue / maxMonthlyRevenue) * 100 : 0;
                return (
                  <div key={month} className="monthly-bar-group">
                    <div className="monthly-bar-green" style={{ height: `${height}%` }}>
                      <span className="monthly-count">{data.revenue > 0 ? `${(data.revenue / 1000).toFixed(0)}k` : '0'}</span>
                    </div>
                    <span className="monthly-label">{month}</span>
                  </div>
                );
              })}
              {lastSixMonths.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  Aucune donnée disponible
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="insights-section">
        <h2>Informations Clés</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon" style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>
              <TrendingUp size={20} />
            </div>
            <div className="insight-content">
              <h4>Taux de Rétention</h4>
              <p className="insight-value">{withSubsPercentage.toFixed(1)}%</p>
              <p className="insight-description">Clients avec abonnements actifs</p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
              <AlertTriangle size={20} />
            </div>
            <div className="insight-content">
              <h4>Alertes Échéances</h4>
              <p className="insight-value" style={{ color: periodFilter === 'expired' ? '#ef4444' : '#f59e0b' }}>
                {periodFilter === 'all' ? stats.échéances_proches || 0 : filteredClients.length} clients
              </p>
              <p className="insight-description">
                {periodFilter === 'expired' ? 'Abonnements expirés' : periodFilter === 'month' ? 'Échéance sous 30 jours' : periodFilter === 'week' ? 'Échéance sous 7 jours' : 'Abonnements expirant sous 7 jours'}
              </p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
              <MapPin size={20} />
            </div>
            <div className="insight-content">
              <h4>Zone Principale</h4>
              <p className="insight-value">{topVilles[0]?.[0] || 'N/A'}</p>
              <p className="insight-description">{topVilles[0]?.[1] || 0} clients — {topVilles[0]?.[0] ? `${((topVilles[0][1] / totalFilteredClients) * 100).toFixed(1)}%` : '0%'}</p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon" style={{ color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)' }}>
              <DollarSign size={20} />
            </div>
            <div className="insight-content">
              <h4>Revenu Moyen</h4>
              <p className="insight-value">{formatCurrency(avgRevenuePerClient)}</p>
              <p className="insight-description">Par client total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
