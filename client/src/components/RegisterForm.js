import React, { useState } from 'react';
import { authService } from '../services/api';
import '../App.css';

const RegisterForm = ({ onRegisterSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username || !password) {
            setError("Le nom d'utilisateur et le mot de passe sont requis");
            setSuccess(null);
            return;
        }

        setError(null);
        setSuccess(null);

        const result = await authService.register(username, password);
        console.log('Résultat inscription:', result);

        if (result.success) {
            setSuccess("Inscription réussie. Vous pouvez maintenant vous connecter.");
            setUsername('');
            setPassword('');
            if (onRegisterSuccess) onRegisterSuccess();
        } else {
            setError(result.message || "Une erreur est survenue lors de l'inscription");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            <h2>Créer un compte</h2>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
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
            <button type="submit">S'inscrire</button>
        </form>
    );
};

export default RegisterForm;