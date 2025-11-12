/**
 * useCancelBooking - React Query mutation para cancelar bookings
 * 
 * Features:
 * - Update status a 'cancelled' (no delete, preservar data)
 * - Validación con BookingValidator (minHoursToCancel)
 * - Optimistic update
 * - Error handling con rollback
 * - Success toast + invalidate queries
 * - Modal de confirmación (lógica externa, este hook solo hace la mutation)
 * 
 * @hook useCancelBooking
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { QUERY_KEYS } from '../../../config/queryClient';
import { getWeekId } from '../../../utils/dateHelpers';
import BookingValidator from '../../services/BookingValidator';
import toast from 'react-hot-toast';

/**
 * Cancela un booking (update status a 'cancelled')
 * 
 * @param {Object} cancelData - Datos de la cancelación
 * @param {string} cancelData.bookingId - ID del booking a cancelar
 * @param {Object} cancelData.booking - Objeto booking completo (para validación y optimistic update)
 * @param {string} cancelData.userId - ID del usuario (para validación)
 * @param {Object} cancelData.config - Configuración (minHoursToCancel)
 * @returns {Promise<Object>} - { success: boolean, bookingId: string }
 */
async function cancelBooking({ bookingId, booking, userId, config = {} }) {
    // Validar que el usuario puede cancelar
    const validation = BookingValidator.canCancel(booking, userId, config);

    if (!validation.can) {
        throw new Error(validation.reason || 'No puedes cancelar esta reserva');
    }

    // Update status a 'cancelled'
    const bookingRef = doc(db, 'bookings', bookingId);

    await updateDoc(bookingRef, {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancelledBy: userId,
    });

    return {
        success: true,
        bookingId,
    };
}

/**
 * Hook para cancelar bookings
 * 
 * @param {Object} options - Opciones adicionales
 * @param {Function} options.onSuccess - Callback al completar exitosamente
 * @param {Function} options.onError - Callback al encontrar error
 * @returns {Object} - useMutation result con mutate, isLoading, error
 */
export function useCancelBooking(options = {}) {
    const { onSuccess, onError } = options;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelBooking,

        // Optimistic update
        onMutate: async (variables) => {
            const { bookingId, booking } = variables;
            const { machineId, weekId, userId } = booking;

            // 1. Cancel outgoing refetches
            await queryClient.cancelQueries({
                queryKey: QUERY_KEYS.BOOKINGS_WEEKLY(machineId, weekId),
            });

            // 2. Snapshot previous value para rollback
            const previousWeeklyData = queryClient.getQueryData(
                QUERY_KEYS.BOOKINGS_WEEKLY(machineId, weekId)
            );

            const previousUserData = queryClient.getQueryData(
                QUERY_KEYS.BOOKINGS_USER(userId)
            );

            // 3. Optimistically remove booking de weekly query
            queryClient.setQueryData(
                QUERY_KEYS.BOOKINGS_WEEKLY(machineId, weekId),
                (old = []) => old.filter((b) => b.id !== bookingId)
            );

            // 4. Optimistically remove booking de user query
            queryClient.setQueryData(
                QUERY_KEYS.BOOKINGS_USER(userId),
                (old = []) => old.filter((b) => b.id !== bookingId)
            );

            // 5. Return context para rollback
            return {
                previousWeeklyData,
                previousUserData,
                machineId,
                weekId,
                userId,
            };
        },

        // Success handler
        onSuccess: (data, variables, context) => {
            const { booking } = variables;
            const { machineId, weekId, userId } = booking;

            // 1. Invalidar queries relevantes
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.BOOKINGS_WEEKLY(machineId, weekId),
            });

            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.BOOKINGS_USER(userId),
            });

            // 2. Toast de éxito
            toast.success('Reserva cancelada correctamente', {
                duration: 3000
            });

            // 3. Callback custom
            onSuccess?.(data, variables, context);
        },

        // Error handler con rollback
        onError: (error, variables, context) => {
            console.error('Error cancelling booking:', error);

            // 1. Rollback optimistic updates
            if (context) {
                const {
                    previousWeeklyData,
                    previousUserData,
                    machineId,
                    weekId,
                    userId,
                } = context;

                if (previousWeeklyData !== undefined) {
                    queryClient.setQueryData(
                        QUERY_KEYS.BOOKINGS_WEEKLY(machineId, weekId),
                        previousWeeklyData
                    );
                }

                if (previousUserData !== undefined) {
                    queryClient.setQueryData(
                        QUERY_KEYS.BOOKINGS_USER(userId),
                        previousUserData
                    );
                }
            }

            // 2. Toast de error
            const errorMessage = error.message || 'Error al cancelar la reserva';

            toast.error(errorMessage, {
                duration: 5000
            });

            // 3. Callback custom
            onError?.(error, variables, context);
        },

        // Settings
        retry: 1, // Reintentar 1 vez
        retryDelay: 1000, // Esperar 1s antes de reintentar
    });
}

