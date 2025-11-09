import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 * 
 * Configuración optimizada para el sistema de reservas con:
 * - Cache agresivo para datos que cambian poco (categories: 24h, machines: 12h)
 * - Real-time updates para bookings (staleTime: 0)
 * - Retry automático con backoff exponencial
 * - Gestión de errores centralizada
 */
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Configuración por defecto para todas las queries
            staleTime: 5 * 60 * 1000,        // 5 minutos (datos se consideran "frescos")
            gcTime: 10 * 60 * 1000,          // 10 minutos (antes "cacheTime", tiempo en cache después de no usarse)
            retry: 2,                         // Reintentar 2 veces en caso de error
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Backoff exponencial
            refetchOnWindowFocus: false,     // No refetch automático al enfocar ventana
            refetchOnReconnect: true,        // Refetch al reconectar internet
            refetchOnMount: 'always',        // Siempre refetch al montar componente si data está stale

            // Error handling global
            onError: (error) => {
                console.error('Query error:', error);
                // Aquí podrías integrar Sentry u otro servicio de logging
            },
        },
        mutations: {
            // Configuración por defecto para todas las mutations
            retry: 1,                        // Solo 1 reintento para mutations
            retryDelay: 1000,                // 1 segundo entre reintentos

            // Error handling global para mutations
            onError: (error) => {
                console.error('Mutation error:', error);
            },
        },
    },
});

/**
 * Query Keys - Estructura estandarizada
 * 
 * Usar estas constantes para mantener consistencia en las query keys
 * y facilitar invalidaciones
 */
export const QUERY_KEYS = {
    // Categories - Cache largo (24h)
    CATEGORIES: ['categories'],

    // Machines - Cache medio (12h)
    MACHINES: (categoryId) => ['machines', categoryId],
    MACHINES_ALL: ['machines'],

    // Config - Cache medio (1h)
    CONFIG: ['config', 'reservations'],

    // Bookings - Real-time (0 staleTime en el hook)
    BOOKINGS_WEEKLY: (machineId, weekId) => ['bookings', machineId, weekId, 'active'],
    BOOKINGS_USER: (userId) => ['user-bookings', userId],

    // Blocked Slots - Cache corto (5min)
    BLOCKED_SLOTS: (startDate, endDate) => ['blocked_slots', startDate, endDate],
};

/**
 * Prefetch utilities
 * 
 * Funciones helper para prefetching optimizado
 */
export const prefetchCategories = async () => {
    // Esta función se puede llamar en App.jsx al montar
    // El hook useCategories lo implementará
    console.log('Prefetching categories...');
};

export const prefetchMachines = async (categoryId) => {
    // Se puede llamar al hacer hover sobre una categoría
    console.log(`Prefetching machines for category: ${categoryId}`);
};

/**
 * Invalidation utilities
 * 
 * Funciones helper para invalidar queries de forma consistente
 */
export const invalidateBookings = (machineId, weekId) => {
    if (machineId && weekId) {
        queryClient.invalidateQueries({
            queryKey: QUERY_KEYS.BOOKINGS_WEEKLY(machineId, weekId),
        });
    } else {
        // Invalidar todos los bookings si no se especifica
        queryClient.invalidateQueries({
            queryKey: ['bookings'],
        });
    }
};

export const invalidateUserBookings = (userId) => {
    queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.BOOKINGS_USER(userId),
    });
};

export default queryClient;
