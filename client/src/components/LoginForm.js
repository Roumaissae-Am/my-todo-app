import React, { useState } from 'react';
import { authService } from '../services/api';

const LoginForm = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError("Le nom d'utilisateur et le mot de passe sont requis");
            return;
        }

        setError(null);
        const result = await authService.login(username, password);
        console.log('Résultat connexion:', result);

        if (result.success && result.data?.token) {
            onLogin(result.data.token);
        } else {
            setError(result.message || "Identifiants invalides");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <h2>Connexion</h2>
            {error && <p className="error">{error}</p>}
            <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={e => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Mot de passe"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <button type="submit">Se connecter</button>
        </form>
    );
};

export default LoginForm;
