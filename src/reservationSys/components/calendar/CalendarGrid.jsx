import { useState, useMemo } from 'react';
import { isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarDayColumn from './CalendarDayColumn';
import FloatingDaysSidebar from './FloatingDaysSidebar';

/**
 * CalendarGrid - Grid responsive del calendario
 * 
 * Desktop (≥768px): Grid de 7 columnas (sin cambios)
 * Mobile (<768px): Vista de 1 día con barra lateral flotante
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
    // ✅ MOBILE: Estado para día seleccionado (índice 0-6)
    // Por defecto: día actual (hoy) o primer día de la semana
    const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
        const todayIndex = weekDates.findIndex((date) => isToday(date));
        return todayIndex !== -1 ? todayIndex : 0;
    });

    // ✅ ANIMACIONES: Variants para transiciones de contenido
    const contentVariants = {
        initial: {
            opacity: 0,
            filter: 'blur(8px)',
            scale: 0.95,
            y: 10,
        },
        animate: {
            opacity: 1,
            filter: 'blur(0px)',
            scale: 1,
            y: 0,
            transition: {
                duration: 0.3,
                delay: 0.15,
                ease: [0.34, 1.56, 0.64, 1], // easeOutBack
            },
        },
        exit: {
            opacity: 0,
            filter: 'blur(4px)',
            scale: 0.98,
            y: -10,
            transition: {
                duration: 0.2,
                ease: 'easeIn',
            },
        },
    };

    // Filtrar solo días laborables según config
    const workDays = weekDates.filter((date) => {
        if (!config?.daysOfWeek) return true;
        const dayOfWeek = date.getDay(); // 0=Dom, 1=Lun, 2=Mar, etc.
        return config.daysOfWeek.includes(dayOfWeek);
    });

    // ✅ MOBILE: Calcular conteo de slots seleccionados por día (para badges)
    const selectionCountByDay = useMemo(() => {
        const counts = {};
        selectedSlots.forEach((slot) => {
            const dateKey = slot.startTime.toISOString().split('T')[0];
            counts[dateKey] = (counts[dateKey] || 0) + 1;
        });
        return counts;
    }, [selectedSlots]);

    // ✅ MOBILE: Día seleccionado para vista mobile
    const selectedDate = workDays[selectedDayIndex] || workDays[0];

    if (isLoading) {
        return (
            <>
                {/* Desktop skeleton */}
                <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="space-y-3">
                            {/* Skeleton header */}
                            <div className="h-16 res-bg-secondary res-rounded-lg animate-pulse" />
                            {/* Skeleton slots */}
                            {[...Array(8)].map((_, j) => (
                                <div key={j} className="h-16 res-bg-secondary res-rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Mobile skeleton */}
                <div className="md:hidden space-y-3">
                    <div className="h-20 res-bg-secondary res-rounded-lg animate-pulse" />
                    {[...Array(8)].map((_, j) => (
                        <div key={j} className="h-16 res-bg-secondary res-rounded-lg animate-pulse" />
                    ))}
                </div>

                {/* Mobile floating sidebar skeleton */}
                <div className="md:hidden fixed right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className="w-12 h-12 res-bg-secondary res-rounded-lg animate-pulse" />
                    ))}
                </div>
            </>
        );
    }

    if (workDays.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="res-text-muted text-center">
                    No hay días laborables configurados para esta semana.
                </p>
            </div>
        );
    }

    return (
        <>
            {/* ============================================
                DESKTOP VIEW - Grid de 7 columnas (sin cambios)
                ============================================ */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`desktop-${machineId}-${weekDates[0]?.toISOString()}`}
                    className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 auto-rows-min md:overflow-hidden"
                    variants={contentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                >
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
                </motion.div>
            </AnimatePresence>

            {/* ============================================
                MOBILE VIEW - Un solo día visible + Barra lateral
                ============================================ */}
            <div className="md:hidden max-w-[75dvw]">
                {/* Día seleccionado (full width) */}
                <AnimatePresence mode="wait">
                    {selectedDate && (
                        <motion.div
                            key={`mobile-${machineId}-${selectedDate.toISOString()}`}
                            variants={contentVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                        >
                            <CalendarDayColumn
                                date={selectedDate}
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
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Barra lateral flotante con días */}
                <FloatingDaysSidebar
                    weekDates={workDays}
                    selectedDayIndex={selectedDayIndex}
                    onDaySelect={setSelectedDayIndex}
                    selectionCountByDay={selectionCountByDay}
                />
            </div>
        </>
    );
}
