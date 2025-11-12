/**
 * useWeeklyBookings - React Query hook para obtener bookings de una semana
 * 
 * Real-time: onSnapshot listener
 * Cache: 0 staleTime (siempre real-time)
 * Optimization: Query con weekId para O(1) performance
 * Notifications: Toast cuando hay cambios
 * 
 * @hook useWeeklyBookings
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, query, where, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { QUERY_KEYS } from '../../../config/queryClient';
import { getWeekId } from '../../../utils/dateHelpers';
import toast from 'react-hot-toast';
import { useEffect, useRef, useMemo } from 'react'; // ✅ Agregado useMemo

/**
 * ✅ OPT-003: Normaliza Firestore Timestamps a Date objects
 * Esto previene conversiones repetidas en BookingValidator y componentes
 * 
 * @param {Object} data - Data cruda de Firestore
 * @returns {Object} - Data con Dates normalizados
 */
function normalizeBookingDates(data) {
    return {
        ...data,
        startTime: data.startTime?.toDate ? data.startTime.toDate() : data.startTime,
        endTime: data.endTime?.toDate ? data.endTime.toDate() : data.endTime,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        cancelledAt: data.cancelledAt?.toDate ? data.cancelledAt.toDate() : data.cancelledAt,
    };
}

/**
 * Obtiene bookings de una semana específica para una máquina
 * 
 * @param {string} machineId - ID de la máquina
 * @param {Date|string} weekStartDate - Fecha de inicio de la semana
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.enabled - Si debe hacer fetch automático (default: true)
 * @param {boolean} options.realtime - Si debe usar onSnapshot (default: true)
 * @param {boolean} options.showToasts - Si debe mostrar toasts en cambios (default: false)
 * @returns {Object} - React Query result con data, isLoading, error
 */
export function useWeeklyBookings(machineId, weekStartDate, options = {}) {
    const { enabled = true, realtime = true, showToasts = false } = options;
    const queryClient = useQueryClient();
    const previousDataRef = useRef(null);

    const weekId = weekStartDate ? getWeekId(weekStartDate) : null;

    // ✅ CRÍTICO: useMemo para estabilizar queryKey y evitar infinite loop
    const queryKey = useMemo(
        () => QUERY_KEYS.BOOKINGS_WEEKLY(machineId, weekId),
        [machineId, weekId]
    );

    const queryResult = useQuery({
        queryKey,
        queryFn: async () => {
            if (!machineId || !weekId) {
                return [];
            }

            const bookingsRef = collection(db, 'bookings');
            const q = query(
                bookingsRef,
                where('weekId', '==', weekId),
                where('machineId', '==', machineId),
                where('status', '==', 'active'),
                orderBy('startTime', 'asc')
            );

            // Si realtime está deshabilitado, hacer una query normal
            if (!realtime) {
                const snapshot = await getDocs(q);
                return snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...normalizeBookingDates(doc.data()), // ✅ OPT-003: Normalizar Timestamps una vez
                }));
            }

            // Si realtime está habilitado, devolver una promesa que nunca se resuelve
            // (el listener manejará las actualizaciones)
            return new Promise(() => { });
        },
        staleTime: 0, // Siempre considerar stale para real-time
        gcTime: 5 * 60 * 1000, // 5 minutos en cache
        enabled: enabled && !!machineId && !!weekId,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });

    // Setup real-time listener con onSnapshot
    useEffect(() => {
        if (!enabled || !realtime || !machineId || !weekId) {
            return;
        }

        // ✅ FIX: Resetear previousDataRef cuando cambia machineId o weekId
        // Esto previene toasts falsos al cambiar de máquina
        previousDataRef.current = null;

        const bookingsRef = collection(db, 'bookings');
        const q = query(
            bookingsRef,
            where('weekId', '==', weekId),
            where('machineId', '==', machineId),
            where('status', '==', 'active'),
            orderBy('startTime', 'asc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const bookings = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...normalizeBookingDates(doc.data()), // ✅ OPT-003: Normalizar Timestamps una vez
                }));

                // ✅ FIX: Solo mostrar toasts si NO es la primera carga
                // y si previousDataRef tiene datos de la MISMA query (no de máquina anterior)
                const isFirstLoad = previousDataRef.current === null;

                if (showToasts && !isFirstLoad && previousDataRef.current) {
                    const previousIds = new Set(previousDataRef.current.map((b) => b.id));
                    const currentIds = new Set(bookings.map((b) => b.id));

                    // Detectar nuevos bookings
                    const newBookings = bookings.filter((b) => !previousIds.has(b.id));
                    if (newBookings.length > 0) {
                        toast('Nueva reserva detectada', {
                            duration: 3000,
                        });
                    }

                    // Detectar bookings cancelados
                    const removedBookings = previousDataRef.current.filter(
                        (b) => !currentIds.has(b.id)
                    );
                    if (removedBookings.length > 0) {
                        toast('Reserva cancelada', {
                            duration: 3000,
                        });
                    }
                }

                // Guardar referencia para la próxima comparación
                previousDataRef.current = bookings;

                // Actualizar cache de React Query
                queryClient.setQueryData(queryKey, bookings);
            },
            (error) => {
                console.error('[useWeeklyBookings] Firestore listener error:', error);
                if (showToasts) {
                    toast.error('Error al sincronizar reservas', {
                        description: error.message,
                    });
                }
            }
        );

        return () => {
            unsubscribe();
        };
    }, [enabled, realtime, machineId, weekId, showToasts, queryClient]);

    return queryResult;
}

