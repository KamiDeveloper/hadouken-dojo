import { useState } from 'react';

/**
 * CategoryTab - Tab de categoría con estilo radio-button
 * 
 * @component
 * @param {Object} props
 * @param {Object} props.category - Objeto de categoría { id, name, description, icon, active, order }
 * @param {boolean} props.isActive - Si esta categoría está actualmente activa
 * @param {function} props.onClick - Callback cuando se hace click
 * @param {function} props.onHover - Callback cuando se hace hover (para prefetch)
 * 
 * @example
 * <CategoryTab
 *   category={{ id: 'piu', name: 'Pump It Up', icon: '/assets/images/piu-logo.png' }}
 *   isActive={true}
 *   onClick={() => {}}
 *   onHover={() => {}}
 * />
 */
export default function CategoryTab({ category, isActive, onClick, onHover }) {
    const [imageError, setImageError] = useState(false);

    const handleMouseEnter = () => {
        if (onHover) {
            onHover();
        }
    };

    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <button
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            className={`
        w-full flex items-center gap-4 p-4 rounded-lg
        transition-all duration-150 ease-out
        border-l-[3px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800
        ${isActive
                    ? 'bg-gray-700 border-blue-500 shadow-lg shadow-blue-500/20'
                    : 'bg-transparent border-transparent hover:bg-gray-700/50'
                }
      `}
            aria-pressed={isActive}
            aria-label={`Categoría ${category.name}`}
        >
            {/* Icon */}
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                {!imageError && category.icon ? (
                    <img
                        src={category.icon}
                        alt={`${category.name} logo`}
                        className="w-full h-full object-contain"
                        onError={handleImageError}
                    />
                ) : (
                    // Fallback si no hay imagen o falló la carga
                    <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-300">
                            {category.name.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 text-left">
                <h3
                    className={`
            text-base font-semibold transition-colors
            ${isActive ? 'text-gray-50' : 'text-gray-400'}
          `}
                >
                    {category.name}
                </h3>
                {category.description && (
                    <p
                        className={`
              text-xs mt-0.5 transition-colors
              ${isActive ? 'text-gray-300' : 'text-gray-500'}
            `}
                    >
                        {category.description}
                    </p>
                )}
            </div>

            {/* Active indicator (optional visual cue) */}
            {isActive && (
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            )}
        </button>
    );
}
