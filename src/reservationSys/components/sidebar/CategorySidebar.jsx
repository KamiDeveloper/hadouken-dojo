import { useState, useEffect, useCallback } from 'react'; // ✅ OPT-005: Agregado useCallback
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query'; // ✅ OPT-005
import { useCategories } from '../../hooks/queries/useCategories';
import { useMachines } from '../../hooks/queries/useMachines'; // ✅ OPT-005: Removido usePrefetchMachines
import { QUERY_KEYS } from '../../../config/queryClient'; // ✅ OPT-005
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'; // ✅ OPT-005
import { db } from '../../../config/firebase'; // ✅ OPT-005
import CategoryTab from './CategoryTab';
import MachineItem from './MachineItem';

/**
 * CategorySidebar - Sidebar persistente con categorías y máquinas
 * 
 * @component
 * @param {Object} props
 * @param {string} props.selectedMachineId - ID de la máquina actualmente seleccionada
 * @param {function} props.onMachineSelect - Callback cuando se selecciona una máquina (machineId, machineData)
 * @param {Object} props.machineSelectionCount - Objeto con counts { [machineId]: count }
 * @param {boolean} props.isMobileOpen - Estado del drawer en mobile
 * @param {function} props.onMobileClose - Callback para cerrar drawer en mobile
 * 
 * @example
 * <CategorySidebar
 *   selectedMachineId="piu-machine-1"
 *   onMachineSelect={(machineId, machineData) => console.log(machineId, machineData)}
 *   machineSelectionCount={{ 'piu-machine-1': 3 }}
 *   isMobileOpen={false}
 *   onMobileClose={() => {}}
 * />
 */
