import { runTransaction, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';

const GAME_ID = 'tekken8';

/**
 * Servicio para lógica de negocio del ranking
 */
export const rankingService = {
    /**
     * Calcula el win rate de un jugador
     * @param {number} wins - Número de victorias
     * @param {number} losses - Número de derrotas
     * @returns {number} - Win rate en porcentaje
     */
    calculateWinRate: (wins, losses) => {
        const total = wins + losses;
        return total > 0 ? Math.round((wins / total) * 100) : 0;
    },

    /**
     * Valida si un reto es válido según las reglas del ranking
     * @param {Object} challenger - Jugador retador
     * @param {Object} defender - Jugador defensor
     * @returns {Object} - { valid: boolean, message: string }
     */
    validateChallenge: (challenger, defender) => {
        if (!challenger || !defender) {
            return { valid: false, message: 'Jugadores no encontrados' };
        }

        if (challenger.id === defender.id) {
            return { valid: false, message: 'Un jugador no puede retarse a sí mismo' };
        }

        if (challenger.currentRank <= defender.currentRank) {
            return {
                valid: false,
                message: 'El retador debe tener un rango inferior (número mayor)'
            };
        }

        return { valid: true, message: 'Reto válido' };
    },

    /**
     * Maneja la finalización de un match y actualiza los rankings
     * @param {string} matchId - ID del match
     * @param {Object} match - Datos del match
     * @param {number} scoreChallenger - Score del retador
     * @param {number} scoreDefender - Score del defensor
     * @returns {Promise<void>}
     */
    handleMatchCompletion: async (matchId, match, scoreChallenger, scoreDefender) => {
        if (!match) {
            throw new Error('Match not found');
        }

        const challengerWon = scoreChallenger > scoreDefender;

        try {
            await runTransaction(db, async (transaction) => {
                const challengerRef = doc(db, `leagues/${GAME_ID}/players`, match.challengerId);
                const defenderRef = doc(db, `leagues/${GAME_ID}/players`, match.defenderId);

                const challengerDoc = await transaction.get(challengerRef);
                const defenderDoc = await transaction.get(defenderRef);

                if (!challengerDoc.exists() || !defenderDoc.exists()) {
                    throw new Error('Player document does not exist!');
                }

                const challengerData = challengerDoc.data();
                const defenderData = defenderDoc.data();

                if (challengerWon) {
                    // Intercambio de rangos
                    const tempRank = challengerData.currentRank;
                    transaction.update(challengerRef, {
                        currentRank: defenderData.currentRank,
                        lastMatchResult: 'WIN',
                        trend: 'UP',
                        'stats.wins': (challengerData.stats?.wins || 0) + 1
                    });
                    transaction.update(defenderRef, {
                        currentRank: tempRank,
                        lastMatchResult: 'LOSS',
                        trend: 'DOWN',
                        'stats.losses': (defenderData.stats?.losses || 0) + 1
                    });
                    toast.success(
                        `🔥 ¡Intercambio! ${challengerData.nickname} sube al Rank ${defenderData.currentRank}`
                    );
                } else {
                    // El defensor gana - sin cambio de rango
                    transaction.update(challengerRef, {
                        lastMatchResult: 'LOSS',
                        trend: 'SAME',
                        'stats.losses': (challengerData.stats?.losses || 0) + 1
                    });
                    transaction.update(defenderRef, {
                        lastMatchResult: 'WIN',
                        trend: 'SAME',
                        'stats.wins': (defenderData.stats?.wins || 0) + 1
                    });
                    toast.success(
                        `🛡️ ${defenderData.nickname} defiende el Rank ${defenderData.currentRank}`
                    );
                }
            });
        } catch (error) {
            console.error('Transaction failed:', error);
            toast.error('Error al completar el match');
            throw error;
        }
    },

    /**
     * Obtiene el avatar por defecto
     * @returns {string} - URL del avatar por defecto
     */
    getDefaultAvatar: () => {
        return 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';
    }
};
