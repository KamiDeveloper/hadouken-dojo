/**
 * useCreateBooking - React Query mutation para crear bookings
 * 
 * Features:
 * - Batch write de múltiples slots
 * - Validación pre-submit con BookingValidator
 * - Optimistic update
 * - Error handling con rollback
 * - Success toast + invalidate queries
 * - Integración de weekId para O(1) queries
 * 
 * @hook useCreateBooking
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { QUERY_KEYS } from '../../../config/queryClient';
import { getWeekId } from '../../../utils/dateHelpers';
import BookingValidator from '../../services/BookingValidator';
import toast from 'react-hot-toast';

/**
 * Crea múltiples bookings en batch
 * 
 * @param {Object} bookingData - Datos de la reserva
 * @param {string} bookingData.userId - ID del usuario
 * @param {string} bookingData.username - Username del usuario (para mostrar en slots)
 * @param {string} bookingData.machineId - ID de la máquina
 * @param {string} bookingData.categoryId - ID de la categoría
 * @param {Array} bookingData.slots - Array de slots { startTime, endTime }
 * @returns {Promise<Object>} - { success: boolean, bookingIds: string[], errors: string[] }
 */
async function createBookingBatch({ userId, username, machineId, categoryId, slots }) {
    // Validar inputs
    if (!userId || !username || !machineId || !categoryId || !slots || slots.length === 0) {
        throw new Error('Datos incompletos para crear la reserva');
    }

    const batch = writeBatch(db);
    const bookingIds = [];
    const bookingsRef = collection(db, 'bookings');

    // Crear un documento por cada slot
    for (const slot of slots) {
        const bookingRef = doc(bookingsRef);
        const weekId = getWeekId(slot.startTime);

        const bookingData = {
            userId,
            username, // ✅ DENORMALIZACIÓN: Username para mostrar en slots sin queries adicionales
            machineId,
            categoryId,
            weekId, // CRÍTICO para queries O(1)
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: 'active',
            createdAt: serverTimestamp(),
        };

        batch.set(bookingRef, bookingData);
        bookingIds.push(bookingRef.id);
    }

    // Commit batch
    await batch.commit();

    return {
        success: true,
        bookingIds,
        errors: [],
    };
}

/**
 * Hook para crear bookings
 * 
 * @param {Object} options - Opciones adicionales
 * @param {Function} options.onSuccess - Callback al completar exitosamente
 * @param {Function} options.onError - Callback al encontrar error
 * @param {Object} options.config - Configuración de validación (rules)
 * @param {Array} options.existingBookings - Bookings existentes para validación
 * @returns {Object} - useMutation result con mutate, isLoading, error
 */
export function useCreateBooking(options = {}) {
    const { onSuccess, onError, config = {}, existingBookings = [] } = options;
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createBookingBatch,

        // Pre-submit validation
        onMutate: async (variables) => {
            const { slots, userId, username, machineId } = variables;

            // 1. Validar con BookingValidator
            const validation = BookingValidator.validateBooking(
                slots,
                config,
                existingBookings
            );

            if (!validation.valid) {
                // Rechazar mutation si no pasa validación
                throw new Error(validation.errors.join(', '));
            }

            // 2. Optimistic update - Agregar bookings temporalmente al cache
            const weekIds = [...new Set(slots.map((slot) => getWeekId(slot.startTime)))];

            const previousData = {};

            for (const weekId of weekIds) {
                const queryKey = QUERY_KEYS.BOOKINGS_WEEKLY(machineId, weekId);

                // Guardar data anterior para rollback
                previousData[weekId] = queryClient.getQueryData(queryKey);

                // Agregar bookings optimistas
                queryClient.setQueryData(queryKey, (old = []) => {
                    const optimisticBookings = slots
                        .filter((slot) => getWeekId(slot.startTime) === weekId)
                        .map((slot, index) => ({
                            id: `temp-${Date.now()}-${index}`,
                            userId,
                            username, // ✅ Incluir username en optimistic update
                            machineId,
                            categoryId: variables.categoryId,
                            weekId,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            status: 'active',
                            createdAt: new Date(),
                            _optimistic: true, // Flag para identificar
                        }));

                    return [...old, ...optimisticBookings];
                });
            }

            // Retornar context para rollback
            return { previousData, weekIds, machineId };
        },

        // Success handler
        onSuccess: (data, variables, context) => {
            // 1. Invalidar queries relevantes
            const { machineId } = variables;
            const { weekIds } = context;

            // Invalidar bookings semanales
            for (const weekId of weekIds) {
                const queryKey = QUERY_KEYS.BOOKINGS_WEEKLY(machineId, weekId);
                queryClient.invalidateQueries({
                    queryKey,
                });
            }

            // Invalidar bookings del usuario
            queryClient.invalidateQueries({
                queryKey: QUERY_KEYS.BOOKINGS_USER(variables.userId),
            });

            // 2. Toast de éxito
            toast.success(
                `¡Reserva confirmada! ${data.bookingIds.length} slot${data.bookingIds.length === 1 ? '' : 's'} reservado${data.bookingIds.length === 1 ? '' : 's'}`,
                {
                    duration: 4000,
                    icon: '✅',
                }
            );

            // 3. Callback custom
            onSuccess?.(data, variables, context);
        },

        // Error handler con rollback
        onError: (error, variables, context) => {
            console.error('Error creating booking:', error);

            // 1. Rollback optimistic updates
            if (context) {
                const { previousData, weekIds, machineId } = context;

                for (const weekId of weekIds) {
                    const queryKey = QUERY_KEYS.BOOKINGS_WEEKLY(machineId, weekId);

                    if (previousData[weekId] !== undefined) {
                        queryClient.setQueryData(queryKey, previousData[weekId]);
                    }
                }
            }

            // 2. Toast de error
            const errorMessage = error.message || 'Error al crear la reserva';

            toast.error(errorMessage, {
                duration: 5000,
                icon: '❌',
            });

            // 3. Callback custom
            onError?.(error, variables, context);
        },

        // Settings
        retry: 1, // Reintentar 1 vez en caso de error de red
        retryDelay: 1000, // Esperar 1s antes de reintentar
    });
}

/**
 * Hook para crear un solo booking (helper simplificado)
 * 
 * @param {Object} options - Opciones adicionales
 * @returns {Object} - useMutation result
 */
export function useCreateSingleBooking(options = {}) {
    const createBooking = useCreateBooking(options);

    return {
        ...createBooking,
        mutate: ({ userId, username, machineId, categoryId, slot }) => {
            createBooking.mutate({
                userId,
                username,
                machineId,
                categoryId,
                slots: [slot],
            });
        },
        mutateAsync: async ({ userId, username, machineId, categoryId, slot }) => {
            return createBooking.mutateAsync({
                userId,
                username,
                machineId,
                categoryId,
                slots: [slot],
            });
        },
    };
}

/**
 * Hook helper para validar antes de intentar crear booking
 * Útil para validar en tiempo real sin hacer la mutation
 * 
 * @param {Array} slots - Slots a validar
 * @param {Object} config - Configuración de validación
 * @param {Array} existingBookings - Bookings existentes
 * @returns {Object} - { isValid, errors }
 */
export function useValidateBooking(slots, config, existingBookings) {
    const validation = BookingValidator.validateBooking(
        slots,
        config,
        existingBookings
    );

    return {
        isValid: validation.valid,
        errors: validation.errors,
    };
}
