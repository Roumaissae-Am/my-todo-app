import React, { useEffect, useState } from 'react';
import { taskService } from '../services/api';

const TaskList = () => {
    const [tasks, setTasks] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Récupérer toutes les tâches
    const fetchTasks = async () => {
        try {
            setError(null);
            setLoading(true);
            const tasks = await taskService.getAllTasks();
            console.log('Tâches reçues:', tasks);
            setTasks(Array.isArray(tasks) ? tasks : []);
        } catch (err) {
            console.error('Erreur fetchTasks:', err);
            setError("Erreur lors du chargement des tâches.");
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    // Charger les tâches au montage du composant
    useEffect(() => {
        fetchTasks();
    }, []);

    // Marquer une tâche comme terminée
    const markAsCompleted = async (id) => {
        try {
            await taskService.completeTask(id);
            fetchTasks();  // Recharger les tâches après la mise à jour
        } catch (err) {
            setError("Erreur lors de la mise à jour de la tâche.");
        }
    };

    // Supprimer une tâche
    const deleteTask = async (id) => {
        try {
            await taskService.deleteTask(id);
            fetchTasks();  // Recharger les tâches après la suppression
        } catch (err) {
            setError("Erreur lors de la suppression de la tâche.");
        }
    };

    return (
        <div className="task-list">
            {error && <p className="error">{error}</p>}
            {loading ? (
                <p>Chargement des tâches...</p>
            ) : (
                <ul>
                    {!tasks || tasks.length === 0 ? (
                        <p>Aucune tâche à afficher.</p>
                    ) : (
                        tasks.map(task => (
                            <li key={task.id}>
                                <span>{task.title}</span>
                                <span className="status">{task.completed ? '✅' : '⏳'}</span>
                                <div className="actions">
                                    {!task.completed && (
                                        <button onClick={() => markAsCompleted(task.id)} className="icon-btn" title="Terminer">✅</button>
                                    )}
                                    <button onClick={() => deleteTask(task.id)} className="icon-btn delete" title="Supprimer">🗑️</button>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    );
};

export default TaskList;
