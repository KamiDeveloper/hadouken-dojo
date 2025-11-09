/**
 * useCalendarLogic - Hook central para la lógica del calendario de reservas
 * 
 * Maneja:
 * - Selección de slots (selectedSlots state)
 * - Navegación de semanas (currentWeek state)
 * - Validación con BookingValidator
 * - Warnings en tiempo real (max 2 slots/día)
 * 
 * @hook useCalendarLogic
 */

import { useState, useCallback, useMemo } from 'react';
import { startOfWeek, addWeeks, subWeeks, startOfToday } from 'date-fns';
import BookingValidator from '../services/BookingValidator';
import { getWeekDates, isSameSlot } from '../../utils/dateHelpers';
import { countSlotsByDate, getUniqueDates, sortSlotsByTime } from '../../utils/bookingHelpers';

/**
 * Hook para manejar la lógica del calendario
 * 
 * @param {Object} options - Opciones de configuración
 * @param {Object} options.rules - Reglas de config (maxSlotsPerDay, maxSlotsPerWeek, etc.)
 * @param {Array} options.existingBookings - Bookings ya existentes (para validación)
 * @param {Function} options.onSlotSelected - Callback cuando se selecciona un slot
 * @param {Function} options.onSlotDeselected - Callback cuando se deselecciona un slot
 * @param {Function} options.onValidationError - Callback cuando hay error de validación
 * 
 * @returns {Object} - Estado y funciones del calendario
 */
