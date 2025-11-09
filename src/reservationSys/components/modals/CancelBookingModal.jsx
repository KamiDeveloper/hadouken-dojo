import { useEffect } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { formatDate, formatTime } from '../../../utils/dateHelpers';

/**
 * CancelBookingModal - Modal de confirmación para cancelar una reserva
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Si el modal está abierto
 * @param {function} props.onClose - Callback al cerrar modal
 * @param {function} props.onConfirm - Callback al confirmar cancelación
 * @param {Object} props.booking - Objeto booking a cancelar
 * @param {string} props.machineName - Nombre de la máquina
 * @param {string} props.machineColor - Color de la máquina
 * @param {boolean} props.isCancelling - Estado de loading durante cancelación
 * @param {string} props.error - Mensaje de error si falla la cancelación
 * 
 * @example
 * <CancelBookingModal
 *   isOpen={true}
 *   onClose={() => {}}
 *   onConfirm={() => {}}
 *   booking={{ id: '123', startTime: Date, endTime: Date, ... }}
 *   machineName="PIU Phoenix LX"
 *   machineColor="#EF4444"
 *   isCancelling={false}
 *   error={null}
 * />
 */
export default function CancelBookingModal({
    isOpen,
    onClose,
    onConfirm,
    booking,
    machineName,
    machineColor,
    isCancelling = false,
    error = null,
}) {
    // Cerrar modal con Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen && !isCancelling) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, isCancelling, onClose]);

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

    if (!isOpen || !booking) return null;

    // Normalizar timestamps de Firestore
    const startTime = booking.startTime?.toDate ? booking.startTime.toDate() : booking.startTime;
    const endTime = booking.endTime?.toDate ? booking.endTime.toDate() : booking.endTime;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-modal-title"
        >
            {/* Backdrop overlay */}
            <div
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                onClick={!isCancelling ? onClose : undefined}
                aria-hidden="true"
            />

            {/* Modal container */}
            <div
                className="
          relative w-full max-w-md
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
                        <h2 id="cancel-modal-title" className="text-2xl font-bold text-gray-50 mb-2">
                            Cancelar Reserva
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
                        disabled={isCancelling}
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

                {/* Body */}
                <div className="p-6">
                    {/* Warning message */}
                    <div className="flex gap-3 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg mb-6">
                        <ExclamationTriangleIcon className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-amber-200 font-medium mb-1">
                                ¿Estás seguro de cancelar esta reserva?
                            </p>
                            <p className="text-amber-300/80 text-sm">
                                Esta acción no se puede deshacer.
                            </p>
                        </div>
                    </div>

                    {/* Booking details */}
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-gray-400 text-sm">Fecha:</span>
                            <span className="text-gray-200 font-medium">
                                {formatDate(startTime)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b border-gray-700">
                            <span className="text-gray-400 text-sm">Hora:</span>
                            <span className="text-gray-200 font-medium">
                                {formatTime(startTime)} - {formatTime(endTime)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-2">
                            <span className="text-gray-400 text-sm">Duración:</span>
                            <span className="text-gray-200 font-medium">1 hora</span>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="flex gap-3 p-4 bg-red-900/20 border border-red-500/30 rounded-lg mb-6">
                            <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-red-200 text-sm font-medium mb-1">Error al cancelar</p>
                                <p className="text-red-300/80 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-3">
                        {/* Cancel button */}
                        <button
                            onClick={onClose}
                            disabled={isCancelling}
                            className="
                flex-1 px-4 py-3 rounded-lg
                bg-gray-700 hover:bg-gray-600
                text-gray-200 font-medium
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-gray-500
                disabled:opacity-50 disabled:cursor-not-allowed
              "
                        >
                            Volver
                        </button>

                        {/* Confirm cancel button */}
                        <button
                            onClick={onConfirm}
                            disabled={isCancelling}
                            className="
                flex-1 px-4 py-3 rounded-lg
                bg-red-600 hover:bg-red-700
                text-white font-medium
                flex items-center justify-center gap-2
                transition-colors
                focus:outline-none focus:ring-2 focus:ring-red-500
                disabled:opacity-50 disabled:cursor-not-allowed
              "
                        >
                            {isCancelling ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Cancelando...</span>
                                </>
                            ) : (
                                <>
                                    <TrashIcon className="w-5 h-5" />
                                    <span>Cancelar Reserva</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
