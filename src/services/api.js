
import axios from 'axios';

// Detect environment
// Local: http://localhost:8080/api
// Production: uses deployed backend URL
const BASE_URL =
    process.env.REACT_APP_API_URL || '/api';

// The backend runs on a free host that sleeps after ~15 min idle.
// A cold start can take up to ~90s. Rather than one long hang, each attempt
// fails fast and we retry a few times so the whole wake-up is covered while
// the user just sees a spinner.
const REQUEST_TIMEOUT_MS = 25000;
const COLD_START_MAX_RETRIES = 4;
const COLD_START_RETRY_DELAY_MS = 4000;
const COLD_START_STATUSES = [502, 503, 504];

// Create axios instance
const api = axios.create({
    baseURL: BASE_URL,
    timeout: REQUEST_TIMEOUT_MS,
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

// Is this the kind of failure a sleeping backend produces?
export const isColdStartError = (error) => {
    if (error.code === 'ECONNABORTED') return true;          // timeout
    if (error.message === 'Network Error') return true;      // no response
    const status = error.response?.status;
    return status ? COLD_START_STATUSES.includes(status) : false;
};

// Human-readable message for the UI. Components can read error.friendlyMessage.
export const friendlyMessage = (error) => {
    const status = error.response?.status;
    if (status === 429) {
        return 'Too many attempts. Please wait a minute and try again.';
    }
    if (isColdStartError(error)) {
        return 'The server is waking up (free hosting). This can take up to a minute — please try again.';
    }
    return error.response?.data?.message || 'Something went wrong. Please try again.';
};

// Response interceptor — retry cold starts, handle expired token, add message
api.interceptors.response.use(

    (response) => response,

    async (error) => {

        const config = error.config || {};

        // Retry a cold-start style failure a few times (covers the wake-up window)
        if (isColdStartError(error)) {
            config.__retryCount = (config.__retryCount || 0) + 1;
            if (config.__retryCount <= COLD_START_MAX_RETRIES) {
                await new Promise((r) => setTimeout(r, COLD_START_RETRY_DELAY_MS));
                return api(config);
            }
        }

        if (error.response?.status === 401) {
            localStorage.removeItem('flowToken');
            localStorage.removeItem('flowUser');

            // Only bounce to login if we're not already on an auth page
            const path = window.location.pathname;
            if (path !== '/login' && path !== '/register') {
                window.location.href = '/login';
            }
        }

        error.friendlyMessage = friendlyMessage(error);
        return Promise.reject(error);
    }
);

// Absolute base URL of the API (handles the "/api" relative case too).
// Used to build shareable links such as webhook URLs.
export const apiBaseUrl = /^https?:\/\//.test(BASE_URL)
    ? BASE_URL.replace(/\/$/, '')
    : `${window.location.origin}${BASE_URL}`.replace(/\/$/, '');

// Fire-and-forget: wake the backend so it's warm by the time the user submits.
export const warmUpBackend = () => {
    api.get('/health').catch(() => {});
};

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