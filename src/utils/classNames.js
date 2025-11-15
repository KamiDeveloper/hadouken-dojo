/**
 * Utility para combinar class names condicionales
 * Reemplaza múltiples implementaciones de cn() en componentes
 * 
 * @param {...(string|boolean|undefined|null)} classes - Classes a combinar
 * @returns {string} - String de classes combinadas
 * 
 * @example
 * cn('base-class', condition && 'conditional-class', 'another-class')
 * // 'base-class conditional-class another-class'
 */
export function cn(...classes) {
    return classes.filter(Boolean).join(' ');
}
