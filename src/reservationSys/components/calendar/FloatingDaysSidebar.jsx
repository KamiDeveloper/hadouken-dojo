import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * FloatingDaysSidebar - Barra lateral flotante con botones de días (Mobile only)
 * 
 * Diseño:
 * - Fixed right-4, centrado verticalmente
 * - Botones verticales con iniciales de días (LUN, MAR, MIÉ...)
 * - Día activo destacado con estilos semánticos
 * - z-index 40 para flotar sobre contenido
 * - Ergonomía: Derecha para acceso con pulgar (mayoría usuarios diestros)
 * 
 * @component
 * @param {Object} props
 * @param {Date[]} props.weekDates - Array de fechas de la semana
 * @param {number} props.selectedDayIndex - Índice del día seleccionado (0-6)
 * @param {function} props.onDaySelect - Callback al seleccionar día
 * @param {number} props.selectionCountByDay - Objeto con conteo de slots por día
 * 
 * @example
 * <FloatingDaysSidebar
 *   weekDates={[...]}
 *   selectedDayIndex={2}
 *   onDaySelect={(index) => setSelectedDay(index)}
 *   selectionCountByDay={{ '2024-11-11': 3, '2024-11-12': 2 }}
 * />
 */
export default function FloatingDaysSidebar({
    weekDates,
    selectedDayIndex,
    onDaySelect,
    selectionCountByDay = {},
}) {
    return (
        <div
            className="
                fixed right-4 top-1/2 -translate-y-1/2 z-40
                flex flex-col gap-2
                md:hidden
            "
            role="navigation"
            aria-label="Navegación de días"
        >
            {weekDates.map((date, index) => {
                const isActive = selectedDayIndex === index;
                const dayAbbr = format(date, 'EEE', { locale: es })
                    .toUpperCase()
                    .slice(0, 3); // LUN, MAR, MIÉ...

                // Contar slots seleccionados para este día
                const dateKey = date.toISOString().split('T')[0];
                const slotCount = selectionCountByDay[dateKey] || 0;

                return (
                    <button
                        key={date.toISOString()}
                        onClick={() => onDaySelect(index)}
                        className={`
                            relative
                            w-12 h-12
                            flex items-center justify-center
                            res-rounded-lg
                            font-semibold text-xs
                            res-transition-fast
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
                            ${isActive
                                ? 'res-bg-tertiary res-border-primary border-2 res-text-primary shadow-lg scale-110'
                                : 'res-bg-secondary/80 backdrop-blur-sm res-border-secondary border res-text-tertiary hover:res-bg-tertiary hover:res-text-secondary hover:scale-105'
                            }
                        `}
                        aria-label={`${dayAbbr} ${format(date, 'd MMM', { locale: es })}`}
                        aria-pressed={isActive}
                    >
                        {/* Texto del día */}
                        <span className="relative z-10">{dayAbbr}</span>

                        {/* Badge de slots seleccionados */}
                        {slotCount > 0 && (
                            <div
                                className="
                                    absolute -top-1 -right-1
                                    w-5 h-5
                                    flex items-center justify-center
                                    bg-blue-600 border-2 border-gray-900
                                    res-rounded-full
                                    text-white text-[10px] font-bold
                                "
                                aria-label={`${slotCount} slots seleccionados`}
                            >
                                {slotCount}
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