/**
 * Hook para cancelar múltiples bookings en batch
 * 
 * @param {Object} options - Opciones adicionales
 * @returns {Object} - useMutation result
 */
export function useCancelMultipleBookings(options = {}) {
    const { onSuccess, onError } = options;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ bookings, userId, config }) => {
            // Validar que todos los bookings se pueden cancelar
            const validations = bookings.map((booking) =>
                BookingValidator.canCancel(booking, userId, config)
            );

            const invalidBookings = validations.filter((v) => !v.can);
            if (invalidBookings.length > 0) {
                throw new Error(
                    `No se pueden cancelar ${invalidBookings.length} booking(s): ${invalidBookings[0].reason}`
                );
            }

            // Cancelar todos los bookings
            const promises = bookings.map((booking) =>
                updateDoc(doc(db, 'bookings', booking.id), {
                    status: 'cancelled',
                    cancelledAt: serverTimestamp(),
                    cancelledBy: userId,
                })
            );

            await Promise.all(promises);

            return {
                success: true,
                cancelledCount: bookings.length,
            };
        },

        onSuccess: (data, variables) => {
            const { bookings } = variables;

            // Invalidar queries de todas las semanas afectadas
            const weekIds = new Set(bookings.map((b) => b.weekId));
            const machineIds = new Set(bookings.map((b) => b.machineId));
            const userIds = new Set(bookings.map((b) => b.userId));

            for (const machineId of machineIds) {
                for (const weekId of weekIds) {
                    queryClient.invalidateQueries({
                        queryKey: QUERY_KEYS.BOOKINGS_WEEKLY(machineId, weekId),
                    });
                }
            }

            for (const userId of userIds) {
                queryClient.invalidateQueries({
                    queryKey: QUERY_KEYS.BOOKINGS_USER(userId),
                });
            }

            toast.success(`${data.cancelledCount} reservas canceladas`, {
                duration: 3000
            });

            onSuccess?.(data, variables);
        },

        onError: (error, variables) => {
            console.error('Error cancelling multiple bookings:', error);

            toast.error(error.message || 'Error al cancelar reservas', {
                duration: 5000
            });

            onError?.(error, variables);
        },
    });
}

/**
 * Hook helper para verificar si un booking se puede cancelar
 * Útil para habilitar/deshabilitar botón de cancelar
 * 
 * @param {Object} booking - Booking a verificar
 * @param {string} userId - ID del usuario
 * @param {Object} config - Configuración (minHoursToCancel)
 * @returns {Object} - { canCancel: boolean, reason?: string }
 */
export function useCanCancelBooking(booking, userId, config) {
    if (!booking) {
        return { canCancel: false, reason: 'Booking no encontrado' };
    }

    const validation = BookingValidator.canCancel(booking, userId, config);

    return {
        canCancel: validation.can,
        reason: validation.reason,
    };
}

/**
 * Hook helper para obtener el mensaje de confirmación
 * 
 * @param {Object} booking - Booking a cancelar
 * @returns {string} - Mensaje de confirmación
 */
export function getCancelConfirmationMessage(booking) {
    if (!booking) return '';

    const startTime = booking.startTime instanceof Date
        ? booking.startTime
        : booking.startTime.toDate?.() || new Date(booking.startTime);

    const date = startTime.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });

    const time = startTime.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return `¿Estás seguro de que quieres cancelar tu reserva del ${date} a las ${time}?`;
}
