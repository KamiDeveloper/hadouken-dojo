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
}) {
    // Formatear rango de semana
    const weekRange = weekDates.length > 0
        ? formatWeekRange(weekDates[0], weekDates[weekDates.length - 1])
        : '';

    return (
        <div className="flex-shrink-0 mt-10 border-b border-gray-800 bg-gray-850 p-6">
            <div className='hidden lg:flex absolute top-0 left-0 bg-gray-700/90 h-16 w-full' />
            {/* Top row: Machine name + selected count */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    {/* Color indicator */}
                    <div
                        className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                        style={{ backgroundColor: machineColor }}
                        aria-hidden="true"
                    />

                    <h2 className="text-2xl font-bold text-gray-50">
                        {machineName}
                    </h2>
                </div>

                {/* Selected slots indicator */}
                {selectedCount > 0 && (
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">
                            {selectedCount} {selectedCount === 1 ? 'slot seleccionado' : 'slots seleccionados'}
                        </span>
                        <button
                            onClick={onClearSelection}
                            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
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
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-lg font-medium text-gray-300">
                        {weekRange}
                    </span>
                </div>

                {/* Navigation controls */}
                <div className="flex items-center gap-2">
                    {/* Previous week */}
                    <button
                        onClick={() => onNavigate('prev')}
                        disabled={!canNavigatePrev}
                        className={`
              p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500
              ${canNavigatePrev
                                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-gray-100'
                                : 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                            }
            `}
                        aria-label="Semana anterior"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>

                    {/* Today button */}
                    <button
                        onClick={onToday}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                        Hoy
                    </button>

                    {/* Next week */}
                    <button
                        onClick={() => onNavigate('next')}
                        disabled={!canNavigateNext}
                        className={`
              p-2 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500
              ${canNavigateNext
                                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-gray-100'
                                : 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                            }
            `}
                        aria-label="Siguiente semana"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
