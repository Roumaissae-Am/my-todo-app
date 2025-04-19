import React, { useState } from 'react';
import { taskService } from '../services/api';

const TaskForm = ({ onTaskAdded }) => {
    const [title, setTitle] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        setSubmitting(true);
        try {
            const task = await taskService.createTask({ title });
            onTaskAdded(task);
            setTitle('');
        } catch (error) {
            console.error('Erreur lors de l’ajout de la tâche.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="task-form">
            <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Nouvelle tâche"
                disabled={submitting}
            />
            <button type="submit" disabled={submitting}>
                {submitting ? 'Ajout...' : 'Ajouter'}
            </button>
        </form>
    );
};

export default TaskForm;
