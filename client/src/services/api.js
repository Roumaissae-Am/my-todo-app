import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'https://my-todo-app-gamma-amber.vercel.app/api',
    headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Intercepteur pour les erreurs
apiClient.interceptors.response.use(
    response => response.data,
    error => {
        console.error('API Error:', error.response?.data || error.message);
        throw error;
    }
);

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const taskService = {
    getAllTasks: async () => {
        try {
            const response = await apiClient.get('/tasks');
            console.log('Réponse getAllTasks:', response);
            return response.success ? response.tasks : [];
        } catch (error) {
            console.error('Erreur getAllTasks:', error);
            return [];
        }
    },
    createTask: async (task) => {
        const response = await apiClient.post('/tasks', task);
        return response.success ? response.task : null;
    },
    completeTask: async (id) => {
        const response = await apiClient.put(`/tasks/${id}/complete`);
        return response.success ? response.task : null;
    },
    deleteTask: async (id) => {
        const response = await apiClient.delete(`/tasks/${id}`);
        return response.success;
    }
};

export const authService = {
    login: async (username, password) => {
        try {
            const response = await apiClient.post('/login', { username, password });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Erreur de connexion:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de la connexion'
            };
        }
    },
    register: async (username, password) => {
        try {
            const response = await apiClient.post('/register', { username, password });
            return { success: true, data: response.data };
        } catch (error) {
            console.error('Erreur d\'inscription:', error.response?.data || error.message);
            return {
                success: false,
                message: error.response?.data?.message || 'Erreur lors de l\'inscription'
            };
        }
    }
};
