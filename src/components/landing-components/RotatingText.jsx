import * as React from 'react';
import {
    AnimatePresence,
    motion,
    useReducedMotion,
} from 'motion/react';

function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}

function RotatingText({
    text,
    y = -50,
    duration = 2000,
    transition = { duration: 0.3, ease: 'easeOut' },
    containerClassName,
    ...props
}) {
    const [index, setIndex] = React.useState(0);
    const shouldReduceMotion = useReducedMotion(); // ✅ Detecta preferencias de accesibilidad

    React.useEffect(() => {
        if (!Array.isArray(text)) return;
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % text.length);
        }, duration);
        return () => clearInterval(interval);
    }, [text, duration]);

    const currentText = Array.isArray(text) ? text[index] : text;

    // ✅ Reducir animaciones si el usuario lo prefiere o en móvil lento
    const optimizedTransition = shouldReduceMotion
        ? { duration: 0.1 }
        : transition;

    return (
        <div className={cn('overflow-hidden py-1 uppercase', containerClassName)}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentText}
                    transition={optimizedTransition}
                    initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -y }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: shouldReduceMotion ? 0 : y }}
                    style={{
                        willChange: 'transform, opacity', // ✅ GPU hint
                    }}
                    {...props}
                >
                    {currentText}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

export default RotatingText;