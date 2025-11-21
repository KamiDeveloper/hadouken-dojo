import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { formatWeekRange } from '../../../utils/dateHelpers';

/**
 * CalendarHeader - Header del calendario con navegación de semana
 * 
 * @component
 * @param {Object} props
 * @param {string} props.machineName - Nombre de la máquina
 * @param {string} props.machineColor - Color de la máquina
 * @param {Date} props.currentWeek - Fecha de inicio de la semana actual
 * @param {Date[]} props.weekDates - Array de 7 fechas de la semana
 * @param {function} props.onNavigate - Callback para navegación ('prev' | 'next')
 * @param {function} props.onToday - Callback para ir a hoy
 * @param {boolean} props.canNavigateNext - Si se puede navegar a siguiente semana
 * @param {boolean} props.canNavigatePrev - Si se puede navegar a semana anterior
 * @param {number} props.selectedCount - Cantidad de slots seleccionados
 * @param {function} props.onClearSelection - Callback para limpiar selección
 * @param {boolean} props.isAdmin - Si el usuario es admin (FEATURE 3)
 * 
 * @example
 * <CalendarHeader
 *   machineName="PIU Phoenix LX"
 *   machineColor="#EF4444"
 *   currentWeek={new Date()}
 *   weekDates={[...]}
 *   onNavigate={(dir) => {}}
 *   onToday={() => {}}
 *   canNavigateNext={true}
 *   canNavigatePrev={true}
 *   selectedCount={3}
 *   onClearSelection={() => {}}
 *   isAdmin={false}
 * />
 */
export default function CalendarHeader({
    machineName,
    machineColor,
    currentWeek,
    weekDates,
    onNavigate,
    onToday,
    canNavigateNext,
    canNavigatePrev,
    selectedCount = 0,
    onClearSelection,
    isAdmin = false, // ✅ FEATURE 3: Si el usuario es admin
}) {
    // Formatear rango de semana
    const weekRange = weekDates.length > 0
        ? formatWeekRange(weekDates[0], weekDates[weekDates.length - 1])
        : '';

    return (
        <div className="flex-shrink-0 mt-10 border-b res-border-primary res-bg-secondary res-rounded-2xl p-6">
            {/* Top row: Machine name + selected count */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* Color indicator */}
                    <div
                        className="w-4 h-4 res-rounded-full border-2 border-white res-shadow-lg"
                        style={{ backgroundColor: machineColor }}
                        aria-hidden="true"
                    />

                    <h2 className="text-2xl font-bold res-text-primary">
                        {machineName}
                    </h2>
                </div>

                {/* Selected slots indicator */}
                {selectedCount > 0 && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm res-text-tertiary">
                            {selectedCount} {selectedCount === 1 ? 'slot seleccionado' : 'slots seleccionados'}
                        </span>
                        <button
                            onClick={onClearSelection}
                            className="p-2 res-rounded-lg res-bg-secondary hover:res-bg-tertiary res-text-tertiary hover:res-text-secondary res-transition-fast focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label="Limpiar selección"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Bottom row: Week navigation */}
            <div className="flex items-center justify-between">
                {/* Week range display */}
                <div className="flex items-center gap-3">
                    <CalendarIcon className="w-5 h-5 res-text-tertiary" />
                    <span className="text-lg font-medium res-text-secondary">
                        {weekRange}
                    </span>
                </div>

                {/* Navigation controls */}
                {isAdmin && (
                    <div className="flex items-center gap-2">

                        {/* just a spacer for alignment */}
                        <div className="w-6" />

                        {/* Today button */}
                        <button
                            onClick={onToday}
                            className="px-4 py-2 res-rounded-lg res-btn-secondary focus:ring-offset-2 focus:ring-offset-gray-900"
                        >
                            Hoy
                        </button>

                        {/* Next week */}
                        <button
                            onClick={() => onNavigate('next')}
                            disabled={!canNavigateNext}
                            className={`
              p-2 res-rounded-lg res-transition-fast focus:outline-none focus:ring-2 focus:ring-blue-500
              ${canNavigateNext
                                    ? 'res-bg-secondary hover:res-bg-tertiary res-text-secondary hover:res-text-primary'
                                    : 'res-bg-secondary res-text-muted cursor-not-allowed opacity-50'
                                }
            `}
                            aria-label="Siguiente semana"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
