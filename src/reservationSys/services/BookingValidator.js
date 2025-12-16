/**
 * BookingValidator - Single Source of Truth para Validaciones de Reservas
 * 
 * Service class con métodos estáticos para validar disponibilidad, selección y bookings.
 * Usado en frontend y puede ser reutilizado en Cloud Functions.
 * 
 * @class BookingValidator
 */

import { isBefore, isAfter, parseISO, addHours, startOfWeek, startOfToday, addWeeks } from 'date-fns';

class BookingValidator {
    /**
     * Verifica si un slot está disponible (no reservado por otros)
     * 
     * @param {Object} slot - Slot a verificar { startTime, endTime, machineId }
     * @param {Array} existingBookings - Array de bookings existentes
     * @returns {boolean} - true si está disponible
     */
    static isAvailable(slot, existingBookings = []) {
        if (!slot || !slot.startTime || !slot.endTime) return false;

        const slotStart = slot.startTime instanceof Date ? slot.startTime : parseISO(slot.startTime);
        const slotEnd = slot.endTime instanceof Date ? slot.endTime : parseISO(slot.endTime);

        // Verificar que no haya conflictos con bookings existentes
        return !existingBookings.some((booking) => {
            // Solo considerar bookings activos de la misma máquina
            if (booking.status !== 'active' || booking.machineId !== slot.machineId) {
                return false;
            }

            const bookingStart = booking.startTime instanceof Date
                ? booking.startTime
                : booking.startTime.toDate
                    ? booking.startTime.toDate()
                    : parseISO(booking.startTime);

            const bookingEnd = booking.endTime instanceof Date
                ? booking.endTime
                : booking.endTime.toDate
                    ? booking.endTime.toDate()
                    : parseISO(booking.endTime);

            // Hay conflicto si:
            // - slot empieza antes de que termine el booking Y
            // - slot termina después de que empiece el booking
            return isBefore(slotStart, bookingEnd) && isAfter(slotEnd, bookingStart);
        });
    }

    /**
     * Verifica si un slot está en el pasado
     * 
     * @param {Object} slot - Slot con startTime
     * @returns {boolean} - true si está en el pasado
     */
    static isPast(slot) {
        if (!slot || !slot.startTime) return true;

        const slotStart = slot.startTime instanceof Date ? slot.startTime : parseISO(slot.startTime);
        return isBefore(slotStart, new Date());
    }

    /**
     * Verifica si el usuario puede seleccionar un slot adicional
     * ✅ FEATURE 3: Valida que usuario normal no seleccione slots fuera del rango permitido
     * 
     * @param {Object} slot - Slot a seleccionar
     * @param {Array} currentSelection - Slots ya seleccionados
     * @param {Object} rules - Reglas de config (maxSlotsPerDay, maxSlotsPerWeek, maxWeeksInAdvanceForUsers, etc.)
     * @param {boolean} isAdmin - Si el usuario es admin (default: false)
     * @returns {Object} - { can: boolean, reason?: string }
     */
    static canSelectSlot(slot, currentSelection = [], rules = {}, isAdmin = false) {
        // Verificar que el slot no esté en el pasado
        if (this.isPast(slot)) {
            return { can: false, reason: 'No puedes reservar slots en el pasado' };
        }

        // ✅ FEATURE 1: Admin bypass - Administradores pueden saltarse límites de slots
        if (isAdmin) {
            // Verificar que el slot no esté ya seleccionado
            const alreadySelected = currentSelection.some(
                (s) => this.isSameSlot(s, slot)
            );
            if (alreadySelected) {
                return { can: true, reason: 'Ya seleccionado (click para deseleccionar)' };
            }

            // Admin puede seleccionar sin restricciones (modo privilegiado)
            return { can: true, adminMode: true };
        }

        // ✅ FEATURE 3: Usuarios normales solo pueden seleccionar slots dentro del rango permitido
        if (!isAdmin && rules.maxWeeksInAdvanceForUsers !== undefined) {
            const maxWeeksForUsers = rules.maxWeeksInAdvanceForUsers ?? 0;
            const today = startOfToday();
            const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
            const maxAllowedWeek = addWeeks(currentWeekStart, maxWeeksForUsers);

            const slotDate = slot.startTime instanceof Date ? slot.startTime : parseISO(slot.startTime);
            const slotWeekStart = startOfWeek(slotDate, { weekStartsOn: 1 });

            if (slotWeekStart > maxAllowedWeek) {
                return {
                    can: false,
                    reason: maxWeeksForUsers === 0
                        ? 'Solo puedes reservar en la semana actual'
                        : `Solo puedes reservar hasta ${maxWeeksForUsers} semana${maxWeeksForUsers === 1 ? '' : 's'} en adelante`
                };
            }
        }

        // Verificar que el slot no esté ya seleccionado
        const alreadySelected = currentSelection.some(
            (s) => this.isSameSlot(s, slot)
        );
        if (alreadySelected) {
            return { can: true, reason: 'Ya seleccionado (click para deseleccionar)' };
        }

        // Verificar límite de slots por día
        if (rules.maxSlotsPerDay) {
            const slotDate = slot.startTime instanceof Date
                ? slot.startTime.toDateString()
                : parseISO(slot.startTime).toDateString();

            const slotsInSameDay = currentSelection.filter((s) => {
                const sDate = s.startTime instanceof Date
                    ? s.startTime.toDateString()
                    : parseISO(s.startTime).toDateString();
                return sDate === slotDate;
            }).length;

            if (slotsInSameDay >= rules.maxSlotsPerDay) {
                return {
                    can: false,
                    reason: `Máximo ${rules.maxSlotsPerDay} slots por día (ya tienes ${slotsInSameDay})`
                };
            }
        }

        // Verificar límite de slots por semana
        if (rules.maxSlotsPerWeek) {
            const totalSlots = currentSelection.length;
            if (totalSlots >= rules.maxSlotsPerWeek) {
                return {
                    can: false,
                    reason: `Máximo ${rules.maxSlotsPerWeek} slots por semana (ya tienes ${totalSlots})`
                };
            }
        }

        // Verificar back-to-back booking si no está permitido
        if (rules.allowBackToBackBooking === false) {
            const hasBackToBack = currentSelection.some((s) => {
                const sEnd = s.endTime instanceof Date ? s.endTime : parseISO(s.endTime);
                const slotStart = slot.startTime instanceof Date ? slot.startTime : parseISO(slot.startTime);
                const sStart = s.startTime instanceof Date ? s.startTime : parseISO(s.startTime);
                const slotEnd = slot.endTime instanceof Date ? slot.endTime : parseISO(slot.endTime);

                // Verificar si el nuevo slot es inmediatamente después o antes de uno existente
                return (
                    sEnd.getTime() === slotStart.getTime() ||
                    slotEnd.getTime() === sStart.getTime()
                );
            });

            if (hasBackToBack) {
                return {
                    can: false,
                    reason: 'No se permiten reservas consecutivas'
                };
            }
        }

        return { can: true };
    }

