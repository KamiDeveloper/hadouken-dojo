import CalendarDayColumn from './CalendarDayColumn';

/**
 * CalendarGrid - Grid responsive del calendario (desktop: 5 columnas, mobile: lista)
 * 
 * @component
 * @param {Object} props
 * @param {Date[]} props.weekDates - Array de fechas de la semana (filtrado por daysOfWeek)
 * @param {Array} props.timeSlots - Array de slots de tiempo { hour, minute, time }
 * @param {string} props.machineId - ID de la máquina
 * @param {string} props.machineColor - Color de la máquina
 * @param {Array} props.existingBookings - Bookings existentes
 * @param {Array} props.selectedSlots - Slots seleccionados
 * @param {function} props.isSlotSelected - Función para verificar si slot está seleccionado
 * @param {function} props.onSlotClick - Callback al hacer click en slot
 * @param {function} props.onCancelBookingClick - Callback al hacer click en reserva propia
 * @param {string} props.userId - ID del usuario actual
 * @param {Object} props.config - Configuración de reservas
 * @param {boolean} props.isLoading - Estado de carga
 * 
 * @example
 * <CalendarGrid
 *   weekDates={[...]}
 *   timeSlots={[...]}
 *   machineId="piu-1"
 *   machineColor="#EF4444"
 *   existingBookings={[...]}
 *   selectedSlots={[...]}
 *   isSlotSelected={(slot) => boolean}
 *   onSlotClick={(slot) => {}}
 *   onCancelBookingClick={(booking) => {}}
 *   userId="user123"
 *   config={{...}}
 *   isLoading={false}
 * />
 */
export default function CalendarGrid({
    weekDates,
    timeSlots,
    machineId,
    machineColor,
    existingBookings,
    selectedSlots,
    isSlotSelected,
    onSlotClick,
    onCancelBookingClick,
    userId,
    config,
    isLoading,
}) {
    // Filtrar solo días laborables según config
    const workDays = weekDates.filter((date) => {
        if (!config?.daysOfWeek) return true;
        const dayOfWeek = date.getDay(); // 0=Dom, 1=Lun, 2=Mar, etc.
        return config.daysOfWeek.includes(dayOfWeek);
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-3">
                        {/* Skeleton header */}
                        <div className="h-16 bg-gray-800 rounded-lg animate-pulse" />
                        {/* Skeleton slots */}
                        {[...Array(8)].map((_, j) => (
                            <div key={j} className="h-16 bg-gray-800 rounded-lg animate-pulse" />
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    if (workDays.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-gray-500 text-center">
                    No hay días laborables configurados para esta semana.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 auto-rows-min">
            {workDays.map((date) => (
                <CalendarDayColumn
                    key={date.toISOString()}
                    date={date}
                    timeSlots={timeSlots}
                    machineId={machineId}
                    machineColor={machineColor}
                    existingBookings={existingBookings}
                    selectedSlots={selectedSlots}
                    isSlotSelected={isSlotSelected}
                    onSlotClick={onSlotClick}
                    onCancelBookingClick={onCancelBookingClick}
                    userId={userId}
                    config={config}
                />
            ))}
        </div>
    );
}
