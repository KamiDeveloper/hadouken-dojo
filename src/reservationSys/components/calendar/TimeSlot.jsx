import { memo } from 'react';
import { LockClosedIcon, UserIcon } from '@heroicons/react/24/solid';
import { formatTime } from '../../../utils/dateHelpers';

/**
 * TimeSlot - Componente de slot de tiempo individual (React.memo para optimización)
 * 
 * Estados:
 * - available: Disponible (Emerald)
 * - selected: Seleccionado (Blue con glow)
 * - booked: Reservado por otro (Red con lock icon)
 * - mine: Tu reserva (Amber con user icon)
 * - past: Pasado/Bloqueado (Gray con opacity)
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.slot - Objeto slot { startTime, endTime, status, booking }
 * @param {string} props.machineColor - Color de la máquina
 * @param {function} props.onClick - Callback al hacer click
 * @param {string} props.userId - ID del usuario actual
 */
const TimeSlot = memo(function TimeSlot({ slot, machineColor, onClick, userId }) {
    const { startTime, endTime, status, booking } = slot;

    // Formatear tiempos
    const startTimeStr = formatTime(startTime);
    const endTimeStr = formatTime(endTime);

    // Determinar clases CSS según estado
    const getStatusClasses = () => {
        switch (status) {
            case 'available':
                return {
                    container: 'slot-available cursor-pointer active:scale-95',
                    text: '',
                    border: '',
                    icon: null,
                };

            case 'selected':
                return {
                    container: 'slot-selected cursor-pointer active:scale-95 res-shadow-lg shadow-blue-500/20',
                    text: 'text-blue-300',
                    border: 'border-blue-500 border-2',
                    icon: null,
                };

            case 'booked':
                return {
                    container: 'slot-booked cursor-not-allowed',
                    text: 'text-red-300',
                    border: 'border-red-500',
                    icon: <LockClosedIcon className="w-4 h-4" />,
                };

            case 'mine':
                return {
                    container: 'slot-mine cursor-pointer',
                    text: 'text-amber-300',
                    border: 'border-amber-500',
                    icon: <UserIcon className="w-4 h-4" />,
                };

            case 'past':
                return {
                    container: 'slot-disabled cursor-not-allowed',
                    text: 'res-text-muted',
                    border: 'res-border-secondary',
                    icon: null,
                };

            default:
                return {
                    container: 'res-bg-secondary cursor-default',
                    text: 'res-text-tertiary',
                    border: 'res-border-primary',
                    icon: null,
                };
        }
    };

    const statusClasses = getStatusClasses();
    const isInteractive = status === 'available' || status === 'selected' || status === 'mine';

    // Handler de click
    const handleClick = () => {
        if (isInteractive) {
            onClick();
        }
    };

    // Handler de teclado
    const handleKeyDown = (e) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
        }
    };

    return (
        <button
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            disabled={!isInteractive}
            className={`
        w-full min-h-[60px] p-3 res-rounded-lg
        flex items-center justify-between gap-2
        border res-transition-fast
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
        ${statusClasses.container}
        ${statusClasses.border}
        ${isInteractive ? 'focus:ring-blue-500' : 'focus:ring-gray-600'}
      `}
            aria-label={`Slot de ${startTimeStr} a ${endTimeStr} - ${status === 'available' ? 'Disponible' : status === 'selected' ? 'Seleccionado' : status === 'booked' ? 'Reservado' : status === 'mine' ? 'Tu reserva' : 'No disponible'}`}
            aria-pressed={status === 'selected'}
            aria-disabled={!isInteractive}
        >
            {/* Time info */}
            <div className="flex-1 text-left flex">
                <div className={`text-sm font-semibold ${statusClasses.text}`}>
                    {startTimeStr}
                </div>


                {/* Booking info (si aplica) */}
                {booking && status === 'booked' && (
                    <div className="text-[0.60rem] text-red-400 mt-1 truncate ml-3 uppercase">
                        @{booking.username || 'Usuario'}
                    </div>
                )}
                {booking && status === 'mine' && (
                    <div className="text-[0.60rem] text-amber-400 mt-1 truncate ml-3">
                        Tu reserva
                    </div>
                )}
            </div>

            {/* Status icon */}
            {statusClasses.icon && (
                <div className={statusClasses.text}>
                    {statusClasses.icon}
                </div>
            )}

            {/* Selected indicator (pulsing dot) */}
            {status === 'selected' && (
                <div className="flex-shrink-0">
                    <div className="relative w-3 h-3">
                        <div className="absolute inset-0 res-rounded-full bg-blue-500" />
                        <div className="absolute inset-0 res-rounded-full bg-blue-500 animate-ping opacity-75" />
                    </div>
                </div>
            )}
        </button>
    );
});

export default TimeSlot;
