import { motion } from 'framer-motion';
import { rankingService } from '../../services/ranking/rankingService';

const DEFAULT_AVATAR = rankingService.getDefaultAvatar();

const RANK_CONFIG = {
    1: {
        color: 'var(--rank-gold)',
        glow: 'rgba(255, 215, 0, 0.6)',
        gradient: 'from-yellow-900/40 to-black/90',
        height: '60%'
    },
    2: {
        color: 'var(--rank-silver)',
        glow: 'rgba(192, 192, 192, 0.6)',
        gradient: 'from-gray-800/40 to-black/90',
        height: '45%'
    },
    3: {
        color: 'var(--rank-bronze)',
        glow: 'rgba(205, 127, 50, 0.6)',
        gradient: 'from-orange-900/40 to-black/90',
        height: '32.5%'
    }
};

/**
 * Componente del podio para los top 3 jugadores
 * Refactorizado con estilo Premium Minimalist / Dark Glassmorphism
 */
const Podium = ({ players }) => {
    if (!players || players.length < 3) return null;

    const [first, second, third] = players;

    return (
        <div className="relative w-full max-w-6xl mx-auto h-80 md:h-[420px] flex items-end justify-center gap-2 md:gap-8 px-2 md:px-4 pb-2 md:pb-6 mb-6 md:mb-12 mt-40 md:mt-48">
            {/* Fondo ambiental sutil */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-dark-red/10 to-transparent pointer-events-none blur-3xl" />

            {/* 2nd Place */}
            <PodiumStep 
                player={second} 
                rank={2} 
                delay={0.2} 
            />

            {/* 1st Place */}
            <PodiumStep 
                player={first} 
                rank={1} 
                delay={0} 
                isFirst 
            />

            {/* 3rd Place */}
            <PodiumStep 
                player={third} 
                rank={3} 
                delay={0.4} 
            />
        </div>
    );
};

/**
 * Componente individual de cada posición del podio
 */
const PodiumStep = ({ player, rank, delay, isFirst }) => {
    const winRate = rankingService.calculateWinRate(player?.stats?.wins || 0, player?.stats?.losses || 0);
    const config = RANK_CONFIG[rank];

    return (
        <motion.div
            className={`relative flex flex-col items-center justify-end w-1/3 max-w-[200px] h-full ${isFirst ? 'z-20' : 'z-10'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay }}
        >
            {/* Avatar & Info Container - Flota sobre el pilar */}
            <motion.div
                className="absolute w-full flex flex-col items-center z-30"
                style={{ bottom: config.height }}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: delay + 0.4, duration: 0.8, type: "spring", bounce: 0.4 }}
            >
                {/* Crown for 1st place */}
                {/*{isFirst && (
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: delay + 0.8, type: "spring" }}
                        className="mb-3 text-4xl filter drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="-2 -4 24 24"><path fill="#FFD700" d="M2.776 5.106L3.648 11h12.736l.867-5.98l-3.493 3.02l-3.755-4.827l-3.909 4.811zm10.038-1.537l-.078.067l.141.014l1.167 1.499l1.437-1.242l.14.014l-.062-.082l2.413-2.086a1 1 0 0 1 1.643.9L18.115 13H1.922L.399 2.7a1 1 0 0 1 1.65-.898L4.35 3.827l-.05.06l.109-.008l1.444 1.27l1.212-1.493l.109-.009l-.06-.052L9.245.976a1 1 0 0 1 1.565.017zM2 14h16v1a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z"/></svg>
                    </motion.div>
                )}*/}

                {/* Avatar con Glow Premium */}
                <div className="relative group mb-4">
                    {/* Glow effect behind */}
                    <div
                        className="absolute inset-0 rounded-full blur-xl transition-opacity duration-700 opacity-40 group-hover:opacity-70"
                        style={{ backgroundColor: config.color }}
                    />
                    
                    {/* Avatar Container */}
                    <div
                        className="relative w-20 h-20 md:w-28 md:h-28 rounded-full p-[3px] bg-black/80 backdrop-blur-sm overflow-hidden transition-transform duration-300 group-hover:scale-105"
                        style={{ 
                            boxShadow: `0 0 0 1px ${config.color}40, 0 10px 20px -5px black` 
                        }}
                    >
                        <div className="w-full h-full rounded-full overflow-hidden border border-white/10">
                            <img
                                src={player?.avatarUrl || DEFAULT_AVATAR}
                                alt={player?.nickname}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Rank Badge flotante */}
                    <div
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full flex items-center justify-center font-['Rajdhani'] font-bold text-black text-sm shadow-lg border border-white/20"
                        style={{ 
                            backgroundColor: config.color,
                            boxShadow: `0 4px 10px -2px ${config.color}60`
                        }}
                    >
                        #{rank}
                    </div>
                </div>

                {/* Player Info */}
                <div className="text-center w-full px-1">
                    <h3 className="font-['Rajdhani'] font-bold text-xl md:text-2xl text-white tracking-wide truncate drop-shadow-md">
                        {player?.nickname}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-400 font-['Inter'] uppercase tracking-wider mb-1">
                        {player?.mainCharacter || 'Unknown'}
                    </p>
                    
                    {/* Win Rate Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 backdrop-blur-md">
                        <div className={`w-1.5 h-1.5 rounded-full ${winRate >= 50 ? 'bg-green-500' : 'bg-red-500'} shadow-[0_0_5px_currentColor]`} />
                        <span className="text-xs font-mono text-gray-300 font-semibold">
                            {winRate}% WR
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Pillar - Glassmorphism Dark */}
            <motion.div
                className="w-full rounded-t-2xl relative overflow-hidden backdrop-blur-md border-t border-x border-white/5"
                style={{
                    background: `linear-gradient(to bottom, rgba(20,20,20,0.8), rgba(0,0,0,0.95))`,
                    boxShadow: `0 -20px 40px -10px ${config.color}10, inset 0 1px 0 0 ${config.color}40`
                }}
                initial={{ height: "0%" }}
                animate={{ height: config.height }}
                transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
            >
                 {/* Top Light Edge */}
                <div
                    className="absolute top-0 inset-x-0 h-px opacity-70"
                    style={{
                        background: `linear-gradient(90deg, transparent, ${config.color}, transparent)`,
                        boxShadow: `0 0 15px 1px ${config.color}`
                    }}
                />

                {/* Inner Gradient Tint */}
                <div className={`absolute inset-0 bg-linear-to-b ${config.gradient} opacity-20`} />

                {/* Big Rank Number Background */}
                <div className="absolute bottom-0 w-full flex justify-center overflow-hidden pointer-events-none">
                    <span
                        className="text-[6rem] md:text-[10rem] font-['Tarrget'] font-bold leading-none select-none"
                        style={{
                            color: config.color,
                            opacity: 0.07,
                            transform: 'translateY(15%)',
                            textShadow: `0 0 30px ${config.color}`
                        }}
                    >
                        {rank}
                    </span>
                </div>

                {/* Tech Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                        backgroundSize: '30px 30px'
                    }}
                />
                
                {/* Vertical Light Beam (Subtle) */}
                <div className="absolute inset-0 bg-linear-to-t from-transparent via-white/2 to-transparent w-1/2 mx-auto blur-xl" />
            </motion.div>
        </motion.div>
    );
};

export default Podium;
