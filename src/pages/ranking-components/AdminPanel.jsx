import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { rankingService } from '../../services/ranking/rankingService';

const DEFAULT_AVATAR = rankingService.getDefaultAvatar();

/**
 * Panel de administración para gestionar jugadores y matches
 * @param {Object} props
 * @param {boolean} props.showAdminPanel - Si el panel está visible
 * @param {Function} props.setShowAdminPanel - Función para mostrar/ocultar el panel
 * @param {Array} props.players - Lista de jugadores
 * @param {Array} props.liveMatches - Matches en vivo
 * @param {Array} props.scheduledMatches - Matches programados
 * @param {Function} props.onCreateMatch - Función para crear un match
 * @param {Function} props.onUpdateMatchScore - Función para actualizar score
 * @param {Function} props.onCreatePlayer - Función para crear jugador
 * @param {Function} props.onCreatePlayersBulk - Función para crear jugadores en lote
 * @param {Function} props.onDeletePlayer - Función para eliminar jugador
 */
const AdminPanel = ({
    showAdminPanel,
    setShowAdminPanel,
    players,
    liveMatches,
    scheduledMatches,
    onCreateMatch,
    onUpdateMatchScore,
    onCreatePlayer,
    onCreatePlayersBulk,
    onDeletePlayer
}) => {
    const [activeTab, setActiveTab] = useState('matches');

    // Match Creation States
    const [challengerId, setChallengerId] = useState('');
    const [defenderId, setDefenderId] = useState('');
    const [matchFormat, setMatchFormat] = useState('BO7');
    const [scheduledDate, setScheduledDate] = useState('');

    // Player Creation States
    const [newPlayer, setNewPlayer] = useState({
        nickname: '',
        email: '',
        mainCharacter: '',
        avatarFile: null,
        avatarPreview: null
    });

    // Bulk Upload States
    const [bulkJsonFile, setBulkJsonFile] = useState(null);
    const fileInputRef = useRef(null);
    const bulkInputRef = useRef(null);

    const handleCreateMatch = async (e) => {
        e.preventDefault();
        try {
            await onCreateMatch({
                challengerId,
                defenderId,
                format: matchFormat,
                scheduledDate
            });
            // Reset form
            setChallengerId('');
            setDefenderId('');
            setScheduledDate('');
        } catch (error) {
            // Error already handled in the hook
        }
    };

    const handleCreatePlayer = async (e) => {
        e.preventDefault();
        try {
            await onCreatePlayer(newPlayer);
            // Reset form
            setNewPlayer({
                nickname: '',
                email: '',
                mainCharacter: '',
                avatarFile: null,
                avatarPreview: null
            });
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            // Error already handled in the hook
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                toast.error('Por favor selecciona una imagen');
                return;
            }
            setNewPlayer(prev => ({
                ...prev,
                avatarFile: file,
                avatarPreview: URL.createObjectURL(file)
            }));
        }
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!bulkJsonFile) {
            toast.error('Selecciona un archivo JSON');
            return;
        }

        try {
            const fileText = await bulkJsonFile.text();
            const playersData = JSON.parse(fileText);
            await onCreatePlayersBulk(playersData);
            setBulkJsonFile(null);
            if (bulkInputRef.current) bulkInputRef.current.value = '';
        } catch (error) {
            if (error instanceof SyntaxError) {
                toast.error('Error al parsear el archivo JSON');
            }
            // Other errors already handled in the hook
        }
    };

    const handleDeletePlayer = async (playerId) => {
        if (!window.confirm('¿Eliminar este jugador?')) return;
        try {
            await onDeletePlayer(playerId);
        } catch (error) {
            // Error already handled in the hook
        }
    };

    return (
        <AnimatePresence>
            {showAdminPanel && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowAdminPanel(false)}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full md:w-[550px] bg-gradient-to-br from-[var(--tournament-blue-dark)] via-[var(--tournament-bg-main)] to-[var(--tournament-red-dark)] backdrop-blur-xl border-l-2 tournament-border-blue z-[70] overflow-y-auto shadow-2xl"
                        style={{ boxShadow: '0 0 60px var(--tournament-blue-glow), inset 0 0 40px rgba(107, 30, 35, 0.1)' }}
                    >
                        <div className="sticky top-0 bg-gradient-to-b from-[var(--tournament-blue-dark)] to-[var(--tournament-bg-main)]/95 backdrop-blur-xl border-b-2 tournament-border-red p-6 z-10">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--tournament-blue-medium)] to-[var(--tournament-red-medium)]">Admin Control</h2>
                                <button
                                    onClick={() => setShowAdminPanel(false)}
                                    className="tournament-text-secondary hover:tournament-text-red transition-colors p-2 hover:tournament-bg-red-dark rounded-lg"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setActiveTab('matches')}
                                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'matches'
                                        ? 'bg-gradient-to-r from-[var(--tournament-blue-medium)] to-[var(--tournament-blue-dark)] tournament-text-primary shadow-lg tournament-border-blue border'
                                        : 'tournament-bg-red-dark opacity-20 tournament-text-secondary hover:tournament-bg-red-dark hover:opacity-40 border tournament-border-red'
                                        }`}
                                >
                                    Retos
                                </button>
                                <button
                                    onClick={() => setActiveTab('players')}
                                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'players'
                                        ? 'bg-gradient-to-r from-[var(--tournament-blue-medium)] to-[var(--tournament-blue-dark)] tournament-text-primary shadow-lg tournament-border-blue border'
                                        : 'tournament-bg-red-dark opacity-20 tournament-text-secondary hover:tournament-bg-red-dark hover:opacity-40 border tournament-border-red'
                                        }`}
                                >
                                    Jugadores
                                </button>
                                <button
                                    onClick={() => setActiveTab('bulk')}
                                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'bulk'
                                        ? 'bg-gradient-to-r from-[var(--tournament-blue-medium)] to-[var(--tournament-blue-dark)] tournament-text-primary shadow-lg tournament-border-blue border'
                                        : 'tournament-bg-red-dark opacity-20 tournament-text-secondary hover:tournament-bg-red-dark hover:opacity-40 border tournament-border-red'
                                        }`}
                                >
                                    Lote
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* TAB: MATCHES */}
                            {activeTab === 'matches' && (
                                <MatchesTab
                                    players={players}
                                    challengerId={challengerId}
                                    setChallengerId={setChallengerId}
                                    defenderId={defenderId}
                                    setDefenderId={setDefenderId}
                                    matchFormat={matchFormat}
                                    setMatchFormat={setMatchFormat}
                                    scheduledDate={scheduledDate}
                                    setScheduledDate={setScheduledDate}
                                    onSubmit={handleCreateMatch}
                                    liveMatches={liveMatches}
                                    scheduledMatches={scheduledMatches}
                                    onUpdateScore={onUpdateMatchScore}
                                />
                            )}

                            {/* TAB: PLAYERS */}
                            {activeTab === 'players' && (
                                <PlayersTab
                                    newPlayer={newPlayer}
                                    setNewPlayer={setNewPlayer}
                                    fileInputRef={fileInputRef}
                                    onAvatarChange={handleAvatarChange}
                                    onSubmit={handleCreatePlayer}
                                    players={players}
                                    onDeletePlayer={handleDeletePlayer}
                                />
                            )}

                            {/* TAB: BULK */}
                            {activeTab === 'bulk' && (
                                <BulkTab
                                    bulkJsonFile={bulkJsonFile}
                                    setBulkJsonFile={setBulkJsonFile}
                                    bulkInputRef={bulkInputRef}
                                    onSubmit={handleBulkUpload}
                                />
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// Sub-components for each tab

const MatchesTab = ({
    players,
    challengerId,
    setChallengerId,
    defenderId,
    setDefenderId,
    matchFormat,
    setMatchFormat,
    scheduledDate,
    setScheduledDate,
    onSubmit,
    liveMatches,
    scheduledMatches,
    onUpdateScore
}) => (
    <>
        {/* Create Match */}
        <div className="bg-gradient-to-br from-[var(--tournament-red-dark)]/40 to-[var(--tournament-blue-dark)]/20 p-5 rounded-xl border tournament-border-red shadow-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-[var(--tournament-red-medium)] to-[var(--tournament-red-dark)] block"></span>
                <span className="tournament-text-primary">Crear Reto</span>
            </h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs tournament-text-secondary mb-2 font-semibold">Retador (Rank Inferior)</label>
                    <select
                        value={challengerId}
                        onChange={(e) => setChallengerId(e.target.value)}
                        className="w-full tournament-bg-main border tournament-border-blue rounded-lg p-3 text-sm tournament-text-primary focus:tournament-border-blue focus:outline-none focus:ring-2 focus:ring-[var(--tournament-blue-medium)]/30"
                        required
                    >
                        <option value="">Selecciona Retador</option>
                        {players.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.nickname} - Rank {p.currentRank} ({p.mainCharacter})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs tournament-text-secondary mb-2 font-semibold">Defensor (Rank Superior)</label>
                    <select
                        value={defenderId}
                        onChange={(e) => setDefenderId(e.target.value)}
                        className="w-full tournament-bg-main border tournament-border-blue rounded-lg p-3 text-sm tournament-text-primary focus:tournament-border-blue focus:outline-none focus:ring-2 focus:ring-[var(--tournament-blue-medium)]/30"
                        required
                    >
                        <option value="">Selecciona Defensor</option>
                        {players.map(p => (
                            <option key={p.id} value={p.id}>
                                {p.nickname} - Rank {p.currentRank} ({p.mainCharacter})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs tournament-text-secondary mb-2 font-semibold">Formato</label>
                    <select
                        value={matchFormat}
                        onChange={(e) => setMatchFormat(e.target.value)}
                        className="w-full tournament-bg-main border tournament-border-blue rounded-lg p-3 text-sm tournament-text-primary focus:tournament-border-blue focus:outline-none focus:ring-2 focus:ring-[var(--tournament-blue-medium)]/30"
                    >
                        <option value="BO3">Best of 3</option>
                        <option value="BO5">Best of 5</option>
                        <option value="BO7">Best of 7</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs tournament-text-secondary mb-2 font-semibold">Fecha Programada (opcional)</label>
                    <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full tournament-bg-main border tournament-border-blue rounded-lg p-3 text-sm tournament-text-primary focus:tournament-border-blue focus:outline-none focus:ring-2 focus:ring-[var(--tournament-blue-medium)]/30"
                    />
                </div>
                <button type="submit" className="tournament-btn-red w-full py-3 rounded-lg shadow-lg">
                    Crear Reto
                </button>
            </form>
        </div>

        {/* Active Matches */}
        <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-[var(--tournament-blue-medium)] to-[var(--tournament-blue-dark)] block"></span>
                <span className="tournament-text-primary">Retos Activos</span>
            </h3>
            {[...liveMatches, ...scheduledMatches].length === 0 ? (
                <div className="text-center tournament-text-muted py-8 text-sm tournament-bg-blue-dark opacity-20 rounded-lg border tournament-border-blue">
                    No hay retos activos
                </div>
            ) : (
                <div className="space-y-4">
                    {[...liveMatches, ...scheduledMatches].map(match => {
                        const p1 = players.find(p => p.id === match.challengerId);
                        const p2 = players.find(p => p.id === match.defenderId);
                        return (
                            <MatchCard
                                key={match.id}
                                match={match}
                                challenger={p1}
                                defender={p2}
                                onUpdateScore={onUpdateScore}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    </>
);

const MatchCard = ({ match, challenger, defender, onUpdateScore }) => (
    <div className="bg-gradient-to-br from-[var(--tournament-red-dark)]/30 to-[var(--tournament-blue-dark)]/20 p-4 rounded-lg border tournament-border-red text-sm shadow-md">
        <div className="flex justify-between mb-3">
            <div className="tournament-text-blue">
                <div className="font-bold tournament-text-primary">{challenger?.nickname || 'Unknown'}</div>
                <div className="text-xs tournament-text-secondary">Rank {challenger?.currentRank}</div>
            </div>
            <span className="tournament-text-muted self-center font-bold">VS</span>
            <div className="tournament-text-red text-right">
                <div className="font-bold tournament-text-primary">{defender?.nickname || 'Unknown'}</div>
                <div className="text-xs tournament-text-secondary">Rank {defender?.currentRank}</div>
            </div>
        </div>
        <div className="flex gap-2 justify-center mb-3">
            <input
                type="number"
                value={match.score?.challenger || 0}
                onChange={(e) => onUpdateScore(match.id, parseInt(e.target.value) || 0, match.score?.defender || 0, match.status)}
                className="w-14 tournament-bg-main text-center border tournament-border-blue rounded-lg py-2 tournament-text-primary focus:tournament-border-blue focus:outline-none"
                min="0"
            />
            <span className="self-center tournament-text-secondary">-</span>
            <input
                type="number"
                value={match.score?.defender || 0}
                onChange={(e) => onUpdateScore(match.id, match.score?.challenger || 0, parseInt(e.target.value) || 0, match.status)}
                className="w-14 tournament-bg-main text-center border tournament-border-blue rounded-lg py-2 tournament-text-primary focus:tournament-border-blue focus:outline-none"
                min="0"
            />
        </div>
        <div className="text-xs text-center tournament-text-muted mb-3 font-semibold">{match.format}</div>
        <div className="flex gap-2">
            {match.status === 'SCHEDULED' && (
                <button
                    onClick={() => onUpdateScore(match.id, match.score?.challenger || 0, match.score?.defender || 0, 'LIVE')}
                    className="flex-1 tournament-bg-blue-dark tournament-text-blue border tournament-border-blue py-2 rounded-lg hover:tournament-bg-blue-dark hover:opacity-30 text-xs font-bold transition-all"
                >
                    INICIAR
                </button>
            )}
            <button
                onClick={() => onUpdateScore(match.id, match.score?.challenger || 0, match.score?.defender || 0, 'COMPLETED')}
                className="flex-1 tournament-bg-red-dark tournament-text-red border tournament-border-red py-2 rounded-lg hover:tournament-bg-red-dark hover:opacity-30 text-xs font-bold transition-all"
            >
                FINALIZAR
            </button>
        </div>
    </div>
);

const PlayersTab = ({
    newPlayer,
    setNewPlayer,
    fileInputRef,
    onAvatarChange,
    onSubmit,
    players,
    onDeletePlayer
}) => (
    <>
        {/* Create Player */}
        <div className="bg-gradient-to-br from-[var(--tournament-blue-dark)]/40 to-[var(--tournament-red-dark)]/20 p-5 rounded-xl border tournament-border-blue shadow-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-[var(--tournament-blue-medium)] to-[var(--tournament-red-medium)] block"></span>
                <span className="tournament-text-primary">Añadir Jugador</span>
            </h3>
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full border-2 tournament-border-blue overflow-hidden tournament-bg-blue-dark">
                            {newPlayer.avatarPreview ? (
                                <img src={newPlayer.avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center tournament-text-muted text-3xl">
                                    👤
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 bg-gradient-to-br from-[var(--tournament-blue-medium)] to-[var(--tournament-blue-dark)] tournament-text-primary p-2 rounded-full hover:from-[var(--tournament-blue-accent)] hover:to-[var(--tournament-blue-medium)] shadow-lg transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={onAvatarChange}
                            className="hidden"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs tournament-text-secondary mb-2 font-semibold">Nickname *</label>
                    <input
                        type="text"
                        value={newPlayer.nickname}
                        onChange={(e) => setNewPlayer(prev => ({ ...prev, nickname: e.target.value }))}
                        className="w-full tournament-bg-main border tournament-border-blue rounded-lg p-3 text-sm tournament-text-primary focus:tournament-border-blue focus:outline-none focus:ring-2 focus:ring-[var(--tournament-blue-medium)]/30"
                        placeholder="VoidWalker"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs tournament-text-secondary mb-2 font-semibold">Email *</label>
                    <input
                        type="email"
                        value={newPlayer.email}
                        onChange={(e) => setNewPlayer(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full tournament-bg-main border tournament-border-blue rounded-lg p-3 text-sm tournament-text-primary focus:tournament-border-blue focus:outline-none focus:ring-2 focus:ring-[var(--tournament-blue-medium)]/30"
                        placeholder="voidwalker@gmail.com"
                        required
                    />
                    <p className="text-xs tournament-text-muted mt-1">Para subir foto de perfil desde /profile</p>
                </div>
                <div>
                    <label className="block text-xs tournament-text-secondary mb-2 font-semibold">Personaje Principal *</label>
                    <input
                        type="text"
                        value={newPlayer.mainCharacter}
                        onChange={(e) => setNewPlayer(prev => ({ ...prev, mainCharacter: e.target.value }))}
                        className="w-full tournament-bg-main border tournament-border-blue rounded-lg p-3 text-sm tournament-text-primary focus:tournament-border-blue focus:outline-none focus:ring-2 focus:ring-[var(--tournament-blue-medium)]/30"
                        placeholder="Kazuya"
                        required
                    />
                </div>
                <button type="submit" className="tournament-btn-blue w-full py-3 rounded-lg shadow-lg">
                    Añadir Jugador
                </button>
            </form>
        </div>

        {/* Players List */}
        <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-[var(--tournament-red-medium)] to-[var(--tournament-red-dark)] block"></span>
                <span className="tournament-text-primary">Jugadores ({players.length})</span>
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-hide">
                {players.map(player => (
                    <div key={player.id} className="bg-gradient-to-r from-[var(--tournament-red-dark)]/30 to-[var(--tournament-blue-dark)]/20 p-3 rounded-lg border tournament-border-red flex items-center gap-3 hover:tournament-border-blue transition-all">
                        <div className="w-10 h-10 rounded-full overflow-hidden tournament-bg-blue-dark flex-shrink-0 border tournament-border-blue">
                            <img src={player.avatarUrl || DEFAULT_AVATAR} alt={player.nickname} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm truncate tournament-text-primary">{player.nickname}</div>
                            <div className="text-xs tournament-text-secondary">Rank {player.currentRank} • {player.mainCharacter}</div>
                        </div>
                        <button
                            onClick={() => onDeletePlayer(player.id)}
                            className="tournament-text-red hover:tournament-text-red flex-shrink-0 p-2 hover:tournament-bg-red-dark rounded-lg transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    </>
);

const BulkTab = ({ bulkJsonFile, setBulkJsonFile, bulkInputRef, onSubmit }) => (
    <div className="bg-gradient-to-br from-[var(--tournament-red-dark)]/40 to-[var(--tournament-blue-dark)]/20 p-5 rounded-xl border tournament-border-red shadow-lg">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-to-b from-[var(--tournament-red-medium)] via-[var(--tournament-blue-medium)] to-[var(--tournament-red-dark)] block"></span>
            <span className="tournament-text-primary">Carga por Lotes (JSON)</span>
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
            <div>
                <label className="block text-sm tournament-text-secondary mb-2 font-semibold">Formato JSON esperado:</label>
                <pre className="tournament-bg-main p-4 rounded-lg text-xs tournament-text-blue overflow-x-auto border tournament-border-blue">
                    {`[
  {
    "nickname": "Player1",
    "email": "player1@example.com",
    "mainCharacter": "Kazuya",
    "avatarUrl": "url_opcional",
    "stats": {
      "wins": 0,
      "losses": 0
    }
  },
  ...
]`}
                </pre>
            </div>
            <div>
                <label className="block text-xs tournament-text-secondary mb-2 font-semibold">Seleccionar archivo JSON</label>
                <input
                    ref={bulkInputRef}
                    type="file"
                    accept=".json"
                    onChange={(e) => setBulkJsonFile(e.target.files?.[0] || null)}
                    className="w-full tournament-bg-main border tournament-border-blue rounded-lg p-3 text-sm tournament-text-primary focus:tournament-border-blue focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-[var(--tournament-blue-medium)] file:to-[var(--tournament-blue-dark)] file:tournament-text-primary file:cursor-pointer hover:file:from-[var(--tournament-blue-accent)] hover:file:to-[var(--tournament-blue-medium)]"
                />
            </div>
            {bulkJsonFile && (
                <div className="text-sm tournament-text-secondary tournament-bg-blue-dark opacity-30 p-3 rounded-lg border tournament-border-blue">
                    Archivo: <span className="tournament-text-primary font-semibold">{bulkJsonFile.name}</span>
                </div>
            )}
            <button type="submit" className="w-full bg-gradient-to-r from-[var(--tournament-red-medium)] via-[var(--tournament-blue-medium)] to-[var(--tournament-red-medium)] tournament-text-primary font-bold py-3 rounded-lg hover:from-[var(--tournament-red-accent)] hover:via-[var(--tournament-blue-accent)] hover:to-[var(--tournament-red-accent)] transition-all shadow-lg">
                Cargar Jugadores
            </button>
        </form>
    </div>
);

export default AdminPanel;
