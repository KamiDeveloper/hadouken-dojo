import { useMemo } from 'react';
import { format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import TimeSlot from './TimeSlot';
import { isSameSlot } from '../../../utils/dateHelpers';

/**
 * CalendarDayColumn - Columna de un día del calendario con sus slots
 * 
 * @component
 * @param {Object} props
 * @param {Date} props.date - Fecha del día
 * @param {Array} props.timeSlots - Slots de tiempo disponibles
 * @param {string} props.machineId - ID de la máquina
 * @param {string} props.machineColor - Color de la máquina
 * @param {Array} props.existingBookings - Bookings existentes
 * @param {Array} props.selectedSlots - Slots seleccionados
 * @param {function} props.isSlotSelected - Función para verificar si slot está seleccionado
 * @param {function} props.onSlotClick - Callback al hacer click en slot disponible/seleccionado
 * @param {function} props.onCancelBookingClick - Callback al hacer click en reserva propia
 * @param {string} props.userId - ID del usuario actual
 * @param {Object} props.config - Configuración de reservas
 */
export default function CalendarDayColumn({
    date,
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
}) {
    const isCurrentDay = isToday(date);

    // Formatear fecha para header
    const dayName = format(date, 'EEE', { locale: es });
    const dayNumber = format(date, 'd', { locale: es });
    const monthName = format(date, 'MMM', { locale: es });

    // Generar slots para este día
    const daySlots = useMemo(() => {
        if (!config) return [];

        return timeSlots.map((timeSlot) => {
            // Crear Date object para startTime
            const startTime = new Date(date);
            startTime.setHours(timeSlot.hour, timeSlot.minute, 0, 0);

            // Crear Date object para endTime
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + (config.slotDuration || 60));

            const slot = {
                startTime,
                endTime,
                machineId,
            };

            // Buscar si hay booking para este slot
            const booking = existingBookings.find((b) => {
                // Normalizar timestamps: pueden venir como Firestore Timestamp o Date nativo
                const bookingStartTime = b.startTime?.toDate ? b.startTime.toDate() : b.startTime;
                const bookingEndTime = b.endTime?.toDate ? b.endTime.toDate() : b.endTime;

                // ✅ FIX: Pasar machineId del booking para comparación correcta
                const match = isSameSlot(
                    { startTime: bookingStartTime, endTime: bookingEndTime, machineId: b.machineId },
                    slot
                );

                return match;
            });

            // Determinar estado
            let status = 'available';
            let bookingData = null;

            if (booking) {
                bookingData = booking;
                if (booking.userId === userId) {
                    status = 'mine';
                } else {
                    status = 'booked';
                }
            } else if (isSlotSelected(slot)) {
                status = 'selected';
            }

            // Verificar si está en el pasado
            const now = new Date();
            if (startTime < now) {
                status = 'past';
            }

            return {
                ...slot,
                status,
                booking: bookingData,
            };
        });
    }, [date, timeSlots, config, existingBookings, machineId, userId, isSlotSelected]);

    return (
        <div className="flex flex-col min-h-[400px] max-h-[calc(100vh-100px)]">
            {/* Day header */}
            <div
                className={`
            flex-shrink-0 p-4 rounded-t-lg text-center res-transition-base
            ${isCurrentDay
                        ? 'bg-gray-800 border-2 border-gray-600'
                        : 'res-bg-secondary res-border-primary border'
                    }
        `}
            >
                <div
                    className={`
            text-sm font-semibold uppercase tracking-wide
            ${isCurrentDay ? 'text-blue-200' : 'res-text-tertiary'}
            `}
                >
                    {dayName}
                </div>
                <div
                    className={`
            text-2xl font-bold mt-1
            ${isCurrentDay ? 'text-white' : 'res-text-primary'}
            `}
                >
                    {dayNumber}
                </div>
                {/* Mes solo en desktop */}
                <div
                    className={`
            text-xs uppercase hidden md:block
            ${isCurrentDay ? 'text-blue-300' : 'res-text-muted'}
            `}
                >
                    {monthName}
                </div>
            </div>

            {/* Slots list */}
            <div className="flex-1 overflow-y-auto space-y-2 p-2 res-bg-secondary/50 rounded-b-lg res-border-primary border border-t-0">
                {daySlots.map((slot, index) => (
                    <TimeSlot
                        key={`${slot.startTime.toISOString()}-${index}`}
                        slot={slot}
                        machineColor={machineColor}
                        onClick={() => {
                            // ✅ FIX: Si es reserva propia, abrir modal de cancelación
                            if (slot.status === 'mine' && slot.booking && onCancelBookingClick) {
                                onCancelBookingClick(slot.booking);
                            } else {
                                // Para disponibles, seleccionados, etc. usar flujo normal
                                onSlotClick(slot);
                            }
                        }}
                        userId={userId}
                    />
                ))}

                {daySlots.length === 0 && (
                    <div className="flex items-center justify-center h-full py-8">
                        <p className="res-text-muted text-sm text-center">
                            No hay horarios disponibles
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
