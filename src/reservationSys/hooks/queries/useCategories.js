/**
 * useCategories - React Query hook para obtener categorías
 * 
 * Cache: 24 horas (staleTime)
 * Prefetch: En App.jsx mount
 * 
 * @hook useCategories
 */

import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { QUERY_KEYS } from '../../../config/queryClient';

/**
 * Obtiene todas las categorías activas ordenadas
 * 
 * @returns {Object} - React Query result con data, isLoading, error
 */
export function useCategories() {
    return useQuery({
        queryKey: QUERY_KEYS.CATEGORIES,
        queryFn: async () => {
            const categoriesRef = collection(db, 'categories');
            const q = query(
                categoriesRef,
                where('active', '==', true),
                orderBy('order', 'asc')
            );

            const snapshot = await getDocs(q);

            return snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
        },
        staleTime: 24 * 60 * 60 * 1000, // 24 horas
        gcTime: 48 * 60 * 60 * 1000, // 48 horas (garbage collection)
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
}

/**
 * Hook para prefetch de categorías (usar en App.jsx)
 * 
 * @param {Object} queryClient - React Query client
 */
export function usePrefetchCategories(queryClient) {
    return () => {
        queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.CATEGORIES,
            queryFn: async () => {
                const categoriesRef = collection(db, 'categories');
                const q = query(
                    categoriesRef,
                    where('active', '==', true),
                    orderBy('order', 'asc')
                );

                const snapshot = await getDocs(q);

                return snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            },
            staleTime: 24 * 60 * 60 * 1000,
        });
    };
}
