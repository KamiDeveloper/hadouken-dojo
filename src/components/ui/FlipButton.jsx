import { motion, useReducedMotion } from 'framer-motion';
import { useIsMobile } from '../../context/ResponsiveContext';
import { cn } from '../../utils/classNames';

const DEFAULT_SPAN_CLASS_NAME =
    'absolute inset-0 flex items-center justify-center rounded-lg';

/**
 * FlipButton Component
 * A button component with a flip animation effect
 * 
 * @param {Object} props - Component props
 * @param {string} props.frontText - Text to display on front
 * @param {string|JSX.Element} props.backText - Text, SVG, or image element to display on back
 * @param {Object} props.transition - Framer Motion transition configuration
 * @param {string} props.className - Additional classes for the button
 * @param {string} props.frontClassName - Additional classes for front span
 * @param {string} props.backClassName - Additional classes for back span
 * @param {string} props.from - Flip direction: 'top' | 'bottom' | 'left' | 'right'
 * @param {Object} props.restProps - Additional HTML button attributes
 * @returns {JSX.Element} - The FlipButton component
 */
const FlipButton = ({
    frontText,
    backText,
    transition = { type: 'spring', stiffness: 280, damping: 20 },
    className,
    frontClassName,
    backClassName,
    from = 'top',
    ...props
}) => {
    const shouldReduceMotion = useReducedMotion(); // ✅ Detecta preferencias
    const isMobile = useIsMobile(); // ✅ Hook centralizado

    const isVertical = from === 'top' || from === 'bottom';
    const rotateAxis = isVertical ? 'rotateX' : 'rotateY';
    const frontOffset = from === 'top' || from === 'left' ? '50%' : '-50%';
    const backOffset = from === 'top' || from === 'left' ? '-50%' : '50%';

    // ✅ Simplificar transición en móvil o con reducedMotion
    const optimizedTransition = shouldReduceMotion || isMobile
        ? { duration: 0.2 }
        : transition;

    /**
     * Build animation variant object
     * @param {number} opacity - Opacity value
     * @param {number} rotation - Rotation value
     * @param {string|null} offset - Offset value (y or x)
     * @returns {Object} - Variant object
     */
    const buildVariant = (opacity, rotation, offset = null) => ({
        opacity,
        [rotateAxis]: rotation,
        ...(isVertical && offset !== null ? { y: offset } : {}),
        ...(!isVertical && offset !== null ? { x: offset } : {}),
    });

    const frontVariants = {
        initial: buildVariant(1, 0, '0%'),
        hover: buildVariant(0, 90, frontOffset),
    };

    const backVariants = {
        initial: buildVariant(0, 90, backOffset),
        hover: buildVariant(1, 0, '0%'),
    };

    return (
        <motion.button
            data-slot="flip-button"
            initial="initial"
            whileHover={isMobile ? undefined : "hover"} // ✅ No hover en móvil
            whileTap={{ scale: 0.95 }}
            className={cn(
                'relative inline-block h-10 px-4 py-2 text-sm font-medium cursor-pointer perspective-[1000px] focus:outline-none',
                className,
            )}
            style={{
                willChange: 'transform', // ✅ GPU hint
                transform: 'translateZ(0)', // ✅ GPU acceleration
            }}
            {...props}
        >
            <motion.span
                data-slot="flip-button-front"
                variants={frontVariants}
                transition={optimizedTransition}
                className={cn(
                    DEFAULT_SPAN_CLASS_NAME,
                    'bg-muted text-black dark:text-white',
                    frontClassName,
                )}
                style={{
                    willChange: 'transform, opacity', // ✅ GPU hint
                    backfaceVisibility: 'hidden',
                }}
            >
                {frontText}
            </motion.span>
            <motion.span
                data-slot="flip-button-back"
                variants={backVariants}
                transition={optimizedTransition}
                className={cn(
                    DEFAULT_SPAN_CLASS_NAME,
                    'bg-primary text-primary-foreground',
                    backClassName,
                )}
                style={{
                    willChange: 'transform, opacity', // ✅ GPU hint
                    backfaceVisibility: 'hidden',
                }}
            >
                {typeof backText === 'string' ? backText : backText}
            </motion.span>
            <span className="invisible">{frontText}</span>
        </motion.button>
    );
};

export { FlipButton };
