/**
 * bookingHelpers - Utilidades de transformación y agrupación de bookings
 * 
 * Funciones puras para manipular arrays de bookings y slots.
 * Útil para preparar datos para la UI.
 * 
 * @module bookingHelpers
 */

import { isSameDate, formatDate, getHoursDifference } from './dateHelpers';

/**
 * Agrupa bookings por fecha
 * 
 * @param {Array} bookings - Array de bookings con startTime
 * @returns {Map<string, Array>} - Map con key = fecha string, value = array de bookings
 * 
 * @example
 * groupBookingsByDate([
 *   { startTime: new Date('2025-11-06T10:00'), ... },
 *   { startTime: new Date('2025-11-06T14:00'), ... },
 *   { startTime: new Date('2025-11-07T10:00'), ... }
 * ])
 * // Map {
 * //   'Jue 6 Nov' => [booking1, booking2],
 * //   'Vie 7 Nov' => [booking3]
 * // }
 */
export function groupBookingsByDate(bookings = []) {
    const grouped = new Map();

    bookings.forEach((booking) => {
        const dateKey = formatDate(booking.startTime);

        if (!grouped.has(dateKey)) {
            grouped.set(dateKey, []);
        }

        grouped.get(dateKey).push(booking);
    });

    return grouped;
}

/**
 * Obtiene fechas únicas de un array de slots (sin duplicados)
 * 
 * @param {Array} slots - Array de slots con startTime
 * @returns {Date[]} - Array de fechas únicas ordenadas
 * 
 * @example
 * getUniqueDates([
 *   { startTime: new Date('2025-11-06T10:00') },
 *   { startTime: new Date('2025-11-06T14:00') },
 *   { startTime: new Date('2025-11-07T10:00') }
 * ])
 * // [Date('2025-11-06'), Date('2025-11-07')]
 */
export function getUniqueDates(slots = []) {
    const uniqueDatesMap = new Map();

    slots.forEach((slot) => {
        const date = slot.startTime instanceof Date ? slot.startTime : new Date(slot.startTime);
        const dateString = date.toDateString(); // 'Thu Nov 06 2025'

        if (!uniqueDatesMap.has(dateString)) {
            uniqueDatesMap.set(dateString, date);
        }
    });

    // Convertir a array y ordenar
    return Array.from(uniqueDatesMap.values()).sort((a, b) => a - b);
}

/**
 * Calcula la duración total en horas de un array de slots
 * 
 * @param {Array} slots - Array de slots con startTime y endTime
 * @returns {number} - Total de horas
 * 
 * @example
 * calculateDuration([
 *   { startTime: new Date('2025-11-06T10:00'), endTime: new Date('2025-11-06T11:00') },
 *   { startTime: new Date('2025-11-06T14:00'), endTime: new Date('2025-11-06T15:00') }
 * ])
 * // 2
 */
export function calculateDuration(slots = []) {
    return slots.reduce((total, slot) => {
        return total + getHoursDifference(slot.startTime, slot.endTime);
    }, 0);
}

/**
 * Ordena slots por tiempo de inicio (ascendente)
 * 
 * @param {Array} slots - Array de slots con startTime
 * @returns {Array} - Array ordenado (no muta el original)
 * 
 * @example
 * sortSlotsByTime([
 *   { startTime: new Date('2025-11-06T14:00') },
 *   { startTime: new Date('2025-11-06T10:00') }
 * ])
 * // [{ startTime: 10:00 }, { startTime: 14:00 }]
 */
export function sortSlotsByTime(slots = []) {
    return [...slots].sort((a, b) => {
        const timeA = a.startTime instanceof Date ? a.startTime : new Date(a.startTime);
        const timeB = b.startTime instanceof Date ? b.startTime : new Date(b.startTime);
        return timeA - timeB;
    });
}

/**
 * Cuenta cuántos slots hay en cada fecha
 * 
 * @param {Array} slots - Array de slots con startTime
 * @returns {Object} - Objeto con key = fecha string, value = count
 * 
 * @example
 * countSlotsByDate([
 *   { startTime: new Date('2025-11-06T10:00') },
 *   { startTime: new Date('2025-11-06T14:00') },
 *   { startTime: new Date('2025-11-07T10:00') }
 * ])
 * // { 'Jue 6 Nov': 2, 'Vie 7 Nov': 1 }
 */
export function countSlotsByDate(slots = []) {
    const counts = {};

    slots.forEach((slot) => {
        const dateKey = formatDate(slot.startTime);
        counts[dateKey] = (counts[dateKey] || 0) + 1;
    });

    return counts;
}

/**
 * Filtra slots por máquina
 * 
 * @param {Array} slots - Array de slots con machineId
 * @param {string} machineId - ID de la máquina
 * @returns {Array} - Slots filtrados
 * 
 * @example
 * filterSlotsByMachine(
 *   [
 *     { machineId: 'piu-1', ... },
 *     { machineId: 'piu-2', ... },
 *     { machineId: 'piu-1', ... }
 *   ],
 *   'piu-1'
 * )
 * // [{ machineId: 'piu-1', ... }, { machineId: 'piu-1', ... }]
 */
export function filterSlotsByMachine(slots = [], machineId) {
    return slots.filter((slot) => slot.machineId === machineId);
}

