const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();

// Utilisation de la variable d'environnement pour la clé secrète JWT
const SECRET_KEY = process.env.JWT_SECRET_KEY || 'clé_dev_temporaire';

// Configuration de base pour Express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuration CORS simplifiée
app.use((req, res, next) => {
    const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.header('Access-Control-Allow-Origin', allowedOrigin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Gérer les requêtes OPTIONS pour le pre-flight CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    next();
});

let users = [];
let tasks = [];

// Fonction pour générer un ID unique
const generateId = (collection) => {
    const maxId = collection.reduce((max, item) => Math.max(max, item.id), 0);
    return maxId + 1;
};

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token manquant' });

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token invalide' });
        req.user = user;
        next();
    });
}

app.post('/api/register', (req, res) => {
    console.log('Tentative d\'inscription:', req.body);
    const { username, password } = req.body;
    
    if (!username || !password) {
        console.log('Données manquantes');
        return res.status(400).json({ message: 'Username et password requis' });
    }

    console.log('Vérification des utilisateurs existants. Liste actuelle:', users);
    const existingUser = users.find(u => u.username === username);
    
    if (existingUser) {
        console.log('Utilisateur existant trouvé:', existingUser.username);
        return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    try {
        const newUser = {
            id: generateId(users),
            username,
            password
        };
        users.push(newUser);
        console.log('Nouvel utilisateur créé:', { id: newUser.id, username: newUser.username });
        console.log('Liste mise à jour des utilisateurs:', users.map(u => ({ id: u.id, username: u.username })));
        res.status(201).json({ message: 'Utilisateur créé' });
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.post('/api/login', (req, res) => {
    console.log('Tentative de connexion:', req.body);
    const { username, password } = req.body;
    console.log('Utilisateurs disponibles:', users);
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(401).json({ message: 'Identifiants invalides' });

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

app.get('/api/tasks', authenticateToken, (req, res) => {
    res.json(tasks);
});

app.post('/api/tasks', authenticateToken, (req, res) => {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Titre requis' });

    const newTask = { id: generateId(tasks), title, completed: false };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

app.put('/api/tasks/:id/complete', authenticateToken, (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (!task) return res.status(404).json({ error: 'Tâche non trouvée' });
    task.completed = true;
    res.json(task);
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
    const taskIndex = tasks.findIndex(t => t.id === parseInt(req.params.id));
    if (taskIndex === -1) return res.status(404).json({ error: 'Tâche non trouvée' });
    tasks.splice(taskIndex, 1);
    res.json({ message: 'Tâche supprimée' });
});

// Routes de debug
app.get('/api/debug/users', (req, res) => {
    const usersSafe = users.map(u => ({ id: u.id, username: u.username }));
    res.json(usersSafe);
});

app.post('/api/debug/reset', (req, res) => {
    users = [];
    tasks = [];
    console.log('Données réinitialisées');
    res.json({ message: 'Données réinitialisées' });
});

//  Export pour Vercel
module.exports = app;
