import { useState } from 'react';

/**
 * MachineItem - Item de máquina con color dot y badge de selección
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.machine - Objeto de máquina { id, name, color, active, icon, description }
 * @param {boolean} props.isSelected - Si esta máquina está actualmente seleccionada
 * @param {number} props.selectionCount - Número de slots seleccionados para esta máquina
 * @param {function} props.onClick - Callback cuando se hace click
 * 
 * @example
 * <MachineItem
 *   machine={{ id: 'piu-1', name: 'PIU Phoenix LX', color: '#EF4444', active: true }}
 *   isSelected={true}
 *   selectionCount={3}
 *   onClick={() => {}}
 * />
 */
export default function MachineItem({
    machine,
    isSelected,
    selectionCount = 0,
    onClick,
}) {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    // Determinar si la máquina está activa
    const isActive = machine.active !== false; // Por defecto true si no está definido

    return (
        <button
            onClick={onClick}
            disabled={!isActive}
            className={`
        w-full flex items-center gap-3 p-3 pl-6 res-rounded-lg
        res-transition-fast
        border-l-[3px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800
        ${isSelected
                    ? `res-bg-tertiary res-shadow-md`
                    : isActive
                        ? 'bg-transparent hover:res-bg-tertiary/50'
                        : 'bg-transparent opacity-60 cursor-not-allowed'
                }
        ${isActive ? 'focus:ring-gray-500' : ''}
      `}
            style={{
                borderLeftColor: isSelected ? machine.color : 'transparent',
            }}
            aria-pressed={isSelected}
            aria-label={`Máquina ${machine.name}${!isActive ? ' (Inactiva)' : ''}`}
            aria-disabled={!isActive}
        >
            {/* Color dot indicator */}
            <div className="flex-shrink-0 relative">
                <div
                    className="w-3 h-3 res-rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: machine.color }}
                    aria-hidden="true"
                />
                {isSelected && (
                    <div
                        className="absolute inset-0 w-3 h-3 res-rounded-full animate-ping opacity-75"
                        style={{ backgroundColor: machine.color }}
                        aria-hidden="true"
                    />
                )}
            </div>

            {/* Machine icon (optional, small) */}
            {!imageError && machine.icon && (
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                    <img
                        src={machine.icon}
                        alt=""
                        className="w-full h-full object-contain opacity-75"
                        onError={handleImageError}
                    />
                </div>
            )}

            {/* Content */}
            <div className="flex-1 text-left min-w-0">
                <h4
                    className={`
            text-sm font-medium transition-colors truncate
            ${isSelected ? 'res-text-primary' : isActive ? 'res-text-secondary' : 'res-text-muted'}
          `}
                >
                    {machine.name}
                </h4>
                {machine.description && (
                    <p
                        className={`
              text-xs mt-0.5 transition-colors truncate
              ${isSelected ? 'res-text-tertiary' : 'res-text-muted'}
            `}
                    >
                        {machine.description}
                    </p>
                )}
            </div>

            {/* Badge: Inactive status */}
            {!isActive && (
                <span className="flex-shrink-0 px-2 py-0.5 text-xs font-medium res-rounded-full res-bg-tertiary res-text-tertiary border res-border-secondary">
                    Inactivo
                </span>
            )}

            {/* Badge: Selection count (solo si hay selecciones) */}
            {isActive && selectionCount > 0 && (
                <span
                    className="flex-shrink-0 w-6 h-6 flex items-center justify-center res-rounded-full text-xs font-bold text-white res-shadow-md"
                    style={{ backgroundColor: machine.color }}
                    aria-label={`${selectionCount} slots seleccionados`}
                >
                    {selectionCount}
                </span>
            )}
        </button>
    );
}
