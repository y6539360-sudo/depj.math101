import { useState, useEffect, useMemo } from 'react';
import defaultGamesData from './games.json';
import PasscodeGate from './components/PasscodeGate.jsx';
import GamePlayer from './components/GamePlayer.jsx';
import GameCard from './components/GameCard.jsx';
import MathCloak from './components/MathCloak.jsx';
import CustomGameModal from './components/CustomGameModal.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import { 
  Search, 
  Plus, 
  Settings, 
  ShieldAlert, 
  Heart, 
  Gamepad2,
  Lock,
  Compass
} from 'lucide-react';

const CATEGORIES = ['All', 'Favorites', 'Retro', 'Arcade', 'Puzzle', 'Action', 'Sports'];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return Boolean(sessionStorage.getItem('arcade_auth_token'));
  });
  const [isCloaked, setIsCloaked] = useState(false);
  const [activeGame, setActiveGame] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('arcade_favorites') || '[]');
    } catch {
      return [];
    }
  });
  const [customGames, setCustomGames] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('arcade_custom_games') || '[]');
    } catch {
      return [];
    }
  });

  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [currentCloakName, setCurrentCloakName] = useState(() => {
    return localStorage.getItem('arcade_cloak_preset') || 'Normal (Arcade 101)';
  });

  // Emergency Panic Key listener (Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCloaked((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save favorites
  useEffect(() => {
    localStorage.setItem('arcade_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save custom games
  useEffect(() => {
    localStorage.setItem('arcade_custom_games', JSON.stringify(customGames));
  }, [customGames]);

  // Merge default games and user custom games
  const allGames = useMemo(() => {
    return [...customGames, ...defaultGamesData];
  }, [customGames]);

  // Filtered games
  const filteredGames = useMemo(() => {
    return allGames.filter((g) => {
      const matchesSearch = 
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.category.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategory === 'All') return true;
      if (selectedCategory === 'Favorites') return favorites.includes(g.id);
      return g.category.toLowerCase() === selectedCategory.toLowerCase();
    });
  }, [allGames, searchQuery, selectedCategory, favorites]);

  // Toggle Favorite
  const toggleFavorite = (gameId) => {
    setFavorites((prev) =>
      prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]
    );
  };

  // Add Custom Game
  const handleAddGame = (newGame) => {
    setCustomGames((prev) => [newGame, ...prev]);
  };

  // Lock portal
  const handleLock = () => {
    sessionStorage.removeItem('arcade_auth_token');
    setIsAuthenticated(false);
    setActiveGame(null);
  };

  // Apply tab cloak
  const handleSelectCloak = (preset) => {
    setCurrentCloakName(preset.name);
    localStorage.setItem('arcade_cloak_preset', preset.name);
    document.title = preset.title;

    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = preset.icon;
  };

  // Render Gate if not authenticated
  if (!isAuthenticated) {
    return <PasscodeGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  // Render Math Cloak if activated
  if (isCloaked) {
    return <MathCloak onExitCloak={() => setIsCloaked(false)} />;
  }

  // Render Game Player if game selected
  if (activeGame) {
    return (
      <GamePlayer
        game={activeGame}
        onBack={() => setActiveGame(null)}
        isFavorite={favorites.includes(activeGame.id)}
        onToggleFavorite={toggleFavorite}
        onTriggerCloak={() => setIsCloaked(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="border-b border-slate-800 bg-slate-900/80 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand title wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap">
              Arcade 101
            </span>
          </div>

          {/* Zone 2: Navigation / Quick links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`hover:text-slate-100 transition whitespace-nowrap cursor-pointer ${
                selectedCategory === 'All' ? 'text-sky-400' : ''
              }`}
            >
              All Titles
            </button>
            <button
              onClick={() => setSelectedCategory('Favorites')}
              className={`hover:text-slate-100 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === 'Favorites' ? 'text-rose-400' : ''
              }`}
            >
              <Heart className="w-3.5 h-3.5" />
              <span>Favorites</span>
              {favorites.length > 0 && (
                <span className="text-xs text-slate-400 tabular-nums">({favorites.length})</span>
              )}
            </button>
            <button
              onClick={() => setIsCustomModalOpen(true)}
              className="hover:text-slate-100 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add IFrame</span>
            </button>
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-slate-100 transition whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Cloak & Settings</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCloaked(true)}
              title="Stealth Disguise (Esc)"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
              <span className="hidden sm:inline">Stealth Mode</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-900 border border-emerald-500/30 rounded font-mono">
                Esc
              </kbd>
            </button>

            <button
              onClick={handleLock}
              title="Lock Portal"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 cursor-pointer transition"
              aria-label="Lock Portal"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex flex-col gap-8">
        {/* Search & Category Filter Strip */}
        <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search unblocked games, genres..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          {/* Category Tabs (Segmented Buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition cursor-pointer ${
                    active
                      ? 'bg-sky-500 text-slate-950 font-semibold shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  {cat === 'Favorites' ? `Favorites (${favorites.length})` : cat}
                </button>
              );
            })}
          </div>
        </section>

        {/* Results Heading & Count */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span>Showing {filteredGames.length} titles</span>
            {searchQuery && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>Filtered by &quot;{searchQuery}&quot;</span>
              </>
            )}
          </div>
          <button
            onClick={() => setIsCustomModalOpen(true)}
            className="text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Load custom IFrame URL</span>
          </button>
        </div>

        {/* Game Cards Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onSelect={(g) => setActiveGame(g)}
                isFavorite={favorites.includes(game.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 mb-3">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200">No games found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              No matching titles in &apos;{selectedCategory}&apos; for your search. Try resetting filters or add your own custom IFrame game.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                }}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-lg cursor-pointer"
              >
                Reset Search
              </button>
              <button
                onClick={() => setIsCustomModalOpen(true)}
                className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-xs font-semibold text-slate-950 rounded-lg cursor-pointer"
              >
                Add Game
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Arcade 101</span>
            <span aria-hidden="true">·</span>
            <span>Unblocked IFrame Media Vault</span>
            <span aria-hidden="true">·</span>
            <span>All local assets isolated</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              Tab Cloaking
            </button>
            <button
              onClick={() => setIsCloaked(true)}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              Emergency Math Sheet
            </button>
            <button
              onClick={handleLock}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              Lock Vault
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CustomGameModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddGame={handleAddGame}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onLock={handleLock}
        onResetCustomGames={() => setCustomGames([])}
        currentCloak={currentCloakName}
        onSelectCloak={handleSelectCloak}
      />
    </div>
  );
}