/**
 * Hook para obtener bookings de un usuario específico
 * 
 * @param {string} userId - ID del usuario
 * @param {Object} options - Opciones adicionales
 * @returns {Object} - React Query result
 */
export function useUserBookings(userId, options = {}) {
    const { enabled = true, status = 'active' } = options;

    return useQuery({
        queryKey: QUERY_KEYS.BOOKINGS_USER(userId),
        queryFn: async () => {
            if (!userId) {
                return [];
            }

            const bookingsRef = collection(db, 'bookings');
            const q = query(
                bookingsRef,
                where('userId', '==', userId),
                where('status', '==', status),
                orderBy('startTime', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        },
        staleTime: 30 * 1000, // 30 segundos
        gcTime: 5 * 60 * 1000,
        enabled: enabled && !!userId,
    });
}

/**
 * Hook para obtener todas las reservas activas del usuario
 * (útil para mostrar "Mis Reservas")
 * 
 * @param {string} userId - ID del usuario
 * @returns {Object} - React Query result
 */
export function useMyActiveBookings(userId) {
    return useUserBookings(userId, { status: 'active' });
}

/**
 * Hook para obtener el historial de reservas del usuario
 * 
 * @param {string} userId - ID del usuario
 * @returns {Object} - React Query result
 */
export function useMyBookingHistory(userId) {
    return useQuery({
        queryKey: ['user-bookings-history', userId],
        queryFn: async () => {
            if (!userId) {
                return [];
            }

            const bookingsRef = collection(db, 'bookings');
            const q = query(
                bookingsRef,
                where('userId', '==', userId),
                orderBy('startTime', 'desc')
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        },
        staleTime: 60 * 1000, // 1 minuto
        gcTime: 10 * 60 * 1000,
        enabled: !!userId,
    });
}

/**
 * Hook para verificar si un slot específico está disponible (query puntual)
 * 
 * @param {string} machineId - ID de la máquina
 * @param {Date} startTime - Hora de inicio del slot
 * @param {Date} endTime - Hora de fin del slot
 * @returns {Object} - { isAvailable, isLoading }
 */
export function useSlotAvailability(machineId, startTime, endTime) {
    return useQuery({
        queryKey: ['slot-availability', machineId, startTime?.toISOString(), endTime?.toISOString()],
        queryFn: async () => {
            if (!machineId || !startTime || !endTime) {
                return { isAvailable: false };
            }

            const bookingsRef = collection(db, 'bookings');
            const q = query(
                bookingsRef,
                where('machineId', '==', machineId),
                where('startTime', '>=', startTime),
                where('startTime', '<', endTime),
                where('status', '==', 'active')
            );

            const snapshot = await getDocs(q);

            // Si no hay documentos, está disponible
            return { isAvailable: snapshot.empty };
        },
        staleTime: 0, // No cachear, siempre fresh
        enabled: !!machineId && !!startTime && !!endTime,
    });
}
