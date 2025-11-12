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
                className="absolute inset-0 bg-black/75 !backdrop-blur-sm"
                onClick={!isCancelling ? onClose : undefined}
                aria-hidden="true"
            />

            {/* Modal container */}
            <div
                className="
            relative w-full max-w-md
            !backdrop-blur-md
            res-bg-secondary res-border-primary border
            res-rounded-2xl shadow-[0_20px_25px_rgba(0,0,0,0.7)]
            animate-fade-in
            "
                style={{
                    animation: 'fade-in 200ms ease-out, modal-scale 200ms ease-out',
                }}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b res-border-primary">
                    <div className="flex-1">
                        <h2 id="cancel-modal-title" className="text-2xl font-bold res-text-primary mb-2">
                            Cancelar Reserva
                        </h2>
                        {/* Machine info */}
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 res-rounded-full border-2 border-white shadow-sm"
                                style={{ backgroundColor: machineColor }}
                                aria-hidden="true"
                            />
                            <span className="text-base res-text-secondary">{machineName}</span>
                        </div>
                    </div>

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        disabled={isCancelling}
                        className="
              p-2 res-rounded-lg res-text-tertiary hover:res-text-secondary hover:res-bg-tertiary
              res-transition-base focus:outline-none focus:ring-2 focus:ring-gray-500
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
                    <div className="flex gap-3 p-4 bg-amber-900/20 border border-amber-500/30 res-rounded-lg mb-6">
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
                        <div className="flex justify-between items-center py-2 border-b res-border-primary">
                            <span className="res-text-tertiary text-sm">Fecha:</span>
                            <span className="res-text-secondary font-medium">
                                {formatDate(startTime)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-2 border-b res-border-primary">
                            <span className="res-text-tertiary text-sm">Hora:</span>
                            <span className="res-text-secondary font-medium">
                                {formatTime(startTime)} - {formatTime(endTime)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-2">
                            <span className="res-text-tertiary text-sm">Duración:</span>
                            <span className="res-text-secondary font-medium">1 hora</span>
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="flex gap-3 p-4 bg-red-900/20 border border-red-500/30 res-rounded-lg mb-6">
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
                flex-1 px-4 py-3 res-rounded-lg
                res-bg-tertiary hover:res-bg-secondary
                res-text-secondary font-medium
                res-transition-base
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
                flex-1 px-4 py-3 res-rounded-lg
                bg-red-600 hover:bg-red-700
                text-white font-medium
                flex items-center justify-center gap-2
                res-transition-base
                focus:outline-none focus:ring-2 focus:ring-red-500
                disabled:opacity-50 disabled:cursor-not-allowed
              "
                        >
                            {isCancelling ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white res-rounded-full animate-spin" />
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
