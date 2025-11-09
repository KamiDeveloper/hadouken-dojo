/**
 * useConfig - React Query hook para obtener configuración de reservas
 * 
 * Cache: 1 hora (staleTime)
 * Fallback: localStorage para offline support
 * 
 * Contiene:
 * - slotDuration
 * - openingTime, closingTime
 * - daysOfWeek
 * - maxSlotsPerDay, maxSlotsPerWeek
 * - maxWeeksInAdvance
 * - minHoursToCancel
 * - allowBackToBackBooking
 * - Sistema de strikes y bans
 * 
 * @hook useConfig
 */

import { useQuery } from '@tanstack/react-query';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { QUERY_KEYS } from '../../../config/queryClient';

const CONFIG_STORAGE_KEY = 'hadouken_reservations_config';

/**
 * Configuración por defecto (fallback si falla Firestore y localStorage)
 */
const DEFAULT_CONFIG = {
    slotDuration: 60,
    openingTime: '10:00',
    closingTime: '22:00',
    daysOfWeek: [1, 2, 3, 4, 5], // Lun-Vie
    maxSlotsPerDay: 2,
    maxSlotsPerWeek: 5,
    maxWeeksInAdvance: 4,
    minHoursToCancel: 2,
    allowBackToBackBooking: true, // ✅ Permitir reservas consecutivas (mayoría de usuarios juega 2 horas)
    strikesForBan: 3,
    banDurationDays: 7,
    strikeExpirationDays: 30,
    sendReminderEmail: true,
    reminderHoursBefore: 24,
};

/**
 * Guarda la config en localStorage
 * 
 * @param {Object} config - Configuración a guardar
 */
function saveConfigToStorage(config) {
    try {
        localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (error) {
        console.warn('Failed to save config to localStorage:', error);
    }
}

/**
 * Obtiene la config desde localStorage
 * 
 * @returns {Object|null} - Config guardada o null
 */
function getConfigFromStorage() {
    try {
        const stored = localStorage.getItem(CONFIG_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.warn('Failed to load config from localStorage:', error);
        return null;
    }
}

/**
 * Obtiene la configuración de reservas
 * 
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.enabled - Si debe hacer fetch automático (default: true)
 * @returns {Object} - React Query result con data, isLoading, error
 */
export function useConfig(options = {}) {
    const { enabled = true } = options;

    return useQuery({
        queryKey: QUERY_KEYS.CONFIG,
        queryFn: async () => {
            try {
                const configRef = doc(db, 'config', 'reservations');
                const configSnap = await getDoc(configRef);

                if (configSnap.exists()) {
                    const config = configSnap.data();

                    // Guardar en localStorage para fallback
                    saveConfigToStorage(config);

                    return config;
                } else {
                    console.warn('Config document does not exist, using default');
                    return DEFAULT_CONFIG;
                }
            } catch (error) {
                console.error('Error fetching config from Firestore:', error);

                // Intentar obtener desde localStorage
                const cachedConfig = getConfigFromStorage();
                if (cachedConfig) {
                    console.log('Using cached config from localStorage');
                    return cachedConfig;
                }

                // Fallback a config por defecto
                console.log('Using default config');
                return DEFAULT_CONFIG;
            }
        },
        staleTime: 24 * 60 * 60 * 1000, // ✅ OPT-006: 24 horas (config raramente cambia, solo admin modifica)
        gcTime: 24 * 60 * 60 * 1000, // 24 horas
        enabled,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        // Usar placeholderData para mostrar algo mientras carga
        placeholderData: () => {
            return getConfigFromStorage() || DEFAULT_CONFIG;
        },
    });
}

/**
 * Hook para obtener solo los horarios de operación
 * 
 * @returns {Object} - { openingTime, closingTime, daysOfWeek }
 */
export function useOperatingHours() {
    const { data: config, isLoading } = useConfig();

    return {
        openingTime: config?.openingTime || DEFAULT_CONFIG.openingTime,
        closingTime: config?.closingTime || DEFAULT_CONFIG.closingTime,
        daysOfWeek: config?.daysOfWeek || DEFAULT_CONFIG.daysOfWeek,
        isLoading,
    };
}

/**
 * Hook para obtener solo los límites de reserva
 * 
 * @returns {Object} - { maxSlotsPerDay, maxSlotsPerWeek, maxWeeksInAdvance, minHoursToCancel }
 */
export function useBookingLimits() {
    const { data: config, isLoading } = useConfig();

    return {
        maxSlotsPerDay: config?.maxSlotsPerDay || DEFAULT_CONFIG.maxSlotsPerDay,
        maxSlotsPerWeek: config?.maxSlotsPerWeek || DEFAULT_CONFIG.maxSlotsPerWeek,
        maxWeeksInAdvance: config?.maxWeeksInAdvance || DEFAULT_CONFIG.maxWeeksInAdvance,
        minHoursToCancel: config?.minHoursToCancel || DEFAULT_CONFIG.minHoursToCancel,
        allowBackToBackBooking: config?.allowBackToBackBooking ?? DEFAULT_CONFIG.allowBackToBackBooking,
        isLoading,
    };
}

/**
 * Hook para obtener las reglas del sistema de strikes
 * 
 * @returns {Object} - { strikesForBan, banDurationDays, strikeExpirationDays }
 */
export function useStrikeRules() {
    const { data: config, isLoading } = useConfig();

    return {
        strikesForBan: config?.strikesForBan || DEFAULT_CONFIG.strikesForBan,
        banDurationDays: config?.banDurationDays || DEFAULT_CONFIG.banDurationDays,
        strikeExpirationDays: config?.strikeExpirationDays || DEFAULT_CONFIG.strikeExpirationDays,
        isLoading,
    };
}
