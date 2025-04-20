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

        try {
            const response = await authService.register(username, password);
            if (response.success) {
                setSuccess("Inscription réussie. Vous pouvez maintenant vous connecter.");
                setUsername('');
                setPassword('');
                setError(null);
                if (onRegisterSuccess) onRegisterSuccess();
            } else {
                setError(response.message || "Une erreur est survenue");
                setSuccess(null);
            }
        } catch (err) {
            console.error('Erreur lors de l\'inscription:', err);
            setError(err.response?.data?.message || "Erreur lors de l'inscription");
            setSuccess(null);
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