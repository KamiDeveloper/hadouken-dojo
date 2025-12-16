import { motion } from 'framer-motion';
import { rankingService } from '../../services/ranking/rankingService';

const DEFAULT_AVATAR = rankingService.getDefaultAvatar();

/**
 * Componente cinematográfico que muestra el banner de un match en vivo
 * Estilo: High-Stakes Gaming - Dramático y de altas apuestas
 * 
 * @param {Object} props
 * @param {Object} props.match - Datos del match
 * @param {Array} props.players - Lista de todos los jugadores
 */
const LiveMatchBanner = ({ match, players }) => {
    const challenger = players.find(p => p.id === match.challengerId);
    const defender = players.find(p => p.id === match.defenderId);

    // Imágenes de personajes (usar avatarUrl por ahora, idealmente serían renders grandes)
    const challengerImage = challenger?.avatarUrl || DEFAULT_AVATAR;
    const defenderImage = defender?.avatarUrl || DEFAULT_AVATAR;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-6xl mx-auto aspect-[21/9] md:aspect-[21/7] rounded-2xl overflow-hidden bg-[var(--color-black)]"
        >
            {/* ═══════════════════════════════════════════════════════════════
                CAPA 1: IMÁGENES DE FONDO DE LOS PERSONAJES
            ═══════════════════════════════════════════════════════════════ */}
            
            {/* Challenger Background Image - Left Side */}
            <motion.div
                initial={{ scale: 1.15, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="absolute left-0 top-0 w-1/2 h-full z-0"
            >
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <img
                        src={challengerImage}
                        alt={challenger?.nickname}
                        className="w-[200%] h-[200%] object-cover object-center opacity-40 blur-[2px]"
                    />
                </div>
            </motion.div>

            {/* Defender Background Image - Right Side */}
            <motion.div
                initial={{ scale: 1.15, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }}
                className="absolute right-0 top-0 w-1/2 h-full z-0"
            >
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <img
                        src={defenderImage}
                        alt={defender?.nickname}
                        className="w-[200%] h-[200%] object-cover object-center opacity-40 blur-[2px]"
                    />
                </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════════════════════
                CAPA 2: GRADIENTES DRAMÁTICOS (ROJO vs LUZ FRÍA)
            ═══════════════════════════════════════════════════════════════ */}
            
            {/* Left Gradient Overlay - Dark Red Aggressive */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="absolute left-0 top-0 w-2/3 h-full z-10 pointer-events-none"
                style={{
                    background: 'linear-gradient(to right, rgb(43, 18, 18) 0%, rgba(43, 18, 18, 0.8) 30%, rgba(43, 18, 18, 0.4) 60%, transparent 100%)'
                }}
            />

            {/* Right Gradient Overlay - Cold Light Contrast */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="absolute right-0 top-0 w-2/3 h-full z-10 pointer-events-none"
                style={{
                    background: 'linear-gradient(to left, rgba(239, 239, 239, 0.08) 0%, rgba(239, 239, 239, 0.04) 30%, rgba(239, 239, 239, 0.01) 60%, transparent 100%)'
                }}
            />

            {/* Center Vignette - Fusión dramática */}
            <div 
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(1, 1, 1, 0.3) 70%, rgba(1, 1, 1, 0.7) 100%)'
                }}
            />

            {/* Vertical Divider Line - Zona de conflicto */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent z-10" />

            {/* ═══════════════════════════════════════════════════════════════
                CAPA 3: CONTENIDO PRINCIPAL
            ═══════════════════════════════════════════════════════════════ */}
            <div className="relative z-20 h-full flex items-stretch">
                
                {/* ─────────── CHALLENGER (Left) ─────────── */}
                <div className="flex-1 flex flex-col justify-center items-center md:items-start px-4 md:px-12">
                    {/* Label */}
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-[var(--color-medium-red)] font-bold mb-2"
                    >
                        Retador
                    </motion.span>

                    {/* Avatar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
                        className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-[var(--color-medium-red)]/50 shadow-[0_0_30px_rgba(211,47,17,0.3)] mb-3"
                    >
                        <img src={challengerImage} alt={challenger?.nickname} className="w-full h-full object-cover" />
                    </motion.div>

                    {/* Name */}
                    <motion.h3
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="font-['Rajdhani'] font-bold text-xl md:text-3xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] text-center md:text-left"
                    >
                        {challenger?.nickname || 'Unknown'}
                    </motion.h3>

                    {/* Rank & Character */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-xs md:text-sm text-gray-400 font-['Inter'] text-center md:text-left"
                    >
                        <span className="text-[var(--color-medium-red)]">#{challenger?.currentRank}</span>
                        <span className="mx-2 text-gray-600">•</span>
                        <span>{challenger?.mainCharacter}</span>
                    </motion.div>
                </div>

                {/* ─────────── CENTER (Score) ─────────── */}
                <div className="flex flex-col items-center justify-center px-4 md:px-8 min-w-[120px] md:min-w-[200px]">
                    
                    {/* LIVE Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                        className="mb-3 md:mb-4"
                    >
                        <motion.div
                            animate={{ 
                                boxShadow: [
                                    '0 0 10px rgba(211,47,17,0.5)',
                                    '0 0 25px rgba(211,47,17,0.8)',
                                    '0 0 10px rgba(211,47,17,0.5)'
                                ]
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="bg-[var(--color-medium-red)] text-white text-[10px] md:text-xs font-bold px-3 md:px-5 py-1 md:py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2"
                        >
                            <motion.span
                                animate={{ opacity: [1, 0.3, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full"
                            />
                            En Vivo
                        </motion.div>
                    </motion.div>

                    {/* MASSIVE Score */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.8, type: "spring", stiffness: 100 }}
                        className="flex items-center gap-2 md:gap-4"
                    >
                        <motion.span
                            animate={{ 
                                textShadow: [
                                    '0 0 20px rgba(211,47,17,0.3)',
                                    '0 0 40px rgba(211,47,17,0.5)',
                                    '0 0 20px rgba(211,47,17,0.3)'
                                ]
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="font-['Rajdhani'] font-black text-5xl md:text-8xl text-white tabular-nums"
                        >
                            {match.score?.challenger || 0}
                        </motion.span>
                        
                        <span className="text-[var(--color-light-red)] text-3xl md:text-5xl font-black">:</span>
                        
                        <motion.span
                            animate={{ 
                                textShadow: [
                                    '0 0 20px rgba(239,239,239,0.2)',
                                    '0 0 40px rgba(239,239,239,0.4)',
                                    '0 0 20px rgba(239,239,239,0.2)'
                                ]
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                            className="font-['Rajdhani'] font-black text-5xl md:text-8xl text-white tabular-nums"
                        >
                            {match.score?.defender || 0}
                        </motion.span>
                    </motion.div>

                    {/* Format */}
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-2 md:mt-4 text-[10px] md:text-xs text-gray-500 uppercase tracking-[0.2em] font-['Inter']"
                    >
                        {match.format}
                    </motion.span>
                </div>

                {/* ─────────── DEFENDER (Right) ─────────── */}
                <div className="flex-1 flex flex-col justify-center items-center md:items-end px-4 md:px-12">
                    {/* Label */}
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gray-400 font-bold mb-2"
                    >
                        Defensor
                    </motion.span>

                    {/* Avatar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
                        className="w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-[0_0_30px_rgba(239,239,239,0.15)] mb-3"
                    >
                        <img src={defenderImage} alt={defender?.nickname} className="w-full h-full object-cover" />
                    </motion.div>

                    {/* Name */}
                    <motion.h3
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="font-['Rajdhani'] font-bold text-xl md:text-3xl text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] text-center md:text-right"
                    >
                        {defender?.nickname || 'Unknown'}
                    </motion.h3>

                    {/* Rank & Character */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-xs md:text-sm text-gray-400 font-['Inter'] text-center md:text-right"
                    >
                        <span>{defender?.mainCharacter}</span>
                        <span className="mx-2 text-gray-600">•</span>
                        <span className="text-gray-300">#{defender?.currentRank}</span>
                    </motion.div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                CAPA 4: DETALLES DECORATIVOS
            ═══════════════════════════════════════════════════════════════ */}
            
            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-dark-red)] via-[var(--color-medium-red)] to-transparent z-30" />
            
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-20 h-1 bg-gradient-to-r from-[var(--color-medium-red)] to-transparent z-30" />
            <div className="absolute top-0 left-0 w-1 h-20 bg-gradient-to-b from-[var(--color-medium-red)] to-transparent z-30" />
            
            <div className="absolute top-0 right-0 w-20 h-1 bg-gradient-to-l from-white/20 to-transparent z-30" />
            <div className="absolute top-0 right-0 w-1 h-20 bg-gradient-to-b from-white/20 to-transparent z-30" />
        </motion.div>
    );
};

export default LiveMatchBanner;
