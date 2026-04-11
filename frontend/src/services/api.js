import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Add request/response logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
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
  try {
    const response = await api.get('/dashboard-stats/');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

export const getClients = async () => {
  try {
    const response = await api.get('/clients/');
    return response.data;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }
};

export const getSubscriptions = async () => {
  try {
    const response = await api.get('/subscriptions/');
    return response.data;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
};

export const blockClientAccess = async (clientId) => {
  try {
    const response = await api.post(`/clients/${clientId}/bloquer_acces/`);
    return response.data;
  } catch (error) {
    console.error('Error blocking client access:', error);
    throw error;
  }
};

export const activateClientAccess = async (clientId) => {
  try {
    const response = await api.post(`/clients/${clientId}/activer_acces/`);
    return response.data;
  } catch (error) {
    console.error('Error activating client access:', error);
    throw error;
  }
};

export const createClient = async (clientData) => {
  try {
    const response = await api.post('/clients/', clientData);
    return response.data;
  } catch (error) {
    console.error('Error creating client:', error);
    throw error;
  }
};

export const updateClient = async (clientId, clientData) => {
  try {
    const response = await api.put(`/clients/${clientId}/`, clientData);
    return response.data;
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
};

export const deleteClient = async (clientId) => {
  try {
    const response = await api.delete(`/clients/${clientId}/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};
