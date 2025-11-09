import { useState, useEffect, useMemo, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { startOfWeek, startOfToday, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';
import { useConfig } from '../reservationSys/hooks/queries/useConfig';
import { useCreateBooking } from '../reservationSys/hooks/mutations/useCreateBooking';
import { useCancelBooking } from '../reservationSys/hooks/mutations/useCancelBooking';
import { useCategories } from '../reservationSys/hooks/queries/useCategories';
import { useMachines } from '../reservationSys/hooks/queries/useMachines';
import { useWeeklyBookings } from '../reservationSys/hooks/queries/useWeeklyBookings';
import ErrorBoundary from '../reservationSys/components/ErrorBoundary';
import CategorySidebar from '../reservationSys/components/sidebar/CategorySidebar';
import MobileFooterSelector from '../reservationSys/components/mobile/MobileFooterSelector';
import CalendarView from '../reservationSys/components/calendar/CalendarView';
import BookingBar from '../reservationSys/components/BookingBar';
import BookingSummaryModal from '../reservationSys/components/modals/BookingSummaryModal';
import CancelBookingModal from '../reservationSys/components/modals/CancelBookingModal';

/**
 * Reservations - Página principal del sistema de reservas
 * 
 * Integra todos los componentes del sistema Calendar-First:
 * - CategorySidebar: Selección de categoría y máquina
 * - CalendarView: Calendario con slots disponibles
 * - BookingBar: Barra flotante con resumen
 * - BookingSummaryModal: Modal de confirmación
 * 
 * @component
 */
export default function Reservations() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { data: config } = useConfig();

    // Estado local
    const [selectedMachineId, setSelectedMachineId] = useState(null);
    const [selectedMachineData, setSelectedMachineData] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [calendarClearFn, setCalendarClearFn] = useState(null);

    // ✅ NUEVO: Estado para categoría activa (para mobile footer)
    const [activeCategoryId, setActiveCategoryId] = useState(() => {
        return localStorage.getItem('hadouken_last_category') || null;
    });

    // ✅ NUEVO: Estado para modal de cancelación
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);

    // ✅ Queries para mobile footer
    const { data: categories = [], isLoading: categoriesLoading } = useCategories();
    const { data: machines = [], isLoading: machinesLoading } = useMachines(activeCategoryId, {
        enabled: !!activeCategoryId,
    });

    // ✅ FIX BUG #9: Estado dinámico para currentWeek (actualizado por CalendarView)
    // Inicialmente es la semana actual, pero se actualiza cuando usuario navega
    const [currentWeek, setCurrentWeek] = useState(() => {
        return startOfWeek(startOfToday(), { weekStartsOn: 1 }); // 1 = Lunes
    });

    // ✅ CRÍTICO FIX BUG #2 y #3: Obtener bookings reales de la semana actual
    const { data: existingBookings = [], isLoading: bookingsLoading } = useWeeklyBookings(
        selectedMachineId,
        currentWeek,
        {
            enabled: !!selectedMachineId,
            realtime: true,
            showToasts: true, // ✅ Ahora SÍ mostrar toasts (solo hay 1 listener)
        }
    );

    // Calcular selectionCount por máquina para badges
    const machineSelectionCount = useMemo(() => {
        const counts = {};
        selectedSlots.forEach((slot) => {
            counts[slot.machineId] = (counts[slot.machineId] || 0) + 1;
        });
        return counts;
    }, [selectedSlots]);

    // ✅ Auto-select primera categoría si no hay ninguna activa
    useEffect(() => {
        if (!activeCategoryId && categories.length > 0) {
            const firstCategory = categories[0];
            setActiveCategoryId(firstCategory.id);
            localStorage.setItem('hadouken_last_category', firstCategory.id);
        }
    }, [categories, activeCategoryId]);

    // ✅ Auto-select última máquina desde localStorage si coincide con categoría activa
    useEffect(() => {
        if (machines.length > 0 && !selectedMachineId) {
            const lastMachineId = localStorage.getItem('hadouken_last_machine');
            const machineExists = machines.find((m) => m.id === lastMachineId);
            if (machineExists) {
                handleMachineSelect(machineExists.id, {
                    ...machineExists,
                    categoryId: activeCategoryId,
                });
            } else {
                // Seleccionar primera máquina activa por defecto
                const firstActiveMachine = machines.find((m) => m.active);
                if (firstActiveMachine) {
                    handleMachineSelect(firstActiveMachine.id, {
                        ...firstActiveMachine,
                        categoryId: activeCategoryId,
                    });
                    localStorage.setItem('hadouken_last_machine', firstActiveMachine.id);
                }
            }
        }
    }, [machines, selectedMachineId, activeCategoryId]);

    // ✅ OPT-002: Formatter memoizado para warnings (5-10x más rápido que toLocaleDateString)
    const formatDateForWarnings = useMemo(() => {
        return (date) => format(date, 'EEE d MMM', { locale: es });
    }, []);

    // Calcular warnings basados en config
    const warnings = useMemo(() => {
        if (!config || selectedSlots.length === 0) return [];

        const warningsArray = [];
        const slotsByDate = new Map();

        // Agrupar slots por fecha
        selectedSlots.forEach((slot) => {
            const dateStr = formatDateForWarnings(slot.startTime); // ✅ OPT-002: Usar formatter memoizado
            if (!slotsByDate.has(dateStr)) {
                slotsByDate.set(dateStr, []);
            }
            slotsByDate.get(dateStr).push(slot);
        });

        // Check límite diario
        slotsByDate.forEach((slots, dateStr) => {
            if (config.maxSlotsPerDay && slots.length >= config.maxSlotsPerDay) {
                warningsArray.push({
                    type: 'limit',
                    message: `${slots.length}/${config.maxSlotsPerDay} slots en ${dateStr}`,
                    date: slots[0].startTime,
                });
            }
        });

        // Check límite semanal
        if (config.maxSlotsPerWeek && selectedSlots.length >= config.maxSlotsPerWeek) {
            warningsArray.push({
                type: 'limit',
                message: `${selectedSlots.length}/${config.maxSlotsPerWeek} slots esta semana`,
            });
        }

        return warningsArray;
    }, [selectedSlots, config, formatDateForWarnings]); // ✅ OPT-002: Agregada dependencia

    // Mutation para crear booking
    const createBookingMutation = useCreateBooking({
        config,
        existingBookings, // ✅ CRÍTICO FIX BUG #3: Pasar bookings reales para validación
        onSuccess: () => {
            // ✅ FIX: Limpiar selección en AMBOS lugares
            setIsModalOpen(false);
            setSelectedSlots([]);

            // ✅ CRÍTICO: Limpiar también en CalendarView (useCalendarLogic)
            if (calendarClearFn) {
                calendarClearFn();
            }
        },
        onError: (error) => {
            console.error('Error al crear reserva:', error);
            // Modal se mantiene abierto para mostrar error y retry
        },
    });

    // ✅ NUEVO: Mutation para cancelar booking
    const cancelBookingMutation = useCancelBooking({
        onSuccess: () => {
            setIsCancelModalOpen(false);
            setBookingToCancel(null);
        },
        onError: (error) => {
            console.error('Error al cancelar reserva:', error);
            // Modal se mantiene abierto para mostrar error
        },
    });

    // Handlers
    // ✅ OPT-004: Memoizado para prevenir re-renders
    const handleMachineSelect = useCallback((machineId, machineData) => {
        setSelectedMachineId(machineId);
        setSelectedMachineData(machineData || null);
        if (machineId) {
            localStorage.setItem('hadouken_last_machine', machineId);
        }
        // Limpiar selección al cambiar de máquina
        setSelectedSlots([]);
    }, []);

    // ✅ NUEVO: Handler para selección de categoría (mobile footer)
    const handleCategorySelect = useCallback((categoryId) => {
        setActiveCategoryId(categoryId);
        localStorage.setItem('hadouken_last_category', categoryId);
        // Limpiar selección de máquina al cambiar categoría
        setSelectedMachineId(null);
        setSelectedMachineData(null);
        setSelectedSlots([]);
    }, []);

    // ✅ OPT-004: Memoizado para prevenir re-renders
    const handleSlotsChange = useCallback((slots) => {
        setSelectedSlots(slots);
    }, []);

    // ✅ OPT-004: Memoizado para prevenir re-renders
    const handleClearSelection = useCallback(() => {
        setSelectedSlots([]);
        // ✅ FIX: También limpiar selección visual en CalendarView
        if (calendarClearFn) {
            calendarClearFn();
        }
    }, [calendarClearFn]); // Dependencia necesaria

    // ✅ OPT-004: Memoizado para prevenir re-renders (usar setState callback para evitar dependencia)
    const handleOpenModal = useCallback(() => {
        setSelectedSlots((current) => {
            if (current.length > 0) {
                setIsModalOpen(true);
            }
            return current;
        });
    }, []);

    // ✅ OPT-004: Memoizado para prevenir re-renders
    const handleCloseModal = useCallback(() => {
        if (!createBookingMutation.isPending) {
            setIsModalOpen(false);
            // Reset error state
            createBookingMutation.reset();
        }
    }, [createBookingMutation]); // Dependencia necesaria

    const handleConfirmBooking = async () => {
        if (!selectedMachineId || selectedSlots.length === 0) return;

        try {
            await createBookingMutation.mutateAsync({
                userId: user.uid,
                machineId: selectedMachineId,
                categoryId: selectedMachineData?.categoryId || '',
                slots: selectedSlots,
            });
        } catch (error) {
            // Error manejado por mutation
            console.error('Booking error:', error);
        }
    };

    // ✅ NUEVO: Handlers para cancelación
    // ✅ OPT-004: Memoizado para prevenir re-renders
    const handleCancelBookingClick = useCallback((booking) => {
        setBookingToCancel(booking);
        setIsCancelModalOpen(true);
    }, []);

    // ✅ OPT-004: Memoizado para prevenir re-renders
    const handleCloseCancelModal = useCallback(() => {
        if (!cancelBookingMutation.isPending) {
            setIsCancelModalOpen(false);
            setBookingToCancel(null);
            cancelBookingMutation.reset();
        }
    }, [cancelBookingMutation]); // Dependencia necesaria

    const handleConfirmCancel = async () => {
        if (!bookingToCancel) return;

        try {
            await cancelBookingMutation.mutateAsync({
                bookingId: bookingToCancel.id,
                booking: bookingToCancel,
                userId: user.uid,
                config: config || {},
            });
        } catch (error) {
            // Error manejado por mutation
            console.error('Cancel booking error:', error);
        }
    };

    // ✅ FIX BUG #9: Handler para cuando CalendarView cambia de semana
    // ✅ OPT-004: Memoizado para prevenir re-renders
    const handleWeekChange = useCallback((newWeek) => {
        setCurrentWeek(newWeek);
    }, []);

    const handleRetryBooking = () => {
        createBookingMutation.reset();
        handleConfirmBooking();
    };

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-900 flex flex-col">
                {/* Main layout */}
                <div className="flex-1 flex w-[100dvw]">
                    {/* Sidebar (desktop visible, mobile hidden - drawer renderizado en portal) */}
                    <CategorySidebar
                        selectedMachineId={selectedMachineId}
                        onMachineSelect={handleMachineSelect}
                        machineSelectionCount={machineSelectionCount}
                        isMobileOpen={false}
                        onMobileClose={() => { }}
                    />

                    {/* Main content area */}
                    <main className="flex-1 flex flex-col overflow-hidden p-4 lg:p-6 lg:pb-6 pb-32">
                        <CalendarView
                            machineId={selectedMachineId}
                            machineName={selectedMachineData?.name || 'Selecciona una máquina'}
                            machineColor={selectedMachineData?.color || '#3B82F6'}
                            config={config}
                            existingBookings={existingBookings}
                            bookingsLoading={bookingsLoading}
                            onSlotsSelected={handleSlotsChange}
                            onClearSelection={(clearFn) => setCalendarClearFn(() => clearFn)}
                            onCancelBookingClick={handleCancelBookingClick}
                            onWeekChange={handleWeekChange}
                        />
                    </main>
                </div>

                {/* ✅ NUEVO: Mobile Footer Selector (solo visible en móvil) */}
                <MobileFooterSelector
                    categories={categories}
                    machines={machines}
                    activeCategoryId={activeCategoryId}
                    selectedMachineId={selectedMachineId}
                    onCategorySelect={handleCategorySelect}
                    onMachineSelect={handleMachineSelect}
                    isLoading={categoriesLoading || machinesLoading}
                />

                {/* Booking Bar - Fixed bottom (solo desktop, móvil usa espacio del footer) */}
                <BookingBar
                    selectedSlots={selectedSlots}
                    warnings={warnings}
                    onConfirm={handleOpenModal}
                    onClear={handleClearSelection}
                    isVisible={selectedSlots.length > 0}
                    isConfirming={createBookingMutation.isPending}
                    config={config}
                />

                {/* Booking Summary Modal */}
                <BookingSummaryModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmBooking}
                    selectedSlots={selectedSlots}
                    machineName={selectedMachineData?.name || 'Máquina'}
                    machineColor={selectedMachineData?.color || '#3B82F6'}
                    warnings={warnings}
                    isConfirming={createBookingMutation.isPending}
                    error={createBookingMutation.error?.message || null}
                    onRetry={handleRetryBooking}
                />

                {/* ✅ NUEVO: Cancel Booking Modal */}
                <CancelBookingModal
                    isOpen={isCancelModalOpen}
                    onClose={handleCloseCancelModal}
                    onConfirm={handleConfirmCancel}
                    booking={bookingToCancel}
                    machineName={selectedMachineData?.name || 'Máquina'}
                    machineColor={selectedMachineData?.color || '#3B82F6'}
                    isCancelling={cancelBookingMutation.isPending}
                    error={cancelBookingMutation.error?.message || null}
                />

                {/* Toast notifications container */}
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        // Dark mode styling
                        style: {
                            background: '#1F2937', // Gray 800
                            color: '#F9FAFB', // Gray 50
                            border: '1px solid #374151', // Gray 700
                            borderRadius: '12px',
                            padding: '16px',
                            fontSize: '14px',
                            maxWidth: '400px',
                        },
                        // Success toast
                        success: {
                            duration: 4000,
                            iconTheme: {
                                primary: '#10B981', // Emerald 500
                                secondary: '#F9FAFB',
                            },
                        },
                        // Error toast
                        error: {
                            duration: 5000,
                            iconTheme: {
                                primary: '#EF4444', // Red 500
                                secondary: '#F9FAFB',
                            },
                        },
                        // Loading toast
                        loading: {
                            iconTheme: {
                                primary: '#3B82F6', // Blue 500
                                secondary: '#F9FAFB',
                            },
                        },
                    }}
                />
            </div>
        </ErrorBoundary>
    );
}