export default function CategorySidebar({
    selectedMachineId,
    onMachineSelect,
    machineSelectionCount = {},
    isMobileOpen = false,
    onMobileClose = () => { },
}) {
    // Estado local para categoría activa
    const [activeCategoryId, setActiveCategoryId] = useState(() => {
        // Recuperar de localStorage si existe
        return localStorage.getItem('hadouken_last_category') || null;
    });

    // ✅ OPT-005: QueryClient para prefetch inline
    const queryClient = useQueryClient();

    // Queries
    const { data: categories = [], isLoading: categoriesLoading } = useCategories();
    const { data: machines = [], isLoading: machinesLoading } = useMachines(activeCategoryId, {
        enabled: !!activeCategoryId, // Solo fetch si hay categoría activa
    });

    // Auto-select primera categoría si no hay ninguna activa
    useEffect(() => {
        if (!activeCategoryId && categories.length > 0) {
            const firstCategory = categories[0];
            setActiveCategoryId(firstCategory.id);
            localStorage.setItem('hadouken_last_category', firstCategory.id);
        }
    }, [categories, activeCategoryId]);

    // Auto-select última máquina desde localStorage si coincide con categoría activa
    useEffect(() => {
        if (machines.length > 0 && !selectedMachineId) {
            const lastMachineId = localStorage.getItem('hadouken_last_machine');
            const machineExists = machines.find((m) => m.id === lastMachineId);
            if (machineExists) {
                // Pasar machineId y datos completos
                onMachineSelect(machineExists.id, {
                    ...machineExists,
                    categoryId: activeCategoryId,
                });
            } else {
                // Seleccionar primera máquina activa por defecto
                const firstActiveMachine = machines.find((m) => m.active);
                if (firstActiveMachine) {
                    onMachineSelect(firstActiveMachine.id, {
                        ...firstActiveMachine,
                        categoryId: activeCategoryId,
                    });
                    localStorage.setItem('hadouken_last_machine', firstActiveMachine.id);
                }
            }
        }
    }, [machines, selectedMachineId, onMachineSelect, activeCategoryId]);

    // Handler para selección de categoría
    const handleCategorySelect = (categoryId) => {
        setActiveCategoryId(categoryId);
        localStorage.setItem('hadouken_last_category', categoryId);
        // Limpiar selección de máquina al cambiar categoría
        onMachineSelect(null, null);
    };

    // ✅ OPT-005: Handler para prefetch en hover con queryClient inline
    const handleCategoryHover = useCallback((categoryId) => {
        if (!categoryId) return;

        // Prefetch inline con queryClient
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
            staleTime: 12 * 60 * 60 * 1000, // 12 horas
        });
    }, [queryClient]);

    // Handler para selección de máquina
    const handleMachineSelect = (machineId) => {
        const machine = machines.find((m) => m.id === machineId);
        if (machine) {
            // Pasar machineId y datos completos incluyendo categoryId
            onMachineSelect(machineId, {
                ...machine,
                categoryId: activeCategoryId,
            });
            localStorage.setItem('hadouken_last_machine', machineId);
        }
    };

    // Sidebar content (reutilizado en desktop y mobile)
    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b res-border-primary">
                <h2 className="text-xl font-bold res-text-primary">Categorías</h2>
                {/* Close button solo visible en mobile */}
                <button
                    onClick={onMobileClose}
                    className="lg:hidden p-2 res-rounded-lg hover:res-bg-tertiary res-transition-fast"
                    aria-label="Cerrar menú"
                >
                    <XMarkIcon className="w-6 h-6 res-text-tertiary" />
                </button>
            </div>

            {/* Categories list */}
            <div className="flex-shrink-0 p-4 space-y-2 border-b res-border-primary">
                {categoriesLoading ? (
                    // Skeleton loaders
                    <>
                        <div className="h-16 res-bg-tertiary res-rounded-lg animate-pulse" />
                        <div className="h-16 res-bg-tertiary res-rounded-lg animate-pulse" />
                    </>
                ) : (
                    categories.map((category) => (
                        <CategoryTab
                            key={category.id}
                            category={category}
                            isActive={activeCategoryId === category.id}
                            onClick={() => handleCategorySelect(category.id)}
                            onHover={() => handleCategoryHover(category.id)}
                        />
                    ))
                )}
            </div>

            {/* Machines list (nested) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {activeCategoryId && (
                    <>
                        <h3 className="text-sm font-semibold res-text-tertiary uppercase tracking-wide mb-3">
                            Máquinas
                        </h3>
                        {machinesLoading ? (
                            // Skeleton loaders
                            <>
                                <div className="h-12 res-bg-tertiary res-rounded-lg animate-pulse ml-4" />
                                <div className="h-12 res-bg-tertiary res-rounded-lg animate-pulse ml-4" />
                                <div className="h-12 res-bg-tertiary res-rounded-lg animate-pulse ml-4" />
                            </>
                        ) : machines.length > 0 ? (
                            machines.map((machine) => (
                                <MachineItem
                                    key={machine.id}
                                    machine={machine}
                                    isSelected={selectedMachineId === machine.id}
                                    selectionCount={machineSelectionCount[machine.id] || 0}
                                    onClick={() => handleMachineSelect(machine.id)}
                                />
                            ))
                        ) : (
                            <p className="res-text-muted text-sm ml-4">
                                No hay máquinas disponibles en esta categoría.
                            </p>
                        )}
                    </>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar - Fixed 280px */}
            <aside
                className="mt-19 hidden lg:block w-[280px] h-[91dvh] res-bg-secondary border-r res-border-primary res-shadow-xl res-rounded-2xl overflow-hidden"
                aria-label="Sidebar de categorías"
            >
                {sidebarContent}
            </aside>

            {/* Mobile drawer - Overlay + slide-in */}
            {isMobileOpen && (
                <>
                    {/* Backdrop overlay */}
                    <div
                        className="lg:hidden fixed inset-0 bg-black/75 backdrop-blur-sm z-40 animate-fade-in"
                        onClick={onMobileClose}
                        aria-hidden="true"
                    />

                    {/* Drawer */}
                    <aside
                        className="lg:hidden fixed inset-y-0 left-0 w-[280px] max-w-[80vw] res-bg-secondary border-r res-border-primary shadow-2xl z-50 animate-slide-in"
                        aria-label="Menú de categorías"
                    >
                        {sidebarContent}
                    </aside>
                </>
            )}
        </>
    );
}
