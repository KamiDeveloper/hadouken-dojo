import { useMemo, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
// ✅ OPT-001: useConfig removido, ahora se recibe como prop
import { useCalendarLogic } from '../../hooks/useCalendarLogic';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';

/**
 * CalendarView - Vista principal del calendario de reservas
 * 
 * @component
 * @param {Object} props
 * @param {string} props.machineId - ID de la máquina seleccionada
 * @param {string} props.machineName - Nombre de la máquina para mostrar en header
 * @param {string} props.machineColor - Color de la máquina para visualización
 * @param {function} props.onSlotsSelected - Callback cuando cambian los slots seleccionados
 * @param {function} props.onClearSelection - Callback para exponer clearSelection al padre
 * @param {function} props.onCancelBookingClick - Callback cuando se hace click en reserva propia
 * @param {function} props.onWeekChange - Callback cuando cambia la semana actual
 * @param {Object} props.config - Configuración de reservas (viene del padre)
 * @param {Array} props.existingBookings - Bookings existentes (viene del padre)
 * @param {boolean} props.bookingsLoading - Si los bookings están cargando
 * @param {boolean} props.isAdmin - Si el usuario es admin (FEATURE 3)
 * 
 * @example
 * <CalendarView
 *   machineId="piu-machine-1"
 *   machineName="PIU Phoenix LX"
 *   machineColor="#EF4444"
 *   config={config}
 *   existingBookings={bookings}
 *   bookingsLoading={false}
 *   onSlotsSelected={(slots) => console.log(slots)}
 *   onCancelBookingClick={(booking) => {}}
 *   onWeekChange={(week) => console.log(week)}
 *   isAdmin={false}
 * />
 */
export default function CalendarView({
    machineId,
    machineName,
    machineColor,
    onSlotsSelected,
    onClearSelection, // ✅ NUEVO: Callback para limpiar desde el padre
    onCancelBookingClick, // ✅ NUEVO: Callback para cancelar reserva
    onWeekChange, // ✅ FIX: Callback cuando cambia la semana
    config, // ✅ OPT-001: Config recibido como prop (elimina useConfig duplicado)
    existingBookings = [], // ✅ NUEVO: Recibir bookings como prop
    bookingsLoading = false, // ✅ NUEVO: Estado de carga
    isAdmin = false, // ✅ FEATURE 3: Si el usuario es admin
}) {
    const { user } = useAuth();
    // ✅ OPT-001: useConfig() removido, ahora se recibe como prop

    // Hook de lógica del calendario (sin callbacks para evitar estado desincronizado)
    const calendarLogic = useCalendarLogic({
        rules: config, // ✅ FIX FEATURE 3: Pasar config como rules
        isAdmin, // ✅ FEATURE 3: Pasar isAdmin para validación de navegación
    });

    const {
        selectedSlots,
        currentWeek,
        weekDates,
        toggleSlotSelection,
        clearSelection,
        navigateWeek,
        goToToday,
        isSlotSelected,
        canNavigateNext: canNavigateNextFn,
        canNavigatePrev: canNavigatePrevFn,
    } = calendarLogic;

    // ✅ FEATURE 3: Invocar las funciones para obtener valores booleanos
    const canNavigateNext = canNavigateNextFn();
    const canNavigatePrev = canNavigatePrevFn();

    // Sincronizar selectedSlots con el componente padre
    // Este useEffect se ejecuta DESPUÉS de que se actualiza el estado en useCalendarLogic
    useEffect(() => {
        if (onSlotsSelected) {
            onSlotsSelected(selectedSlots);
        }
    }, [selectedSlots, onSlotsSelected]);

    // ✅ NUEVO: Exponer clearSelection para que el padre pueda limpiar la selección
    useEffect(() => {
        if (onClearSelection) {
            onClearSelection(clearSelection);
        }
    }, [clearSelection, onClearSelection]);

    // ✅ FIX BUG #9: Notificar al padre cuando cambia la semana
    // Esto permite que el padre actualice useWeeklyBookings con el weekId correcto
    useEffect(() => {
        if (onWeekChange) {
            onWeekChange(currentWeek);
        }
    }, [currentWeek, onWeekChange]);

    // ❌ REMOVIDO: Query de bookings (ahora viene como prop del padre)
    // const { data: existingBookings = [], isLoading: bookingsLoading } = useWeeklyBookings(...)

    // Slots de tiempo generados para cada día
    const timeSlots = useMemo(() => {
        if (!config) return [];

        const { openingTime, closingTime, slotDuration } = config;
        const slots = [];

        // Parsear horarios
        const [openHour, openMin] = openingTime.split(':').map(Number);
        const [closeHour, closeMin] = closingTime.split(':').map(Number);

        const openMinutes = openHour * 60 + openMin;
        const closeMinutes = closeHour * 60 + closeMin;

        // Generar slots
        for (let minutes = openMinutes; minutes < closeMinutes; minutes += slotDuration) {
            const hour = Math.floor(minutes / 60);
            const min = minutes % 60;
            slots.push({
                hour,
                minute: min,
                time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
            });
        }

        return slots;
    }, [config]);

    // Si no hay máquina seleccionada, mostrar mensaje
    if (!machineId) {
        return (
            <div className="flex-1 flex items-center justify-center res-bg-primary res-rounded-2xl p-24 min-h-[600px]res-rounded-lg">
                <div className="text-center max-w-md ">
                    <div className="w-20 h-20 mx-auto mb-6 res-bg-secondary res-rounded-full flex items-center justify-center">
                        <svg
                            className="w-10 h-10 res-text-muted"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold res-text-secondary mb-2">
                        Selecciona una máquina
                    </h3>
                    <p className="res-text-muted">
                        Elige una máquina del menú lateral para ver su calendario de disponibilidad.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col res-bg-primary res-rounded-2xl overflow-hidden min-h-[600px]">
            {/* Header del calendario */}
            <CalendarHeader
                machineName={machineName}
                machineColor={machineColor}
                currentWeek={currentWeek}
                weekDates={weekDates}
                onNavigate={navigateWeek}
                onToday={goToToday}
                canNavigateNext={canNavigateNext}
                canNavigatePrev={canNavigatePrev}
                selectedCount={selectedSlots.length}
                onClearSelection={clearSelection}
                isAdmin={isAdmin}
            />

            {/* Grid del calendario */}
            <div className="flex-1 py-6 overflow-auto md:overflow-hidden">
                <CalendarGrid
                    weekDates={weekDates}
                    timeSlots={timeSlots}
                    machineId={machineId}
                    machineColor={machineColor}
                    existingBookings={existingBookings}
                    selectedSlots={selectedSlots}
                    isSlotSelected={isSlotSelected}
                    onSlotClick={toggleSlotSelection}
                    onCancelBookingClick={onCancelBookingClick}
                    userId={user?.uid}
                    config={config}
                    isLoading={bookingsLoading}
                />
            </div>
        </div>
    );
}
