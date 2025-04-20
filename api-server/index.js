const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();

// Configuration des variables d'environnement
const SECRET_KEY = process.env.JWT_SECRET_KEY || 'clé_dev_temporaire';
const ALLOWED_ORIGIN = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');

console.log('ALLOWED_ORIGIN configuré:', ALLOWED_ORIGIN);

// Middleware pour les logs
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Configuration CORS
app.use((req, res, next) => {
    const origin = req.headers.origin;
    console.log('Requête reçue de:', origin);

    if (origin === ALLOWED_ORIGIN) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
    }

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

// Configuration du parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Stockage en mémoire
let users = [];
let tasks = [];

// Utilitaires
const generateId = (collection) => {
    const maxId = collection.reduce((max, item) => Math.max(max, item.id), 0);
    return maxId + 1;
};

const handleAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Token manquant' });
        }

        jwt.verify(token, SECRET_KEY, (err, user) => {
            if (err) {
                console.error('Erreur JWT:', err);
                return res.status(403).json({ message: 'Token invalide' });
            }
            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'authentification' });
    }
};

// Routes d'authentification
app.post('/api/register', handleAsync(async (req, res) => {
    console.log('Tentative d\'inscription:', { username: req.body.username });
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Le nom d\'utilisateur et le mot de passe sont requis'
        });
    }

    const existingUser = users.find(u => u.username === username);
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'Ce nom d\'utilisateur est déjà utilisé'
        });
    }

    const newUser = {
        id: generateId(users),
        username,
        password // Dans un environnement de production, il faudrait hasher le mot de passe
    };

    users.push(newUser);
    console.log('Nouvel utilisateur créé:', { id: newUser.id, username: newUser.username });

    res.status(201).json({
        success: true,
        message: 'Inscription réussie'
    });
}));

app.post('/api/login', handleAsync(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Le nom d\'utilisateur et le mot de passe sont requis'
        });
    }

    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Identifiants invalides'
        });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username },
        SECRET_KEY,
        { expiresIn: '1h' }
    );

    res.json({
        success: true,
        token
    });
}));

// Routes des tâches
app.get('/api/tasks', authenticateToken, handleAsync(async (req, res) => {
    const userTasks = tasks.filter(task => task.userId === req.user.id);
    res.json({
        success: true,
        tasks: userTasks
    });
}));

app.post('/api/tasks', authenticateToken, handleAsync(async (req, res) => {
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({
            success: false,
            message: 'Le titre est requis'
        });
    }

    const newTask = {
        id: generateId(tasks),
        userId: req.user.id,
        title,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    res.status(201).json({
        success: true,
        task: newTask
    });
}));

app.put('/api/tasks/:id/complete', authenticateToken, handleAsync(async (req, res) => {
    const taskId = parseInt(req.params.id);
    const task = tasks.find(t => t.id === taskId && t.userId === req.user.id);

    if (!task) {
        return res.status(404).json({
            success: false,
            message: 'Tâche non trouvée'
        });
    }

    task.completed = true;
    task.completedAt = new Date().toISOString();

    res.json({
        success: true,
        task
    });
}));

app.delete('/api/tasks/:id', authenticateToken, handleAsync(async (req, res) => {
    const taskId = parseInt(req.params.id);
    const taskIndex = tasks.findIndex(t => t.id === taskId && t.userId === req.user.id);

    if (taskIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Tâche non trouvée'
        });
    }

    tasks.splice(taskIndex, 1);
    res.json({
        success: true,
        message: 'Tâche supprimée'
    });
}));

// Routes de debug
app.get('/api/debug/users', (req, res) => {
    const usersSafe = users.map(u => ({ id: u.id, username: u.username }));
    res.json({
        success: true,
        users: usersSafe
    });
});

app.post('/api/debug/reset', (req, res) => {
    users = [];
    tasks = [];
    console.log('Données réinitialisées');
    res.json({
        success: true,
        message: 'Données réinitialisées'
    });
});

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    res.status(500).json({
        success: false,
        message: 'Erreur serveur interne'
    });
});

// Export pour Vercel
module.exports = app;
