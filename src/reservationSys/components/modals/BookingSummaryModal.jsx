import { useEffect, useMemo } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { formatDate, formatTime } from '../../../utils/dateHelpers';
import { groupBookingsByDate, calculateDuration, sortSlotsByTime } from '../../../utils/bookingHelpers';

/**
 * BookingSummaryModal - Modal de confirmación de reserva
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {function} props.onClose - Callback al cerrar modal
 * @param {function} props.onConfirm - Callback al confirmar reserva
 * @param {Array} props.selectedSlots - Array de slots seleccionados
 * @param {string} props.machineName - Nombre de la máquina
 * @param {string} props.machineColor - Color de la máquina
 * @param {Array} props.warnings - Array de warnings
 * @param {boolean} props.isConfirming - Estado de loading durante confirmación
 * @param {string} props.error - Mensaje de error si falla la confirmación
 * @param {function} props.onRetry - Callback para retry después de error
 * 
 * @example
 * <BookingSummaryModal
 *   isOpen={true}
 *   onClose={() => {}}
 *   onConfirm={() => {}}
 *   selectedSlots={[...]}
 *   machineName="PIU Phoenix LX"
 *   machineColor="#EF4444"
 *   warnings={[]}
 *   isConfirming={false}
 *   error={null}
 *   onRetry={() => {}}
 * />
 */
export default function BookingSummaryModal({
    isOpen,
    onClose,
    onConfirm,
    selectedSlots = [],
    machineName,
    machineColor,
    warnings = [],
    isConfirming = false,
    error = null,
    onRetry,
}) {
    // Agrupar slots por fecha
    const groupedSlots = useMemo(() => {
        if (!selectedSlots.length) return new Map();
        return groupBookingsByDate(selectedSlots);
    }, [selectedSlots]);

    // Calcular estadísticas
    const stats = useMemo(() => {
        const count = selectedSlots.length;
        const duration = calculateDuration(selectedSlots);
        const dateCount = groupedSlots.size;

        return { count, duration, dateCount };
    }, [selectedSlots, groupedSlots]);

    // Cerrar modal con Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen && !isConfirming) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, isConfirming, onClose]);

    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            {/* Backdrop overlay */}
            <div
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                onClick={!isConfirming ? onClose : undefined}
                aria-hidden="true"
            />

            {/* Modal container */}
            <div
                className="
          relative w-full max-w-2xl max-h-[90vh] overflow-hidden
          bg-gray-800 border border-gray-700
          rounded-2xl shadow-[0_20px_25px_rgba(0,0,0,0.7)]
          animate-fade-in
        "
                style={{
                    animation: 'fade-in 200ms ease-out, modal-scale 200ms ease-out',
                }}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-700">
                    <div className="flex-1">
                        <h2 id="modal-title" className="text-2xl font-bold text-gray-50 mb-2">
                            Confirmar Reserva
                        </h2>
                        {/* Machine info */}
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: machineColor }}
                                aria-hidden="true"
                            />
                            <span className="text-base text-gray-300">{machineName}</span>
                        </div>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        disabled={isConfirming}
                        className="
              p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-700
              transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500
              disabled:opacity-50 disabled:cursor-not-allowed
            "
                        aria-label="Cerrar modal"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Body - Scrollable content */}
                <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
                    {/* Summary stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-900 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-blue-400">{stats.count}</div>
                            <div className="text-sm text-gray-400 mt-1">
                                {stats.count === 1 ? 'Slot' : 'Slots'}
                            </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-emerald-400">{stats.dateCount}</div>
                            <div className="text-sm text-gray-400 mt-1">
                                {stats.dateCount === 1 ? 'Fecha' : 'Fechas'}
                            </div>
                        </div>
                        <div className="bg-gray-900 rounded-lg p-4 text-center">
                            <div className="text-3xl font-bold text-amber-400">{stats.duration}h</div>
                            <div className="text-sm text-gray-400 mt-1">Duración</div>
                        </div>
                    </div>

                    {/* Warnings section */}
                    {warnings.length > 0 && (
                        <div className="mb-6 space-y-2">
                            {warnings.map((warning, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-4 bg-amber-900/30 border-l-4 border-amber-500 rounded-lg"
                                >
                                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-amber-400">{warning.message}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Slots grouped by date */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-300 mb-3">
                            Horarios seleccionados
                        </h3>

                        {Array.from(groupedSlots.entries()).map(([dateStr, slots]) => {
                            const sortedSlots = sortSlotsByTime(slots);

                            return (
                                <div key={dateStr} className="bg-gray-900 rounded-lg p-4">
                                    {/* Date header */}
                                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
                                        <h4 className="text-base font-semibold text-gray-200">
                                            {dateStr}
                                        </h4>
                                        <span className="text-sm text-gray-400">
                                            {slots.length} {slots.length === 1 ? 'slot' : 'slots'}
                                        </span>
                                    </div>

                                    {/* Time slots list */}
                                    <div className="space-y-2">
                                        {sortedSlots.map((slot, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <CheckCircleIcon className="w-5 h-5 text-blue-400" />
                                                    <span className="text-gray-300">
                                                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {Math.round(
                                                        (slot.endTime.getTime() - slot.startTime.getTime()) / (1000 * 60)
                                                    )}{' '}
                                                    min
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-lg">
                            <div className="flex items-start gap-3">
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-red-400 mb-1">
                                        Error al confirmar reserva
                                    </p>
                                    <p className="text-sm text-red-300">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer - Actions */}
                <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-700 bg-gray-850">
                    {/* Cancel button */}
                    <button
                        onClick={onClose}
                        disabled={isConfirming}
                        className="
              flex-1 px-6 py-3 rounded-lg font-medium
              bg-gray-700 hover:bg-gray-600 text-gray-200
              border border-gray-600
              transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800
              disabled:opacity-50 disabled:cursor-not-allowed
            "
                    >
                        Cancelar
                    </button>

                    {/* Confirm or Retry button */}
                    {error && onRetry ? (
                        <button
                            onClick={onRetry}
                            disabled={isConfirming}
                            className="
                flex-1 px-6 py-3 rounded-lg font-semibold
                bg-amber-600 hover:bg-amber-700 active:bg-amber-800
                text-white
                transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-800
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                shadow-lg hover:shadow-xl
              "
                        >
                            <ExclamationTriangleIcon className="w-5 h-5" />
                            Reintentar
                        </button>
                    ) : (
                        <button
                            onClick={onConfirm}
                            disabled={isConfirming || selectedSlots.length === 0}
                            className="
                flex-1 px-6 py-3 rounded-lg font-semibold
                bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                text-white
                transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
                shadow-lg hover:shadow-xl
              "
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
                                    <span>Confirmando...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="w-5 h-5" />
                                    <span>Confirmar Reserva</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
