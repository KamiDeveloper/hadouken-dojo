/**
 * useMachines - React Query hook para obtener máquinas de una categoría
 * 
 * Cache: 12 horas (staleTime)
 * Prefetch: Al seleccionar categoría
 * Filter: Por categoryId
 * 
 * @hook useMachines
 */

import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { QUERY_KEYS } from '../../../config/queryClient';

/**
 * Obtiene máquinas de una categoría específica
 * 
 * @param {string} categoryId - ID de la categoría
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.enabled - Si debe hacer fetch automático (default: true)
 * @returns {Object} - React Query result con data, isLoading, error
 */
export function useMachines(categoryId, options = {}) {
    const { enabled = true } = options;

    return useQuery({
        queryKey: QUERY_KEYS.MACHINES(categoryId),
        queryFn: async () => {
            if (!categoryId) {
                return [];
            }

            const machinesRef = collection(db, 'machines');
            const q = query(
                machinesRef,
                where('categoryId', '==', categoryId),
                where('active', '==', true),
                orderBy('order', 'asc')
            );

            const snapshot = await getDocs(q);

            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        },
        staleTime: 12 * 60 * 60 * 1000, // 12 horas
        gcTime: 24 * 60 * 60 * 1000, // 24 horas (garbage collection)
        enabled: enabled && !!categoryId,
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

/**
 * Hook para prefetch de máquinas (usar al hacer hover en categoría)
 * 
 * @param {Object} queryClient - React Query client
 * @param {string} categoryId - ID de la categoría
 */
export function usePrefetchMachines(queryClient, categoryId) {
    return () => {
        if (!categoryId) return;

        queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.MACHINES(categoryId),
            queryFn: async () => {
                const machinesRef = collection(db, 'machines');
                const q = query(
                    machinesRef,
                    where('categoryId', '==', categoryId),
                    where('active', '==', true),
                    orderBy('order', 'asc')
                );

                const snapshot = await getDocs(q);

                return snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            },
            staleTime: 12 * 60 * 60 * 1000,
        });
    };
}

/**
 * Hook para obtener todas las máquinas (sin filtro por categoría)
 * Útil para admin panel o vistas globales
 * 
 * @returns {Object} - React Query result
 */
export function useAllMachines() {
    return useQuery({
        queryKey: ['machines', 'all'],
        queryFn: async () => {
            const machinesRef = collection(db, 'machines');
            const q = query(
                machinesRef,
                where('active', '==', true),
                orderBy('categoryId', 'asc'),
                orderBy('order', 'asc')
            );

            const snapshot = await getDocs(q);

            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        },
        staleTime: 12 * 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
    });
}
