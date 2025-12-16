import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../config/firebase';
import toast from 'react-hot-toast';

const GAME_ID = 'tekken8';
const DEFAULT_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default';

/**
 * Hook para manejar todas las operaciones relacionadas con jugadores del ranking
 * @returns {Object} { players, loading, createPlayer, deletePlayer, uploadAvatar }
 */
export const useRankingPlayers = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Suscripción en tiempo real a los jugadores
    useEffect(() => {
        const qPlayers = query(
            collection(db, `leagues/${GAME_ID}/players`),
            orderBy('currentRank', 'asc')
        );

        const unsubscribe = onSnapshot(
            qPlayers,
            (snapshot) => {
                const pList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                setPlayers(pList);
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching players:', error);
                toast.error('Error al cargar jugadores. Verifica que existan datos en Firestore.');
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    /**
     * Optimiza una imagen antes de subirla (convierte a JPEG y reduce calidad)
     * @param {File} file - Archivo de imagen
     * @returns {Promise<Blob>} - Blob optimizado
     */
    const optimizeImage = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 300;
                    const MAX_HEIGHT = 300;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/jpeg', 0.85);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    };

    /**
     * Sube un avatar a Firebase Storage
     * @param {File} file - Archivo de imagen
     * @param {string} nickname - Nickname del jugador
     * @returns {Promise<string>} - URL del avatar subido
     */
    const uploadAvatar = async (file, nickname) => {
        if (!file) return DEFAULT_AVATAR;

        try {
            const optimizedBlob = await optimizeImage(file);
            const timestamp = Date.now();
            const filename = `avatars/${GAME_ID}/${nickname}_${timestamp}.jpg`;
            const storageRef = ref(storage, filename);
            await uploadBytes(storageRef, optimizedBlob);
            const url = await getDownloadURL(storageRef);
            return url;
        } catch (error) {
            console.error('Error uploading avatar:', error);
            toast.error('Error al subir avatar, se usará el predeterminado');
            return DEFAULT_AVATAR;
        }
    };

    /**
     * Crea un nuevo jugador
     * @param {Object} playerData - Datos del jugador { nickname, email, mainCharacter, avatarFile }
     * @returns {Promise<void>}
     */
    const createPlayer = async (playerData) => {
        if (!playerData.nickname || !playerData.email || !playerData.mainCharacter) {
            toast.error('Completa todos los campos requeridos');
            throw new Error('Missing required fields');
        }

        try {
            const nextRank = players.length + 1;
            let avatarUrl = DEFAULT_AVATAR;

            if (playerData.avatarFile) {
                avatarUrl = await uploadAvatar(playerData.avatarFile, playerData.nickname);
            }

            const newPlayerData = {
                nickname: playerData.nickname,
                email: playerData.email.toLowerCase(),
                currentRank: nextRank,
                mainCharacter: playerData.mainCharacter,
                avatarUrl,
                lastMatchResult: 'NONE',
                trend: 'SAME',
                stats: {
                    wins: 0,
                    losses: 0
                },
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, `leagues/${GAME_ID}/players`), newPlayerData);
            toast.success(`Jugador ${playerData.nickname} añadido en Rank ${nextRank}`);
        } catch (error) {
            console.error('Error creating player:', error);
            toast.error('Error al crear jugador');
            throw error;
        }
    };

    /**
     * Crea múltiples jugadores de una vez (bulk upload)
     * @param {Array<Object>} playersData - Array de datos de jugadores
     * @returns {Promise<void>}
     */
    const createPlayersBulk = async (playersData) => {
        if (!Array.isArray(playersData) || playersData.length === 0) {
            toast.error('El array de jugadores está vacío o es inválido');
            throw new Error('Invalid players array');
        }

        // Validar estructura
        const validPlayers = playersData.filter(p =>
            p.nickname && p.email && p.mainCharacter
        );

        if (validPlayers.length === 0) {
            toast.error('No hay jugadores válidos en el archivo');
            throw new Error('No valid players found');
        }

        try {
            const startRank = players.length + 1;
            const promises = validPlayers.map(async (player, index) => {
                const playerData = {
                    nickname: player.nickname,
                    email: player.email.toLowerCase(),
                    currentRank: startRank + index,
                    mainCharacter: player.mainCharacter,
                    avatarUrl: player.avatarUrl || DEFAULT_AVATAR,
                    lastMatchResult: 'NONE',
                    trend: 'SAME',
                    stats: {
                        wins: player.stats?.wins || 0,
                        losses: player.stats?.losses || 0
                    },
                    createdAt: serverTimestamp()
                };
                return addDoc(collection(db, `leagues/${GAME_ID}/players`), playerData);
            });

            await Promise.all(promises);
            toast.success(`${validPlayers.length} jugadores añadidos correctamente`);
        } catch (error) {
            console.error('Error bulk upload:', error);
            toast.error('Error al procesar los jugadores');
            throw error;
        }
    };

    /**
     * Elimina un jugador
     * @param {string} playerId - ID del jugador
     * @returns {Promise<void>}
     */
    const deletePlayer = async (playerId) => {
        try {
            await deleteDoc(doc(db, `leagues/${GAME_ID}/players`, playerId));
            toast.success('Jugador eliminado');
        } catch (error) {
            console.error('Error deleting player:', error);
            toast.error('Error al eliminar jugador');
            throw error;
        }
    };

    return {
        players,
        loading,
        createPlayer,
        createPlayersBulk,
        deletePlayer,
        uploadAvatar
    };
};
