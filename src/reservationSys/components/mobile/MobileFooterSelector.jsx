import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * MobileFooterSelector - Footer flotante expandible con tabs deslizables
 * 
 * Estados:
 * - Colapsado: Botón flotante pequeño con SVG
 * - Expandido: Panel 25vh con categorías + máquinas (scroll horizontal)
 * 
 * Diseño expandido:
 * - Fila 1: Header con título + botón cerrar (X)
 * - Fila 2: Categorías (scroll horizontal)
 * - Fila 3: Máquinas (scroll horizontal, filtradas por categoría activa)
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
    const [isExpanded, setIsExpanded] = useState(false);
    const categoryScrollRef = useRef(null);
    const machineScrollRef = useRef(null);

    // ✅ ANIMACIONES: Variants para Framer Motion
    const containerVariants = {
        collapsed: {
            width: '64px', // w-16
            height: '64px', // h-16
            borderRadius: '9999px', // res-rounded-full
            transition: {
                type: 'spring',
                stiffness: 400,
                damping: 30,
                mass: 0.8,
            },
        },
        expanded: {
            width: '80vw',
            height: '25vh',
            borderRadius: '16px', // res-rounded-2xl
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 28,
                mass: 0.8,
            },
        },
    };

    const contentVariants = {
        collapsed: {
            opacity: 0,
            filter: 'blur(8px)',
            scale: 0.9,
            transition: {
                duration: 0.2,
                ease: 'easeIn',
            },
        },
        expanded: {
            opacity: 1,
            filter: 'blur(0px)',
            scale: 1,
            transition: {
                duration: 0.4,
                delay: 0.15,
                ease: [0.34, 1.56, 0.64, 1], // easeOutBack
            },
        },
    };

    const buttonVariants = {
        collapsed: {
            scale: 1,
            rotate: 0,
        },
        expanded: {
            scale: 0,
            rotate: 90,
            transition: {
                duration: 0.2,
            },
        },
    };

    // Auto-scroll al elemento activo cuando cambia (solo si expandido)
    useEffect(() => {
        if (isExpanded && activeCategoryId && categoryScrollRef.current) {
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
    }, [activeCategoryId, isExpanded]);

    useEffect(() => {
        if (isExpanded && selectedMachineId && machineScrollRef.current) {
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
    }, [selectedMachineId, isExpanded]);

    const handleCategoryClick = (categoryId) => {
        onCategorySelect(categoryId);
    };

    const handleMachineClick = (machine) => {
        onMachineSelect(machine.id, {
            ...machine,
            categoryId: activeCategoryId,
        });
    };

    const toggleExpanded = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <>
            {/* ✅ BOTÓN FLOTANTE (Colapsado) */}
            <motion.div
                className="lg:hidden fixed z-30"
                initial="collapsed"
                animate={isExpanded ? 'expanded' : 'collapsed'}
                variants={containerVariants}
                style={{
                    bottom: '1.5rem',
                    left: '50%',
                    x: '-50%', // Centrar horizontalmente siempre
                    originX: 0.5,
                    originY: 1,
                }}
            >
                {/* Estado Colapsado: Botón Circular */}
                <AnimatePresence>
                    {!isExpanded && (
                        <motion.button
                            variants={buttonVariants}
                            initial="collapsed"
                            animate="collapsed"
                            exit="expanded"
                            onClick={toggleExpanded}
                            className="
                                w-16 h-16 res-bg-secondary backdrop-blur-xl text-white res-rounded-full 
                                res-shadow-2xl shadow-blue-500/50
                                flex items-center justify-center
                                focus:outline-none focus:ring-4 focus:ring-blue-500/50
                                hover:scale-110 active:scale-95
                                res-transition-base
                            "
                            aria-label="Abrir selector de máquinas"
                            aria-expanded={isExpanded}
                        >
                            <span className="text-2xl font-bold">
                                <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path d="M17.5 17.5c2.5 3.5 6.449.915 5.5-2.5c-1.425-5.129-2.2-7.984-2.603-9.492A2.03 2.03 0 0 0 18.438 4H5.562c-.918 0-1.718.625-1.941 1.515C2.78 8.863 2.033 11.802 1.144 15c-.948 3.415 3 6 5.5 2.5" /><path d="M16 4v2a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2V4m0 12a2 2 0 1 0 0-4a2 2 0 0 0 0 4m8 0a2 2 0 1 0 0-4a2 2 0 0 0 0 4" /></g></svg>
                            </span>
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Estado Expandido: Panel Completo */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            variants={contentVariants}
                            initial="collapsed"
                            animate="expanded"
                            exit="collapsed"
                            className="
                                w-full h-full
                                res-bg-secondary backdrop-blur-md 
                                border res-border-primary 
                                res-shadow-2xl
                                overflow-hidden
                            "
                            style={{
                                borderRadius: '16px',
                            }}
                        >
                            {/* Header con botón cerrar */}
                            <div className="flex items-center justify-between px-4 py-3 border-b res-border-primary">
                                <h3 className="text-sm font-bold res-text-primary uppercase tracking-wide">
                                    Seleccionar Máquina
                                </h3>
                                <motion.button
                                    onClick={toggleExpanded}
                                    className="
                                        w-8 h-8 res-rounded-full res-bg-tertiary
                                        flex items-center justify-center
                                        hover:res-bg-tertiary/70 active:scale-90
                                        focus:outline-none focus:ring-2 focus:ring-blue-500
                                        res-transition-base
                                    "
                                    whileHover={{ rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    aria-label="Cerrar selector"
                                >
                                    <svg
                                        className="w-4 h-4 res-text-primary"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </motion.button>
                            </div>

                            {/* Contenido Scrollable */}
                            <div className="h-[calc(25vh-3.5rem)] overflow-y-auto">
                                {/* Fila 1: Categorías */}
                                <div className="border-b res-border-primary">
                                    <div className="px-3 py-2">
                                        <p className="text-xs font-semibold res-text-tertiary uppercase tracking-wide mb-2">
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
                                                    <div className="flex-shrink-0 w-24 h-9 res-bg-tertiary res-rounded-full animate-pulse" />
                                                    <div className="flex-shrink-0 w-24 h-9 res-bg-tertiary res-rounded-full animate-pulse" />
                                                    <div className="flex-shrink-0 w-24 h-9 res-bg-tertiary res-rounded-full animate-pulse" />
                                                </>
                                            ) : (
                                                categories.map((category) => {
                                                    const isActive = activeCategoryId === category.id;
                                                    return (
                                                        <motion.button
                                                            key={category.id}
                                                            data-category-id={category.id}
                                                            onClick={() => handleCategoryClick(category.id)}
                                                            className={`
                                                                flex-shrink-0 px-4 py-2 res-rounded-full text-sm font-medium
                                                                res-transition-base
                                                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800
                                                                ${isActive
                                                                    ? 'res-bg-accent-blue text-white res-shadow-lg shadow-blue-500/30'
                                                                    : 'res-bg-tertiary res-text-secondary hover:res-bg-tertiary/70'
                                                                }
                                                            `}
                                                            whileTap={{ scale: 0.95 }}
                                                            aria-pressed={isActive}
                                                        >
                                                            {category.name}
                                                        </motion.button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Fila 2: Máquinas */}
                                <div className="px-3 py-2">
                                    <p className="text-xs font-semibold res-text-tertiary uppercase tracking-wide mb-2">
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
                                                <div className="flex-shrink-0 w-32 h-9 res-bg-tertiary res-rounded-full animate-pulse" />
                                                <div className="flex-shrink-0 w-32 h-9 res-bg-tertiary res-rounded-full animate-pulse" />
                                                <div className="flex-shrink-0 w-32 h-9 res-bg-tertiary res-rounded-full animate-pulse" />
                                            </>
                                        ) : machines.length > 0 ? (
                                            machines.map((machine) => {
                                                const isSelected = selectedMachineId === machine.id;
                                                const isActive = machine.active !== false;

                                                return (
                                                    <motion.button
                                                        key={machine.id}
                                                        data-machine-id={machine.id}
                                                        onClick={() => handleMachineClick(machine)}
                                                        disabled={!isActive}
                                                        className={`
                                                            flex-shrink-0 flex items-center gap-2 px-4 py-2 res-rounded-full text-sm font-medium
                                                            res-transition-base
                                                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
                                                            ${isSelected
                                                                ? 'text-white res-shadow-lg'
                                                                : isActive
                                                                    ? 'res-bg-tertiary res-text-secondary hover:res-bg-tertiary/70'
                                                                    : 'res-bg-tertiary/50 res-text-muted cursor-not-allowed'
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
                                                        whileTap={isActive ? { scale: 0.95 } : {}}
                                                        aria-pressed={isSelected}
                                                        aria-disabled={!isActive}
                                                    >
                                                        {/* Color dot */}
                                                        <div
                                                            className="w-2 h-2 res-rounded-full"
                                                            style={{
                                                                backgroundColor: isSelected ? 'white' : machine.color,
                                                            }}
                                                        />
                                                        <span className="whitespace-nowrap">{machine.name}</span>
                                                    </motion.button>
                                                );
                                            })
                                        ) : (
                                            <p className="text-sm res-text-muted py-2">
                                                No hay máquinas disponibles
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
}
