import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

// Hooks personalizados
import { useRankingPlayers } from '../hooks/ranking/useRankingPlayers';
import { useRankingMatches } from '../hooks/ranking/useRankingMatches';

// Servicios
import { rankingService } from '../services/ranking/rankingService';

// Componentes
import LiveMatchBanner from './ranking-components/LiveMatchBanner';
import Podium from './ranking-components/Podium';
import LadderItem, { ladderContainerVariants, ladderItemVariants } from './ranking-components/LadderItem';
import AdminPanel from './ranking-components/AdminPanel';
import HorizonLight from '../components/ui/HorizonLight';

/**
 * Componente principal del sistema de Ranking
 * Orquesta todos los componentes y pasa los datos obtenidos de los hooks
 */
const Ranking = () => {
    const { user: currentUser } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);

    // Custom hooks para manejar datos
    const {
        players,
        loading,
        createPlayer,
        createPlayersBulk,
        deletePlayer
    } = useRankingPlayers();

    const {
        matches,
        liveMatches,
        scheduledMatches,
        completedMatches,
        createMatch,
        updateMatchScore
    } = useRankingMatches();

    // Check admin role
    useEffect(() => {
        setIsAdmin(currentUser?.role === 'admin');
    }, [currentUser]);

    /**
     * Maneja la creación de un match
     */
    const handleCreateMatch = async (matchData) => {
        await createMatch(matchData, players);
    };

    /**
     * Maneja la actualización del score y finalización del match
     */
    const handleUpdateMatchScore = async (matchId, newScoreChallenger, newScoreDefender, newStatus) => {
        await updateMatchScore(matchId, newScoreChallenger, newScoreDefender, newStatus);

        // Si el match se completa, manejar la actualización de rankings
        if (newStatus === 'COMPLETED') {
            const match = matches.find(m => m.id === matchId);
            await rankingService.handleMatchCompletion(matchId, match, newScoreChallenger, newScoreDefender);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen tournament-bg-main flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 tournament-border-blue mx-auto mb-4"></div>
                    <p className="tournament-text-secondary">Cargando ranking...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mt-10 min-h-screen tournament-bg-main tournament-text-primary font-['Rajdhani'] pb-20 overflow-x-hidden">
            {/* Background Elements */}
            <div
                className="absolute left-0 top-0 pointer-events-none z-0 w-dvw h-[70%] md:h-[60%] overflow-hidden ">
                <HorizonLight color="#DB191E" />
            </div>

            <div className="relative z-10 container mx-auto px-4 pt-24">


                {/* Header */}
                <section id='header'>

                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <div className='ranking-logo flex justify-center mb-4'>
                            <img src="/assets/images/ranking/logos/ranking-t8-logo.webp" alt="ranking logo" className='h-30 md:h-40 cursor-not-allowed pointer-events-none opacity-95' />
                        </div>
                        <div className="text-4xl md:text-6xl font-bold uppercase font-tarrget-italic my-4 opacity-95 [text-shadow:-1px_-1px_0_#000,1px_-1px_0_#000,-1px_1px_0_#000,1px_1px_0_#000]">
                            God of Destruction Infinite
                        </div>


                    </motion.div>
                </section>

                {/* Live Match Banner */}
                <AnimatePresence>
                    {liveMatches.length > 0 && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mb-16 mt-40 md:mt-40"
                        >
                            {liveMatches.map(match => (
                                <LiveMatchBanner key={match.id} match={match} players={players} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Podium */}
                <div className="mb-20">
                    <Podium players={players.slice(0, 3)} />
                </div>

                {/* Ladder List */}
                <div className="max-w-5xl mx-auto">
                    {/* Header - Stealth Style */}
                    <div className="flex justify-between items-end mb-6 pb-3 border-b border-white/[0.06]">
                        <h2 className="text-3xl md:text-4xl font-bold uppercase flex items-center gap-3 font-['Rajdhani']">
                            <span className="w-1 h-8 bg-gradient-to-b from-[var(--color-medium-red)] to-transparent block rounded-full"></span>
                            <span className="text-white/80">Players</span>
                        </h2>
                        <span className="text-gray-600 font-['Inter'] text-xs md:text-sm tracking-wide">
                            Total: <span className="text-gray-400">{players.length}</span>
                        </span>
                    </div>

                    {/* Ladder Container with Staggered Animation */}
                    <motion.div
                        variants={ladderContainerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.1 }}
                        className="rounded-xl overflow-hidden bg-black/20 backdrop-blur-sm border border-white/[0.03]"
                    >
                        {players.slice(3).map((player, index) => (
                            <LadderItem key={player.id} player={player} rank={index + 4} />
                        ))}
                    </motion.div>
                </div>

                {/* Admin Panel Toggle */}
                {isAdmin && (
                    <div className="fixed bottom-8 right-8 z-50">
                        <button
                            onClick={() => setShowAdminPanel(!showAdminPanel)}
                            className="tournament-btn-red p-4 rounded-full shadow-2xl hover:scale-110 border-2 tournament-border-red tournament-glow-red"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Admin Panel Modal */}
                <AdminPanel
                    showAdminPanel={showAdminPanel}
                    setShowAdminPanel={setShowAdminPanel}
                    players={players}
                    liveMatches={liveMatches}
                    scheduledMatches={scheduledMatches}
                    onCreateMatch={handleCreateMatch}
                    onUpdateMatchScore={handleUpdateMatchScore}
                    onCreatePlayer={createPlayer}
                    onCreatePlayersBulk={createPlayersBulk}
                    onDeletePlayer={deletePlayer}
                />
            </div>
        </div>
    );
};

export default Ranking;
