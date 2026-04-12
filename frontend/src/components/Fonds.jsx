import React, { useState, useEffect } from 'react';
import { ArrowLeft, DollarSign, Calendar, User, Filter, TrendingUp } from 'lucide-react';
import { getPayments } from '../services/api';

const Fonds = ({ onBack }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, [filterMonth, filterYear]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      let url = '/payments/';
      const params = new URLSearchParams();
      
      if (filterMonth) params.append('month', filterMonth);
      if (filterYear) params.append('year', filterYear);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
      
      const response = await getPayments(url);
      setPayments(response.data || []);
      
      // Calculer le total
      const total = response.data.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      setTotalAmount(total);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case '1Mo': return '#10b981';
      case 'Access': return '#3b82f6';
      case 'Premium': return '#f59e0b';
      case 'VIP': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: '#e5e7eb',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '1rem'
          }}
        >
          <ArrowLeft size={18} />
          Retour
        </button>
        
        <h1 style={{ margin: 0, fontSize: '1.75rem', color: '#1f2937' }}>
          Fonds - Suivi des Paiements
        </h1>
      </div>

      {/* Stat Card */}
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        borderRadius: '16px',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <TrendingUp size={48} />
          <div>
            <p style={{ margin: 0, fontSize: '1.125rem', opacity: 0.9 }}>Total des Versements</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '2.5rem', fontWeight: 'bold' }}>
              {totalAmount.toLocaleString()}F
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', opacity: 0.8 }}>
              {payments.length} paiement{payments.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <Filter size={20} />
        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem'
          }}
        >
          <option value="">Mois</option>
          <option value="1">Janvier</option>
          <option value="2">Février</option>
          <option value="3">Mars</option>
          <option value="4">Avril</option>
          <option value="5">Mai</option>
          <option value="6">Juin</option>
          <option value="7">Juillet</option>
          <option value="8">Août</option>
          <option value="9">Septembre</option>
          <option value="10">Octobre</option>
          <option value="11">Novembre</option>
          <option value="12">Décembre</option>
        </select>
        
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '0.875rem'
          }}
        >
          <option value="">Année</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
          <option value="2027">2027</option>
          <option value="2028">2028</option>
        </select>
        
        {(filterMonth || filterYear) && (
          <button
            onClick={() => {
              setFilterMonth('');
              setFilterYear('');
            }}
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '0.875rem',
              cursor: 'pointer',
              background: '#f3f4f6'
            }}
          >
            Effacer
          </button>
        )}
      </div>

      {/* Payments Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Chargement...</p>
        </div>
      ) : payments.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <DollarSign size={48} style={{ color: '#9ca3af', marginBottom: '1rem' }} />
          <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
            Aucun paiement trouvé
          </p>
          <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
            {filterMonth || filterYear ? 'Essayez de modifier les filtres' : 'Les paiements apparaîtront ici lorsque les clients paieront'}
          </p>
        </div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb' }}>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>
                  Client
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>
                  Montant
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>
                  Type
                </th>
                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', color: '#374151' }}>
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={16} style={{ color: '#6b7280' }} />
                      <div>
                        <div style={{ fontWeight: '500', color: '#1f2937' }}>{payment.username}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {payment.client?.matricule || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      background: '#dcfce7',
                      color: '#166534',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {payment.formatted_amount}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      background: `${getTypeColor(payment.type)}20`,
                      color: getTypeColor(payment.type),
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}>
                      {payment.type}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280' }}>
                      <Calendar size={14} />
                      {formatDate(payment.payment_date)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Fonds;
