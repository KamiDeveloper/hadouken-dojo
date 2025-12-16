import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';

const GAME_ID = 'tekken8';

/**
 * Hook para manejar todas las operaciones relacionadas con matches del ranking
 * @returns {Object} { matches, liveMatches, scheduledMatches, completedMatches, createMatch, updateMatchScore }
 */
export const useRankingMatches = () => {
    const [matches, setMatches] = useState([]);

    // Suscripción en tiempo real a los matches
    useEffect(() => {
        const qMatches = query(
            collection(db, 'matches'),
            orderBy('scheduledDate', 'desc')
        );

        const unsubscribe = onSnapshot(
            qMatches,
            (snapshot) => {
                const mList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setMatches(mList);
            },
            (error) => {
                console.error('Error fetching matches:', error);
                // Silent fail for matches as they might not exist yet
            }
        );

        return () => unsubscribe();
    }, []);

    /**
     * Crea un nuevo match/reto
     * @param {Object} matchData - Datos del match { challengerId, defenderId, format, scheduledDate }
     * @param {Array} players - Lista de jugadores para validación
     * @returns {Promise<void>}
     */
    const createMatch = async (matchData, players) => {
        const { challengerId, defenderId, format = 'BO7', scheduledDate } = matchData;

        if (!challengerId || !defenderId) {
            toast.error('Selecciona ambos jugadores');
            throw new Error('Missing player IDs');
        }

        if (challengerId === defenderId) {
            toast.error('Un jugador no puede retarse a sí mismo');
            throw new Error('Same player selected');
        }

        const challenger = players.find(p => p.id === challengerId);
        const defender = players.find(p => p.id === defenderId);

        if (!challenger || !defender) {
            toast.error('Jugadores no encontrados');
            throw new Error('Players not found');
        }

        if (challenger.currentRank <= defender.currentRank) {
            toast.error('El retador debe tener un rango inferior (número mayor)');
            throw new Error('Invalid rank order');
        }

        try {
            const newMatchData = {
                gameId: GAME_ID,
                challengerId,
                defenderId,
                status: 'SCHEDULED',
                scheduledDate: scheduledDate ? new Date(scheduledDate).getTime() : Date.now(),
                score: {
                    challenger: 0,
                    defender: 0
                },
                format,
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'matches'), newMatchData);
            toast.success(
                `Reto creado: ${challenger.nickname} (Rank ${challenger.currentRank}) vs ${defender.nickname} (Rank ${defender.currentRank})`
            );
        } catch (error) {
            console.error('Error creating match:', error);
            toast.error('Error al crear el reto');
            throw error;
        }
    };

    /**
     * Actualiza el score de un match
     * @param {string} matchId - ID del match
     * @param {number} newScoreChallenger - Nuevo score del retador
     * @param {number} newScoreDefender - Nuevo score del defensor
     * @param {string} newStatus - Nuevo estado del match
     * @returns {Promise<void>}
     */
    const updateMatchScore = async (matchId, newScoreChallenger, newScoreDefender, newStatus) => {
        try {
            const matchRef = doc(db, 'matches', matchId);
            await updateDoc(matchRef, {
                'score.challenger': newScoreChallenger,
                'score.defender': newScoreDefender,
                status: newStatus,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error updating score:', error);
            toast.error('Error al actualizar marcador');
            throw error;
        }
    };

    // Filtrar matches por estado
    const liveMatches = matches.filter(m => m.status === 'LIVE');
    const scheduledMatches = matches.filter(m => m.status === 'SCHEDULED');
    const completedMatches = matches.filter(m => m.status === 'COMPLETED');

    return {
        matches,
        liveMatches,
        scheduledMatches,
        completedMatches,
        createMatch,
        updateMatchScore
    };
};