    /**
     * Valida un conjunto de slots para booking final
     * 
     * @param {Array} slots - Slots a reservar
     * @param {Object} rules - Reglas de config
     * @param {Array} existingBookings - Bookings existentes (para verificar disponibilidad)
     * @returns {Object} - { valid: boolean, errors: string[] }
     */
    static validateBooking(slots = [], rules = {}, existingBookings = []) {
        const errors = [];

        // Validación básica
        if (!slots || slots.length === 0) {
            errors.push('Debes seleccionar al menos un slot');
            return { valid: false, errors };
        }

        // Verificar que todos los slots estén disponibles
        slots.forEach((slot, index) => {
            if (!this.isAvailable(slot, existingBookings)) {
                errors.push(`Slot ${index + 1} ya no está disponible`);
            }
        });

        // Verificar que ningún slot esté en el pasado
        slots.forEach((slot, index) => {
            if (this.isPast(slot)) {
                errors.push(`Slot ${index + 1} está en el pasado`);
            }
        });

        // Verificar límites por día
        if (rules.maxSlotsPerDay) {
            const slotsByDate = {};
            slots.forEach((slot) => {
                const date = slot.startTime instanceof Date
                    ? slot.startTime.toDateString()
                    : parseISO(slot.startTime).toDateString();
                slotsByDate[date] = (slotsByDate[date] || 0) + 1;
            });

            Object.entries(slotsByDate).forEach(([date, count]) => {
                if (count > rules.maxSlotsPerDay) {
                    errors.push(`Excedes el límite de ${rules.maxSlotsPerDay} slots por día en ${date}`);
                }
            });
        }

        // Verificar límite total semanal
        if (rules.maxSlotsPerWeek && slots.length > rules.maxSlotsPerWeek) {
            errors.push(`Excedes el límite de ${rules.maxSlotsPerWeek} slots por semana`);
        }

        // Verificar back-to-back si no está permitido
        if (rules.allowBackToBackBooking === false) {
            const sortedSlots = [...slots].sort((a, b) => {
                const aStart = a.startTime instanceof Date ? a.startTime : parseISO(a.startTime);
                const bStart = b.startTime instanceof Date ? b.startTime : parseISO(b.startTime);
                return aStart - bStart;
            });

            for (let i = 0; i < sortedSlots.length - 1; i++) {
                const current = sortedSlots[i];
                const next = sortedSlots[i + 1];
                const currentEnd = current.endTime instanceof Date ? current.endTime : parseISO(current.endTime);
                const nextStart = next.startTime instanceof Date ? next.startTime : parseISO(next.startTime);

                if (currentEnd.getTime() === nextStart.getTime()) {
                    errors.push('No se permiten reservas consecutivas');
                    break;
                }
            }
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * ✅ FEATURE 1: Validación relajada para bookings creados por administradores
     * Solo verifica reglas críticas: userId presente, slots no vacíos, y slots no en el pasado
     * Los admins pueden ignorar límites de slots por día/semana
     * 
     * @param {Object} bookingData - Datos del booking a crear { userId, slots, ... }
     * @returns {Object} - { valid: boolean, errors: string[] }
     */
    static validateAdminBooking(bookingData = {}) {
        const errors = [];

        // Validar que userId esté presente
        if (!bookingData.userId || bookingData.userId.trim() === '') {
            errors.push('Debes seleccionar un usuario para la reserva');
        }

        // Validar que slots no esté vacío
        if (!bookingData.slots || bookingData.slots.length === 0) {
            errors.push('Debes seleccionar al menos un slot');
            return { valid: false, errors };
        }

        // Verificar que ningún slot esté en el pasado
        bookingData.slots.forEach((slot, index) => {
            if (this.isPast(slot)) {
                errors.push(`Slot ${index + 1} está en el pasado`);
            }
        });

        return { valid: errors.length === 0, errors };
    }

    /**
     * ✅ FEATURE 1: Verifica si un administrador puede sobrescribir/reservar un slot
     * Detecta si hay conflicto con otra reserva existente y si es propia del usuario seleccionado
     * 
     * @param {Object} slot - Slot a verificar { startTime, endTime, ... }
     * @param {Array} existingBookings - Array de bookings existentes
     * @param {string} selectedUserId - ID del usuario para el cual se está creando la reserva
     * @returns {Object} - { canOverride: boolean, conflict?: { bookingId, userId, userName }, isOwnBooking: boolean }
     */
    static canOverrideSlot(slot, existingBookings = [], selectedUserId = null) {
        // Buscar si el slot tiene conflicto con alguna reserva existente
        const conflictingBooking = existingBookings.find((booking) => {
            // Solo considerar bookings activos
            if (booking.status !== 'active') return false;

            // Verificar si alguno de los slots del booking coincide con el slot target
            return booking.slots?.some((bookedSlot) => this.isSameSlot(bookedSlot, slot));
        });

        // Si no hay conflicto, el admin puede reservar libremente
        if (!conflictingBooking) {
            return {
                canOverride: true,
                isOwnBooking: false
            };
        }

        // Hay conflicto: verificar si es una reserva del mismo usuario
        const isOwnBooking = conflictingBooking.userId === selectedUserId;

        return {
            canOverride: true, // Admin siempre puede override, pero con advertencia
            conflict: {
                bookingId: conflictingBooking.id,
                userId: conflictingBooking.userId,
                userName: conflictingBooking.userName || 'Usuario desconocido'
            },
            isOwnBooking
        };
    }

    /**
     * Obtiene solo los errores de validación (helper para UI)
     * 
     * @param {Array} slots - Slots a validar
     * @param {Object} rules - Reglas de config
     * @param {Array} existingBookings - Bookings existentes
     * @returns {string[]} - Array de strings con errores
     */
    static getValidationErrors(slots, rules, existingBookings) {
        const result = this.validateBooking(slots, rules, existingBookings);
        return result.errors;
    }

    /**
     * Verifica si un usuario puede cancelar un booking
     * 
     * @param {Object} booking - Booking a cancelar
     * @param {string} userId - ID del usuario actual
     * @param {Object} rules - Reglas de config (minHoursToCancel)
     * @returns {Object} - { can: boolean, reason?: string }
     */
    static canCancel(booking, userId, rules = {}) {
        // Verificar que el booking existe
        if (!booking) {
            return { can: false, reason: 'Booking no encontrado' };
        }

        // Verificar que el booking esté activo
        if (booking.status !== 'active') {
            return { can: false, reason: 'Este booking ya fue cancelado' };
        }

        // Verificar que sea el dueño del booking
        if (booking.userId !== userId) {
            return { can: false, reason: 'Solo puedes cancelar tus propias reservas' };
        }

        // Verificar que no esté en el pasado
        const bookingStart = booking.startTime instanceof Date
            ? booking.startTime
            : booking.startTime.toDate
                ? booking.startTime.toDate()
                : parseISO(booking.startTime);

        if (isBefore(bookingStart, new Date())) {
            return { can: false, reason: 'No puedes cancelar reservas pasadas' };
        }

        // Verificar límite de horas mínimas para cancelar
        if (rules.minHoursToCancel) {
            const minCancelTime = addHours(new Date(), rules.minHoursToCancel);
            if (isBefore(bookingStart, minCancelTime)) {
                return {
                    can: false,
                    reason: `Debes cancelar con al menos ${rules.minHoursToCancel} horas de anticipación`
                };
            }
        }

        return { can: true };
    }

    /**
     * Compara dos slots para verificar si son el mismo
     * 
     * @param {Object} slot1 - Primer slot
     * @param {Object} slot2 - Segundo slot
     * @returns {boolean} - true si son el mismo slot
     */
    static isSameSlot(slot1, slot2) {
        if (!slot1 || !slot2) return false;

        const start1 = slot1.startTime instanceof Date ? slot1.startTime : parseISO(slot1.startTime);
        const start2 = slot2.startTime instanceof Date ? slot2.startTime : parseISO(slot2.startTime);

        return (
            start1.getTime() === start2.getTime() &&
            slot1.machineId === slot2.machineId
        );
    }
}

export default BookingValidator;
