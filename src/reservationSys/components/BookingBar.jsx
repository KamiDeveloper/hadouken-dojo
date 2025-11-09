import { useMemo } from 'react';
import { ExclamationTriangleIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../../utils/dateHelpers';
import { countSlotsByDate, calculateDuration } from '../../utils/bookingHelpers';

/**
 * BookingBar - Barra flotante inferior con resumen de selección
 * 
 * @component
 * @param {Object} props
 * @param {Array} props.selectedSlots - Array de slots seleccionados
 * @param {Array} props.warnings - Array de warnings { type, message, date }
 * @param {function} props.onConfirm - Callback al confirmar reserva
 * @param {function} props.onClear - Callback al limpiar selección
 * @param {boolean} props.isVisible - Si la barra debe mostrarse
 * @param {boolean} props.isConfirming - Estado de carga durante confirmación
 * @param {Object} props.config - Configuración de reservas
 * 
 * @example
 * <BookingBar
 *   selectedSlots={[...]}
 *   warnings={[{ type: 'limit', message: '2/2 slots en Lun 4 Nov', date: Date }]}
 *   onConfirm={() => {}}
 *   onClear={() => {}}
 *   isVisible={true}
 *   isConfirming={false}
 *   config={config}
 * />
 */
export default function BookingBar({
    selectedSlots = [],
    warnings = [],
    onConfirm,
    onClear,
    isVisible = false,
    isConfirming = false,
    config,
}) {
    // Calcular estadísticas de selección
    const stats = useMemo(() => {
        const count = selectedSlots.length;
        const uniqueDates = new Set(
            selectedSlots.map((slot) => formatDate(slot.startTime))
        );
        const dateCount = uniqueDates.size;
        const duration = calculateDuration(selectedSlots);
        const slotsByDate = countSlotsByDate(selectedSlots);

        return {
            count,
            dateCount,
            duration,
            slotsByDate,
        };
    }, [selectedSlots]);

    // Determinar si hay warnings críticos
    const hasCriticalWarnings = warnings.some(
        (w) => w.type === 'limit' || w.type === 'conflict'
    );

    // Si no hay slots seleccionados, no mostrar (con animación)
    if (!isVisible || selectedSlots.length === 0) {
        return null;
    }

    return (
        <div
            className="
        fixed bottom-0 left-0 lg:left-[280px] right-0
        bg-gray-800 border-t-2 border-gray-700
        shadow-[0_-4px_6px_rgba(0,0,0,0.3)]
        px-6 py-4
        z-40
        animate-slide-up
      "
            role="region"
            aria-label="Resumen de reserva"
        >
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center gap-4">
                {/* Left section: Stats */}
                <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Selection count */}
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-lg font-semibold text-gray-100">
                            {stats.count} {stats.count === 1 ? 'slot seleccionado' : 'slots seleccionados'}
                        </span>
                    </div>

                    {/* Date count */}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>•</span>
                        <span>
                            {stats.dateCount} {stats.dateCount === 1 ? 'fecha' : 'fechas'}
                        </span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>•</span>
                        <span>{stats.duration} {stats.duration === 1 ? 'hora' : 'horas'} total</span>
                    </div>
                </div>

                {/* Middle section: Warnings (if any) */}
                {warnings.length > 0 && (
                    <div className="flex-shrink-0">
                        <div className="flex items-start gap-2 px-3 py-2 bg-amber-900/30 border border-amber-700 rounded-lg">
                            <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="flex flex-col gap-1">
                                {warnings.map((warning, index) => (
                                    <span key={index} className="text-sm text-amber-400">
                                        {warning.message}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Right section: Actions */}
                <div className="flex items-center gap-3 w-full lg:w-auto">
                    {/* Clear button */}
                    <button
                        onClick={onClear}
                        disabled={isConfirming}
                        className="
              px-4 py-2 rounded-lg
              text-gray-400 hover:text-gray-200
              bg-gray-700 hover:bg-gray-600
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
            "
                        aria-label="Limpiar selección"
                    >
                        <XMarkIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Limpiar</span>
                    </button>

                    {/* Confirm button */}
                    <button
                        onClick={onConfirm}
                        disabled={isConfirming || selectedSlots.length === 0}
                        className="
              px-6 py-2 rounded-lg font-semibold
              bg-blue-600 hover:bg-blue-700 active:bg-blue-800
              text-white
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
              shadow-lg hover:shadow-xl
              min-w-[160px] justify-center
            "
                        aria-label="Confirmar reserva"
                    >
                        {isConfirming ? (
                            <>
                                {/* Loading spinner */}
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <span>Procesando...</span>
                            </>
                        ) : (
                            <>
                                <CheckIcon className="w-5 h-5" />
                                <span>Confirmar Reserva</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Detailed breakdown (collapsible on mobile, always visible on desktop) */}
            {stats.dateCount > 1 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="max-w-7xl mx-auto">
                        <details className="lg:open">
                            <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 lg:cursor-default">
                                Desglose por fecha
                            </summary>
                            <div className="mt-2 flex flex-wrap gap-3">
                                {Object.entries(stats.slotsByDate).map(([dateStr, count]) => {
                                    // Buscar warning para esta fecha
                                    const dateWarning = warnings.find(
                                        (w) => w.date && formatDate(w.date) === dateStr
                                    );

                                    // Determinar color según límite
                                    const isAtLimit = config?.maxSlotsPerDay && count >= config.maxSlotsPerDay;
                                    const warningColor = isAtLimit ? 'text-amber-400' : 'text-emerald-400';

                                    return (
                                        <div
                                            key={dateStr}
                                            className="flex items-center gap-2 text-sm bg-gray-700 px-3 py-1.5 rounded-full"
                                        >
                                            <span className="text-gray-300">{dateStr}</span>
                                            <span className={`font-semibold ${warningColor}`}>
                                                {count}/{config?.maxSlotsPerDay || '∞'}
                                            </span>
                                            {isAtLimit && (
                                                <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </details>
                    </div>
                </div>
            )}
        </div>
    );
}
