import { motion } from 'framer-motion';
import { rankingService } from '../../services/ranking/rankingService';

const DEFAULT_AVATAR = rankingService.getDefaultAvatar();

/**
 * Variantes de animación para el efecto staggered
 */
export const ladderContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1
        }
    }
};

export const ladderItemVariants = {
    hidden: { opacity: 0, x: -15 },
    visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
    }
};

/**
 * Componente para mostrar un jugador en el ladder
 * Estilo: Stealth Luxury - Ultra minimalista, oscuro y elegante
 * 
 * @param {Object} props
 * @param {Object} props.player - Datos del jugador
 * @param {number} props.rank - Posición en el ranking
 * @param {boolean} props.isOnline - Estado online del jugador (opcional)
 */
const LadderItem = ({ player, rank, isOnline = false }) => {
    const winRate = rankingService.calculateWinRate(player.stats?.wins || 0, player.stats?.losses || 0);
    const wins = player.stats?.wins || 0;
    const losses = player.stats?.losses || 0;

    const TrendIcon = () => {
        if (player.trend === 'UP') {
            return (
                <div className="flex items-center justify-center w-6 h-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                </div>
            );
        } else if (player.trend === 'DOWN') {
            return (
                <div className="flex items-center justify-center w-6 h-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[var(--color-medium-red)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            );
        }
        return (
            <div className="flex items-center justify-center w-6 h-6">
                <span className="text-gray-600 text-sm">—</span>
            </div>
        );
    };

    return (
        <motion.div
            variants={ladderItemVariants}
            whileHover={{ x: 3, backgroundColor: 'rgba(43, 18, 18, 0.25)' }}
            transition={{ duration: 0.2 }}
            className="group grid grid-cols-[3rem_3rem_1fr_auto] md:grid-cols-[4rem_3.5rem_1fr_12rem_auto] items-center gap-3 md:gap-5 py-4 px-3 md:px-5 border-b border-white/[0.04] bg-transparent cursor-pointer"
        >
            {/* Rank Number */}
            <div className="flex items-center justify-center">
                <span className="font-['Rajdhani'] font-semibold text-xl md:text-2xl text-gray-600 group-hover:text-gray-400 transition-colors tabular-nums">
                    {rank}
                </span>
            </div>

            {/* Avatar with Online Indicator */}
            <div className="relative flex-shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-black/50 border border-white/10 group-hover:border-white/20 transition-all">
                    <img 
                        src={player.avatarUrl || DEFAULT_AVATAR} 
                        alt={player.nickname} 
                        className="w-full h-full object-cover"
                    />
                </div>
                {/* Online Indicator - Pulsating Red Dot */}
                {isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[var(--color-light-red)] border-2 border-[var(--color-black)] shadow-[0_0_8px_var(--color-light-red)]">
                        <div className="absolute inset-0 rounded-full bg-[var(--color-light-red)] animate-ping opacity-75" />
                    </div>
                )}
            </div>

            {/* Player Info */}
            <div className="min-w-0">
                <h4 className="font-['Rajdhani'] font-bold text-base md:text-lg text-white/90 truncate group-hover:text-white transition-colors">
                    {player.nickname}
                </h4>
                <p className="text-xs md:text-sm text-gray-500 truncate font-['Inter']">
                    {player.mainCharacter || 'Unknown'}
                </p>
            </div>

            {/* Stats - Hidden on Mobile */}
            <div className="hidden md:flex items-center gap-4 text-sm font-['Inter']">
                <div className="flex items-center gap-1.5">
                    <span className="text-emerald-600 font-semibold">{wins}</span>
                    <span className="text-gray-600 text-xs">W</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-1.5">
                    <span className="text-[var(--color-medium-red)] font-semibold">{losses}</span>
                    <span className="text-gray-600 text-xs">L</span>
                </div>
                <div className="w-px h-3 bg-white/10" />
                <div className="flex items-center gap-1.5">
                    <span className={`font-bold ${winRate >= 50 ? 'text-gray-300' : 'text-gray-500'}`}>{winRate}%</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-3">
                <TrendIcon />
                <button className="hidden md:block opacity-0 group-hover:opacity-100 transition-all duration-300 text-[10px] uppercase tracking-[0.15em] text-gray-400 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1.5 rounded-md hover:bg-white/5 font-['Inter'] font-medium">
                    Ver Perfil
                </button>
            </div>
        </motion.div>
    );
};

export default LadderItem;