export function useCalendarLogic(options = {}) {
    const {
        rules = {},
        existingBookings = [],
        onSlotSelected,
        onSlotDeselected,
        onValidationError,
    } = options;

    // ============================================
    // STATE
    // ============================================

    // Slots seleccionados por el usuario
    const [selectedSlots, setSelectedSlots] = useState([]);

    // Semana actual (Date del inicio de la semana)
    const [currentWeek, setCurrentWeek] = useState(() => {
        return startOfWeek(startOfToday(), { weekStartsOn: 1 }); // 1 = Lunes
    });

    // ============================================
    // COMPUTED VALUES
    // ============================================

    // Fechas de la semana actual (array de 7 días)
    const weekDates = useMemo(() => {
        return getWeekDates(currentWeek);
    }, [currentWeek]);

    // Slots ordenados por tiempo
    const sortedSelectedSlots = useMemo(() => {
        return sortSlotsByTime(selectedSlots);
    }, [selectedSlots]);

    // Conteo de slots por fecha
    const slotsPerDate = useMemo(() => {
        return countSlotsByDate(selectedSlots);
    }, [selectedSlots]);

    // Fechas únicas seleccionadas
    const uniqueDates = useMemo(() => {
        return getUniqueDates(selectedSlots);
    }, [selectedSlots]);

    // Warnings activos
    const warnings = useMemo(() => {
        const warns = [];

        // Warning si se alcanza el límite de slots por día
        if (rules.maxSlotsPerDay) {
            Object.entries(slotsPerDate).forEach(([date, count]) => {
                if (count >= rules.maxSlotsPerDay) {
                    warns.push({
                        type: 'max-slots-per-day',
                        message: `⚠️ ${count}/${rules.maxSlotsPerDay} slots en ${date}`,
                        severity: count > rules.maxSlotsPerDay ? 'error' : 'warning',
                    });
                }
            });
        }

        // Warning si se acerca al límite semanal
        if (rules.maxSlotsPerWeek) {
            const remaining = rules.maxSlotsPerWeek - selectedSlots.length;
            if (remaining <= 1 && remaining > 0) {
                warns.push({
                    type: 'max-slots-per-week-warning',
                    message: `⚠️ Solo puedes reservar ${remaining} slot${remaining === 1 ? '' : 's'} más esta semana`,
                    severity: 'warning',
                });
            } else if (remaining === 0) {
                warns.push({
                    type: 'max-slots-per-week-reached',
                    message: `⚠️ Has alcanzado el límite de ${rules.maxSlotsPerWeek} slots por semana`,
                    severity: 'error',
                });
            }
        }

        return warns;
    }, [selectedSlots, slotsPerDate, rules]);

    // ============================================
    // ACTIONS
    // ============================================

    /**
     * Alterna la selección de un slot (select o deselect)
     * 
     * @param {Object} slot - Slot a seleccionar/deseleccionar
     */
    const toggleSlotSelection = useCallback(
        (slot) => {
            // Verificar si el slot ya está seleccionado
            const isSelected = selectedSlots.some((s) => isSameSlot(s, slot));

            if (isSelected) {
                // DESELECCIONAR
                setSelectedSlots((prev) => prev.filter((s) => !isSameSlot(s, slot)));
                onSlotDeselected?.(slot);
            } else {
                // SELECCIONAR
                // Validar con BookingValidator
                const validation = BookingValidator.canSelectSlot(slot, selectedSlots, rules);

                if (!validation.can) {
                    // No se puede seleccionar, mostrar error
                    onValidationError?.({
                        type: 'selection-denied',
                        message: validation.reason,
                        slot,
                    });
                    return;
                }

                // Agregar a selección
                setSelectedSlots((prev) => [...prev, slot]);
                onSlotSelected?.(slot);
            }
        },
        [selectedSlots, rules, onSlotSelected, onSlotDeselected, onValidationError]
    );

    /**
     * Limpia toda la selección
     */
    const clearSelection = useCallback(() => {
        setSelectedSlots([]);
    }, []);

    /**
     * Navega a la semana anterior o siguiente
     * 
     * @param {string} direction - 'prev' o 'next'
     */
    const navigateWeek = useCallback((direction) => {
        setCurrentWeek((prev) => {
            if (direction === 'prev') {
                return subWeeks(prev, 1);
            } else if (direction === 'next') {
                return addWeeks(prev, 1);
            }
            return prev;
        });
    }, []);

    /**
     * Vuelve a la semana actual (hoy)
     */
    const goToToday = useCallback(() => {
        setCurrentWeek(startOfWeek(startOfToday(), { weekStartsOn: 1 }));
    }, []);

    /**
     * Verifica si un slot está seleccionado
     * 
     * @param {Object} slot - Slot a verificar
     * @returns {boolean} - true si está seleccionado
     */
    const isSlotSelected = useCallback(
        (slot) => {
            return selectedSlots.some((s) => isSameSlot(s, slot));
        },
        [selectedSlots]
    );

    /**
     * Valida la selección completa antes de hacer booking
     * 
     * @returns {Object} - { valid: boolean, errors: string[] }
     */
    const validateSelection = useCallback(() => {
        return BookingValidator.validateBooking(selectedSlots, rules, existingBookings);
    }, [selectedSlots, rules, existingBookings]);

    /**
     * Obtiene el estado de un slot (disponible, reservado, pasado, etc.)
     * 
     * @param {Object} slot - Slot a verificar
     * @param {string} currentUserId - ID del usuario actual
     * @returns {string} - Estado: 'available', 'selected', 'booked', 'mine', 'past', 'disabled'
     */
    const getSlotStatus = useCallback(
        (slot, currentUserId) => {
            // Verificar si está seleccionado
            if (isSlotSelected(slot)) {
                return 'selected';
            }

            // Verificar si está en el pasado
            if (BookingValidator.isPast(slot)) {
                return 'past';
            }

            // Verificar si está reservado
            const isBooked = !BookingValidator.isAvailable(slot, existingBookings);
            if (isBooked) {
                // Verificar si es del usuario actual
                const userBooking = existingBookings.find((booking) => {
                    return (
                        booking.userId === currentUserId &&
                        booking.machineId === slot.machineId &&
                        booking.status === 'active' &&
                        isSameSlot(
                            { startTime: booking.startTime, machineId: booking.machineId },
                            slot
                        )
                    );
                });

                return userBooking ? 'mine' : 'booked';
            }

            // Disponible
            return 'available';
        },
        [isSlotSelected, existingBookings]
    );

    /**
     * Verifica si se puede navegar a la semana siguiente
     * (basado en maxWeeksInAdvance)
     * 
     * @returns {boolean} - true si se puede navegar
     */
    const canNavigateNext = useCallback(() => {
        if (!rules.maxWeeksInAdvance) return true;

        const today = startOfToday();
        const maxWeek = addWeeks(startOfWeek(today, { weekStartsOn: 1 }), rules.maxWeeksInAdvance);

        return currentWeek < maxWeek;
    }, [currentWeek, rules.maxWeeksInAdvance]);

    /**
     * Verifica si se puede navegar a la semana anterior
     * (no se puede ir antes de la semana actual)
     * 
     * @returns {boolean} - true si se puede navegar
     */
    const canNavigatePrev = useCallback(() => {
        const today = startOfToday();
        const thisWeek = startOfWeek(today, { weekStartsOn: 1 });

        return currentWeek > thisWeek;
    }, [currentWeek]);

    // ============================================
    // RETURN
    // ============================================

    return {
        // State
        selectedSlots,
        sortedSelectedSlots,
        currentWeek,
        weekDates,
        slotsPerDate,
        uniqueDates,
        warnings,

        // Actions
        toggleSlotSelection,
        clearSelection,
        navigateWeek,
        goToToday,
        isSlotSelected,
        validateSelection,
        getSlotStatus,
        canNavigateNext,
        canNavigatePrev,

        // Computed
        hasSelection: selectedSlots.length > 0,
        selectionCount: selectedSlots.length,
        dateCount: uniqueDates.length,
    };
}
