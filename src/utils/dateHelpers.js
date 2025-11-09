/**
 * dateHelpers - Utilidades para manejo de fechas en el sistema de reservas
 * 
 * Todas las funciones usan date-fns para manipulación de fechas.
 * Formato weekId: "2025-W45" (ISO 8601 week format)
 * 
 * @module dateHelpers
 */

import {
    format,
    startOfWeek,
    addDays,
    getISOWeek,
    getYear,
    isToday as isTodayFns,
    parseISO,
    isSameDay,
    startOfDay,
    endOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Genera el weekId en formato ISO 8601 (ej: "2025-W45")
 * 
 * @param {Date|string} date - Fecha para obtener el weekId
 * @returns {string} - WeekId en formato "YYYY-Wnn"
 * 
 * @example
 * getWeekId(new Date('2025-11-06')) // "2025-W45"
 */
export function getWeekId(date) {
    const dateObj = date instanceof Date ? date : parseISO(date);
    const year = getYear(dateObj);
    const week = getISOWeek(dateObj);
    return `${year}-W${String(week).padStart(2, '0')}`;
}

/**
 * Obtiene un array de 7 fechas para la semana completa
 * 
 * @param {Date|string} startDate - Fecha de inicio de la semana (puede ser cualquier día)
 * @returns {Date[]} - Array de 7 fechas (Lunes a Domingo)
 * 
 * @example
 * getWeekDates(new Date('2025-11-06')) 
 * // [Mon Nov 4, Tue Nov 5, Wed Nov 6, Thu Nov 7, Fri Nov 8, Sat Nov 9, Sun Nov 10]
 */
export function getWeekDates(startDate) {
    const dateObj = startDate instanceof Date ? startDate : parseISO(startDate);
    const weekStart = startOfWeek(dateObj, { weekStartsOn: 1 }); // 1 = Lunes

    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

/**
 * Formatea una fecha/hora a formato de tiempo (HH:mm)
 * 
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} - Tiempo en formato "HH:mm" (ej: "10:00", "14:30")
 * 
 * @example
 * formatTime(new Date('2025-11-06T10:00:00')) // "10:00"
 */
export function formatTime(date) {
    const dateObj = date instanceof Date ? date : parseISO(date);
    return format(dateObj, 'HH:mm');
}

/**
 * Formatea una fecha a formato corto localizado
 * 
 * @param {Date|string} date - Fecha a formatear
 * @param {string} formatStr - Formato deseado (default: "EEE d MMM")
 * @returns {string} - Fecha formateada (ej: "Lun 4 Nov", "Miércoles 6 Noviembre")
 * 
 * @example
 * formatDate(new Date('2025-11-06')) // "Jue 6 Nov"
 * formatDate(new Date('2025-11-06'), 'EEEE d MMMM') // "Jueves 6 Noviembre"
 */
export function formatDate(date, formatStr = 'EEE d MMM') {
    const dateObj = date instanceof Date ? date : parseISO(date);
    return format(dateObj, formatStr, { locale: es });
}

/**
 * Formatea un rango de fechas (inicio y fin de semana)
 * 
 * @param {Date|string} startDate - Fecha de inicio
 * @param {Date|string} endDate - Fecha de fin
 * @returns {string} - Rango formateado (ej: "4 Nov - 8 Nov 2025")
 * 
 * @example
 * formatWeekRange(new Date('2025-11-04'), new Date('2025-11-08'))
 * // "4 Nov - 8 Nov 2025"
 */
export function formatWeekRange(startDate, endDate) {
    const start = startDate instanceof Date ? startDate : parseISO(startDate);
    const end = endDate instanceof Date ? endDate : parseISO(endDate);

    const startFormatted = format(start, 'd MMM', { locale: es });
    const endFormatted = format(end, 'd MMM yyyy', { locale: es });

    return `${startFormatted} - ${endFormatted}`;
}

/**
 * Verifica si dos slots son el mismo (misma hora de inicio y máquina)
 * 
 * @param {Object} slot1 - Primer slot { startTime, machineId }
 * @param {Object} slot2 - Segundo slot { startTime, machineId }
 * @returns {boolean} - true si son el mismo slot
 * 
 * @example
 * isSameSlot(
 *   { startTime: new Date('2025-11-06T10:00'), machineId: 'piu-1' },
 *   { startTime: new Date('2025-11-06T10:00'), machineId: 'piu-1' }
 * ) // true
 */
export function isSameSlot(slot1, slot2) {
    if (!slot1 || !slot2) return false;

    const start1 = slot1.startTime instanceof Date ? slot1.startTime : parseISO(slot1.startTime);
    const start2 = slot2.startTime instanceof Date ? slot2.startTime : parseISO(slot2.startTime);

    return (
        start1.getTime() === start2.getTime() &&
        slot1.machineId === slot2.machineId
    );
}

/**
 * Verifica si una fecha es hoy
 * 
 * @param {Date|string} date - Fecha a verificar
 * @returns {boolean} - true si es hoy
 * 
 * @example
 * isToday(new Date()) // true
 * isToday(new Date('2025-11-05')) // false (si no es hoy)
 */
export function isToday(date) {
    const dateObj = date instanceof Date ? date : parseISO(date);
    return isTodayFns(dateObj);
}

/**
 * Verifica si dos fechas son el mismo día
 * 
 * @param {Date|string} date1 - Primera fecha
 * @param {Date|string} date2 - Segunda fecha
 * @returns {boolean} - true si son el mismo día
 * 
 * @example
 * isSameDate(new Date('2025-11-06T10:00'), new Date('2025-11-06T14:00')) // true
 */
export function isSameDate(date1, date2) {
    const d1 = date1 instanceof Date ? date1 : parseISO(date1);
    const d2 = date2 instanceof Date ? date2 : parseISO(date2);
    return isSameDay(d1, d2);
}

/**
 * Obtiene el inicio del día (00:00:00)
 * 
 * @param {Date|string} date - Fecha
 * @returns {Date} - Fecha con hora 00:00:00
 * 
 * @example
 * getStartOfDay(new Date('2025-11-06T14:30:00')) // 2025-11-06T00:00:00
 */
export function getStartOfDay(date) {
    const dateObj = date instanceof Date ? date : parseISO(date);
    return startOfDay(dateObj);
}

/**
 * Obtiene el fin del día (23:59:59.999)
 * 
 * @param {Date|string} date - Fecha
 * @returns {Date} - Fecha con hora 23:59:59.999
 * 
 * @example
 * getEndOfDay(new Date('2025-11-06T14:30:00')) // 2025-11-06T23:59:59.999
 */
export function getEndOfDay(date) {
    const dateObj = date instanceof Date ? date : parseISO(date);
    return endOfDay(dateObj);
}

/**
 * Obtiene el día de la semana como número (0 = Domingo, 6 = Sábado)
 * 
 * @param {Date|string} date - Fecha
 * @returns {number} - Día de la semana (0-6)
 * 
 * @example
 * getDayOfWeek(new Date('2025-11-06')) // 4 (Jueves)
 */
export function getDayOfWeek(date) {
    const dateObj = date instanceof Date ? date : parseISO(date);
    return dateObj.getDay();
}

/**
 * Obtiene el nombre del día de la semana
 * 
 * @param {Date|string} date - Fecha
 * @param {string} formatStr - Formato ('short' = 'Lun', 'long' = 'Lunes')
 * @returns {string} - Nombre del día
 * 
 * @example
 * getDayName(new Date('2025-11-06')) // "Jue"
 * getDayName(new Date('2025-11-06'), 'long') // "Jueves"
 */
export function getDayName(date, formatType = 'short') {
    const dateObj = date instanceof Date ? date : parseISO(date);
    const formatStr = formatType === 'long' ? 'EEEE' : 'EEE';
    return format(dateObj, formatStr, { locale: es });
}

/**
 * Parsea un string de tiempo (HH:mm) y lo combina con una fecha
 * 
 * @param {Date|string} date - Fecha base
 * @param {string} timeString - Tiempo en formato "HH:mm" (ej: "10:00")
 * @returns {Date} - Fecha con el tiempo especificado
 * 
 * @example
 * parseTime(new Date('2025-11-06'), '10:00') // 2025-11-06T10:00:00
 */
export function parseTime(date, timeString) {
    const dateObj = date instanceof Date ? date : parseISO(date);
    const [hours, minutes] = timeString.split(':').map(Number);

    const result = new Date(dateObj);
    result.setHours(hours, minutes, 0, 0);

    return result;
}

/**
 * Genera un array de slots de tiempo para un día específico
 * 
 * @param {Date|string} date - Fecha del día
 * @param {string} startTime - Hora de inicio (ej: "10:00")
 * @param {string} endTime - Hora de fin (ej: "22:00")
 * @param {number} slotDuration - Duración en minutos (default: 60)
 * @returns {Array} - Array de objetos { startTime: Date, endTime: Date }
 * 
 * @example
 * generateTimeSlots(new Date('2025-11-06'), '10:00', '12:00', 60)
 * // [
 * //   { startTime: 2025-11-06T10:00, endTime: 2025-11-06T11:00 },
 * //   { startTime: 2025-11-06T11:00, endTime: 2025-11-06T12:00 }
 * // ]
 */
export function generateTimeSlots(date, startTime, endTime, slotDuration = 60) {
    const dateObj = date instanceof Date ? date : parseISO(date);
    const start = parseTime(dateObj, startTime);
    const end = parseTime(dateObj, endTime);

    const slots = [];
    let current = new Date(start);

    while (current < end) {
        const slotEnd = new Date(current.getTime() + slotDuration * 60000);
        slots.push({
            startTime: new Date(current),
            endTime: slotEnd,
        });
        current = slotEnd;
    }

    return slots;
}

/**
 * Calcula la diferencia en horas entre dos fechas
 * 
 * @param {Date|string} startDate - Fecha de inicio
 * @param {Date|string} endDate - Fecha de fin
 * @returns {number} - Diferencia en horas
 * 
 * @example
 * getHoursDifference(
 *   new Date('2025-11-06T10:00'),
 *   new Date('2025-11-06T12:00')
 * ) // 2
 */
export function getHoursDifference(startDate, endDate) {
    const start = startDate instanceof Date ? startDate : parseISO(startDate);
    const end = endDate instanceof Date ? endDate : parseISO(endDate);

    return (end - start) / (1000 * 60 * 60);
}