/**
 * Filtra slots por fecha
 * 
 * @param {Array} slots - Array de slots con startTime
 * @param {Date|string} targetDate - Fecha objetivo
 * @returns {Array} - Slots filtrados
 * 
 * @example
 * filterSlotsByDate(
 *   [
 *     { startTime: new Date('2025-11-06T10:00') },
 *     { startTime: new Date('2025-11-07T10:00') }
 *   ],
 *   new Date('2025-11-06')
 * )
 * // [{ startTime: new Date('2025-11-06T10:00') }]
 */
export function filterSlotsByDate(slots = [], targetDate) {
    return slots.filter((slot) => isSameDate(slot.startTime, targetDate));
}

/**
 * Encuentra el primer slot disponible de una lista
 * 
 * @param {Array} slots - Array de slots con isAvailable o estado
 * @returns {Object|null} - Primer slot disponible o null
 * 
 * @example
 * findFirstAvailableSlot([
 *   { startTime: ..., isAvailable: false },
 *   { startTime: ..., isAvailable: true },
 *   { startTime: ..., isAvailable: true }
 * ])
 * // { startTime: ..., isAvailable: true } (el segundo)
 */
export function findFirstAvailableSlot(slots = []) {
    return slots.find((slot) => slot.isAvailable) || null;
}

/**
 * Cuenta cuántos slots están disponibles
 * 
 * @param {Array} slots - Array de slots con isAvailable
 * @returns {number} - Count de slots disponibles
 * 
 * @example
 * countAvailableSlots([
 *   { isAvailable: true },
 *   { isAvailable: false },
 *   { isAvailable: true }
 * ])
 * // 2
 */
export function countAvailableSlots(slots = []) {
    return slots.filter((slot) => slot.isAvailable).length;
}

/**
 * Agrupa slots por estado
 * 
 * @param {Array} slots - Array de slots con status field
 * @returns {Object} - Objeto con keys por status
 * 
 * @example
 * groupSlotsByStatus([
 *   { status: 'available', ... },
 *   { status: 'booked', ... },
 *   { status: 'available', ... }
 * ])
 * // {
 * //   available: [slot1, slot3],
 * //   booked: [slot2]
 * // }
 */
export function groupSlotsByStatus(slots = []) {
    return slots.reduce((acc, slot) => {
        const status = slot.status || 'unknown';
        if (!acc[status]) {
            acc[status] = [];
        }
        acc[status].push(slot);
        return acc;
    }, {});
}

/**
 * Obtiene el rango de fechas de un array de slots
 * 
 * @param {Array} slots - Array de slots con startTime
 * @returns {Object} - { start: Date, end: Date } o null si vacío
 * 
 * @example
 * getDateRange([
 *   { startTime: new Date('2025-11-06T10:00') },
 *   { startTime: new Date('2025-11-08T14:00') }
 * ])
 * // { start: Date('2025-11-06'), end: Date('2025-11-08') }
 */
export function getDateRange(slots = []) {
    if (slots.length === 0) return null;

    const dates = slots.map((slot) => {
        return slot.startTime instanceof Date ? slot.startTime : new Date(slot.startTime);
    });

    return {
        start: new Date(Math.min(...dates)),
        end: new Date(Math.max(...dates)),
    };
}

/**
 * Verifica si hay algún conflicto de horarios entre slots
 * 
 * @param {Array} slots - Array de slots con startTime y endTime
 * @returns {boolean} - true si hay conflictos
 * 
 * @example
 * hasTimeConflicts([
 *   { startTime: Date('10:00'), endTime: Date('11:00') },
 *   { startTime: Date('10:30'), endTime: Date('11:30') } // Conflicto
 * ])
 * // true
 */
export function hasTimeConflicts(slots = []) {
    const sorted = sortSlotsByTime(slots);

    for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];

        const currentEnd = current.endTime instanceof Date ? current.endTime : new Date(current.endTime);
        const nextStart = next.startTime instanceof Date ? next.startTime : new Date(next.startTime);

        // Hay conflicto si el siguiente empieza antes de que termine el actual
        if (nextStart < currentEnd) {
            return true;
        }
    }

    return false;
}

/**
 * Formatea un array de slots para mostrar en UI (resumen)
 * 
 * @param {Array} slots - Array de slots
 * @returns {string} - String formateado (ej: "3 slots en 2 fechas")
 * 
 * @example
 * formatSlotsSummary([slot1, slot2, slot3])
 * // "3 slots en 2 fechas"
 */
export function formatSlotsSummary(slots = []) {
    if (slots.length === 0) return 'Sin slots seleccionados';

    const uniqueDates = getUniqueDates(slots);
    const slotCount = slots.length;
    const dateCount = uniqueDates.length;

    return `${slotCount} slot${slotCount === 1 ? '' : 's'} en ${dateCount} fecha${dateCount === 1 ? '' : 's'}`;
}

/**
 * Genera un objeto de slot para la UI con todos los datos necesarios
 * 
 * @param {Date} startTime - Hora de inicio
 * @param {Date} endTime - Hora de fin
 * @param {string} machineId - ID de la máquina
 * @param {Object} additionalData - Datos adicionales
 * @returns {Object} - Objeto slot completo
 * 
 * @example
 * createSlotObject(
 *   new Date('2025-11-06T10:00'),
 *   new Date('2025-11-06T11:00'),
 *   'piu-1',
 *   { categoryId: 'piu' }
 * )
 * // { startTime, endTime, machineId, categoryId, ... }
 */
export function createSlotObject(startTime, endTime, machineId, additionalData = {}) {
    return {
        startTime,
        endTime,
        machineId,
        ...additionalData,
    };
}
