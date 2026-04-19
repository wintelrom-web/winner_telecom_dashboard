import axios from 'axios';

// Configuration API pour différents environnements
const getApiBaseUrl = () => {
  if (import.meta.env.PROD) {
    // En production, utiliser l'URL du backend déployé
    return 'https://winner-telecom-dashboard-best.onrender.com/api';
  } else {
    // En développement, utiliser le proxy local
    return '/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

// Add request/response logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    console.log(`Response received: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    if (error.code === 'NETWORK_ERROR' || error.code === 'ERR_NETWORK') {
      console.error('Network error - please check if the backend server is running on port 8000');
    }
    return Promise.reject(error);
  }
);

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard-stats/');
  return response.data;
};

export const getClients = async () => {
  const response = await api.get('/clients/');
  return response.data;
};

export const getSubscriptions = async () => {
  const response = await api.get('/subscriptions/');
  return response.data;
};

export const blockClientAccess = async (clientId) => {
  const response = await api.post(`/clients/${clientId}/bloquer_acces/`);
  return response.data;
};

export const activateClientAccess = async (clientId) => {
  const response = await api.post(`/clients/${clientId}/activer_acces/`);
  return response.data;
};

// ✅ Updated to handle FormData correctly
export const createClient = async (clientData) => {
  if (clientData instanceof FormData) {
    const response = await api.post('/clients/', clientData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } else {
    const response = await api.post('/clients/', clientData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  }
};

export const updateClient = async (clientId, clientData) => {
  const response = await api.put(`/clients/${clientId}/`, clientData);
  return response.data;
};

export const deleteClient = async (clientId) => {
  const response = await api.delete(`/clients/${clientId}/`);
  return response.data;
};

export const payerAbonnement = async (clientId) => {
  const response = await api.post(`/clients/${clientId}/etendre_abonnement/`);
  return response.data;
};

export const getPayments = async (url = '/payments/') => {
  const response = await api.get(url);
  return response.data;
};
