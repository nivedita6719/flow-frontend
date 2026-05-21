
import axios from 'axios';

// Detect environment
// Local: http://localhost:8080/api
// Production: uses deployed backend URL
const BASE_URL =
    process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor — automatically add JWT token
api.interceptors.request.use(
    (config) => {

        const token =
            localStorage.getItem('flowToken');

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) => Promise.reject(error)
);

// Response interceptor — handle expired token globally
api.interceptors.response.use(

    (response) => response,

    (error) => {

        if (error.response?.status === 401) {

            localStorage.removeItem('flowToken');
            localStorage.removeItem('flowUser');

            // Redirect to login
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

// ─── Auth APIs ───────────────────────────────────────
export const authAPI = {

    register: (data) =>
        api.post('/auth/register', data),

    login: (data) =>
        api.post('/auth/login', data),

    me: () =>
        api.get('/auth/me')
};

// ─── Workflow APIs ───────────────────────────────────
export const workflowAPI = {

    create: (data) =>
        api.post('/workflows', data),

    getAll: () =>
        api.get('/workflows'),

    getById: (id) =>
        api.get(`/workflows/${id}`),

    update: (id, data) =>
        api.put(`/workflows/${id}`, data),

    delete: (id) =>
        api.delete(`/workflows/${id}`),

    publish: (id) =>
        api.post(`/workflows/${id}/publish`),

    // Reschedule CRON workflow
    reschedule: (id, cronString) =>
        api.put(
            `/workflows/${id}/reschedule?cronString=${encodeURIComponent(cronString)}`
        ),

    // Manual test execution
    testRun: (id) =>
        api.post(`/workflows/${id}/test-run`),

    // Run history
    getRuns: (
        id,
        page = 0,
        size = 10,
        status = null
    ) => {

        let url =
            `/workflows/${id}/runs?page=${page}&size=${size}`;

        if (status) {
            url += `&status=${status}`;
        }

        return api.get(url);
    },

    // Workflow statistics
    getStats: (id) =>
        api.get(`/workflows/${id}/stats`)
};

// ─── Run APIs ────────────────────────────────────────
export const runAPI = {

    getAllRuns: (
        page = 0,
        size = 20
    ) =>
        api.get(
            `/runs?page=${page}&size=${size}`
        ),

    getRunById: (runId) =>
        api.get(`/runs/${runId}`),

    getNodeLogs: (runId) =>
        api.get(`/runs/${runId}/logs`)
};

// ─── DLQ APIs ────────────────────────────────────────
export const dlqAPI = {

    getAll: () =>
        api.get('/dlq'),

    retry: (runId) =>
        api.post(`/dlq/${runId}/retry`),

    getStats: () =>
        api.get('/dlq/stats')
};

// ─── Health APIs ─────────────────────────────────────
export const healthAPI = {

    check: () =>
        api.get('/health')
};

export default api;