import axios from 'axios';

const apiClient = axios.create({
    // baseURL: 'http://localhost:5000/api',
    baseURL: 'https://my-todo-app-snowy-eight.vercel.app/api',


    headers: { 'Content-Type': 'application/json' }
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const taskService = {
    getAllTasks: async () => (await apiClient.get('/tasks')).data,
    createTask: async (task) => (await apiClient.post('/tasks', task)).data,
    completeTask: async (id) => (await apiClient.put(`/tasks/${id}/complete`)).data,
    deleteTask: async (id) => (await apiClient.delete(`/tasks/${id}`)).data
};

export const authService = {
    login: async (username, password) =>
        (await apiClient.post('/login', { username, password })).data,
    register: async (username, password) =>
        (await apiClient.post('/register', { username, password })).data
};
