


export const throttle = (func, delay) => {
    let lastCall = 0
    return (...args) => {
        const now = Date.now()
        if (now - lastCall >= delay) {
            lastCall = now
            func(...args)
        }
    }
}