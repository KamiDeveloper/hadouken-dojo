import { useEffect, useRef } from 'react';

/**
 * MobileFooterSelector - Footer fixed móvil con tabs deslizables
 * 
 * Diseño de 2 filas:
 * - Fila 1: Categorías (scroll horizontal)
 * - Fila 2: Máquinas (scroll horizontal, filtradas por categoría activa)
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.categories - Array de categorías
 * @param {Array} props.machines - Array de máquinas
 * @param {string} props.activeCategoryId - ID de la categoría activa
 * @param {string} props.selectedMachineId - ID de la máquina seleccionada
 * @param {function} props.onCategorySelect - Callback al seleccionar categoría
 * @param {function} props.onMachineSelect - Callback al seleccionar máquina
 * @param {boolean} props.isLoading - Estado de carga
 * 
 * @example
 * <MobileFooterSelector
 *   categories={categories}
 *   machines={machines}
 *   activeCategoryId="rhythm"
 *   selectedMachineId="piu-1"
 *   onCategorySelect={(id) => {}}
 *   onMachineSelect={(id, data) => {}}
 *   isLoading={false}
 * />
 */
export default function MobileFooterSelector({
    categories = [],
    machines = [],
    activeCategoryId,
    selectedMachineId,
    onCategorySelect,
    onMachineSelect,
    isLoading = false,
}) {
    const categoryScrollRef = useRef(null);
    const machineScrollRef = useRef(null);

    // Auto-scroll al elemento activo cuando cambia
    useEffect(() => {
        if (activeCategoryId && categoryScrollRef.current) {
            const activeElement = categoryScrollRef.current.querySelector(
                `[data-category-id="${activeCategoryId}"]`
            );
            if (activeElement) {
                activeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center',
                });
            }
        }
    }, [activeCategoryId]);

    useEffect(() => {
        if (selectedMachineId && machineScrollRef.current) {
            const activeElement = machineScrollRef.current.querySelector(
                `[data-machine-id="${selectedMachineId}"]`
            );
            if (activeElement) {
                activeElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center',
                });
            }
        }
    }, [selectedMachineId]);

    const handleCategoryClick = (categoryId) => {
        onCategorySelect(categoryId);
    };

    const handleMachineClick = (machine) => {
        onMachineSelect(machine.id, {
            ...machine,
            categoryId: activeCategoryId,
        });
    };

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-gray-800 border-t border-gray-700 shadow-2xl">
            {/* Fila 1: Categorías */}
            <div className="border-b border-gray-700">
                <div className="px-3 py-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Categoría
                    </p>
                    <div
                        ref={categoryScrollRef}
                        className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
                        style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                        }}
                    >
                        {isLoading ? (
                            // Skeleton loaders
                            <>
                                <div className="flex-shrink-0 w-24 h-9 bg-gray-700 rounded-full animate-pulse" />
                                <div className="flex-shrink-0 w-24 h-9 bg-gray-700 rounded-full animate-pulse" />
                                <div className="flex-shrink-0 w-24 h-9 bg-gray-700 rounded-full animate-pulse" />
                            </>
                        ) : (
                            categories.map((category) => {
                                const isActive = activeCategoryId === category.id;
                                return (
                                    <button
                                        key={category.id}
                                        data-category-id={category.id}
                                        onClick={() => handleCategoryClick(category.id)}
                                        className={`
                                            flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium
                                            transition-all duration-200 ease-out
                                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800
                                            ${isActive
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }
                                        `}
                                        aria-pressed={isActive}
                                    >
                                        {category.name}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Fila 2: Máquinas */}
            <div className="px-3 py-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Máquina
                </p>
                <div
                    ref={machineScrollRef}
                    className="flex gap-2 overflow-x-auto scrollbar-hide pb-1"
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    {isLoading ? (
                        // Skeleton loaders
                        <>
                            <div className="flex-shrink-0 w-32 h-9 bg-gray-700 rounded-full animate-pulse" />
                            <div className="flex-shrink-0 w-32 h-9 bg-gray-700 rounded-full animate-pulse" />
                            <div className="flex-shrink-0 w-32 h-9 bg-gray-700 rounded-full animate-pulse" />
                        </>
                    ) : machines.length > 0 ? (
                        machines.map((machine) => {
                            const isSelected = selectedMachineId === machine.id;
                            const isActive = machine.active !== false;

                            return (
                                <button
                                    key={machine.id}
                                    data-machine-id={machine.id}
                                    onClick={() => handleMachineClick(machine)}
                                    disabled={!isActive}
                                    className={`
                                        flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                                        transition-all duration-200 ease-out
                                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
                                        ${isSelected
                                            ? 'text-white shadow-lg'
                                            : isActive
                                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                                        }
                                    `}
                                    style={
                                        isSelected
                                            ? {
                                                backgroundColor: machine.color,
                                                boxShadow: `0 4px 14px 0 ${machine.color}30`,
                                            }
                                            : {}
                                    }
                                    aria-pressed={isSelected}
                                    aria-disabled={!isActive}
                                >
                                    {/* Color dot */}
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{
                                            backgroundColor: isSelected ? 'white' : machine.color,
                                        }}
                                    />
                                    <span className="whitespace-nowrap">{machine.name}</span>
                                </button>
                            );
                        })
                    ) : (
                        <p className="text-sm text-gray-500 py-2">
                            No hay máquinas disponibles
                        </p>
                    )}
                </div>
            </div>

            {/* Hide scrollbar CSS inline */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}
