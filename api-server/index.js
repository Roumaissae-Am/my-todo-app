const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();

// Utilisation de la variable d'environnement pour la clé secrète JWT
const SECRET_KEY = process.env.JWT_SECRET_KEY || 'clé_dev_temporaire';

// Configuration CORS pour n'accepter que le frontend Netlify
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let users = [{ id: 1, username: 'admin', password: 'admin' }];
let tasks = [
    { id: 1, title: 'Apprendre Express', completed: false },
    { id: 2, title: 'Créer une API REST', completed: false }
];

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
    const existingUser = users.find(u => u.username === username);
    console.log('Utilisateurs existants:', users);
    if (existingUser) return res.status(400).json({ message: 'Utilisateur déjà existant' });

    const newUser = {
        id: users.length + 1,
        username,
        password
    };
    users.push(newUser);
    res.status(201).json({ message: 'Utilisateur créé' });
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

    const newTask = { id: tasks.length + 1, title, completed: false };
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

// Route de debug pour voir les utilisateurs
app.get('/api/debug/users', (req, res) => {
    const usersSafe = users.map(u => ({ id: u.id, username: u.username }));
    res.json(usersSafe);
});

//  Export pour Vercel
module.exports = app;
