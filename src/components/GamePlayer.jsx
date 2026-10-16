import { useState, useRef } from 'react';
import { 
  ArrowLeft, 
  Maximize2, 
  RotateCcw, 
  ExternalLink, 
  Heart, 
  Info, 
  ShieldAlert,
  Gamepad2
} from 'lucide-react';

export default function GamePlayer({ 
  game, 
  onBack, 
  isFavorite, 
  onToggleFavorite, 
  onTriggerCloak 
}) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [keyCounter, setKeyCounter] = useState(0);
  const containerRef = useRef(null);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleReload = () => {
    setKeyCounter(prev => prev + 1);
  };

  // Open in an about:blank cloaked window (classic unblocked games cloaker)
  const openInAboutBlank = () => {
    const win = window.open('about:blank', '_blank');
    if (!win) return;
    win.document.title = 'Google Docs';
    const iframe = win.document.createElement('iframe');
    iframe.src = window.location.origin + game.iframeUrl;
    iframe.style.position = 'fixed';
    iframe.style.top = '0';
    iframe.style.left = '0';
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    iframe.style.border = 'none';
    win.document.body.style.margin = '0';
    win.document.body.appendChild(iframe);
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col bg-slate-950 text-slate-100 select-none">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Library</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-100">{game.title}</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">{game.category}</span>
          </div>
        </div>

        {/* Center/Right Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerCloak}
            title="Stealth Academic Cloak (Esc)"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 hover:bg-emerald-900/40 text-xs font-medium cursor-pointer transition"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panic Disguise</span>
          </button>

          <button
            onClick={handleReload}
            title="Reload Game"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onToggleFavorite(game.id)}
            title="Favorite"
            className={`p-2 rounded-lg border cursor-pointer transition ${
              isFavorite
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-400' : ''}`} />
          </button>

          <button
            onClick={() => setShowInstructions(!showInstructions)}
            title="Instructions & Controls"
            className={`p-2 rounded-lg border cursor-pointer transition ${
              showInstructions
                ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={openInAboutBlank}
            title="Open in Cloaked Blank Tab"
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            title="Fullscreen"
            className="p-2 rounded-lg bg-sky-500 text-slate-950 hover:bg-sky-400 font-semibold cursor-pointer transition"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Viewport & Instruction Drawer */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* The Game Iframe */}
        <div className="flex-1 h-full bg-slate-950 relative flex items-center justify-center">
          <iframe
            key={keyCounter}
            src={game.iframeUrl}
            title={game.title}
            className="w-full h-full border-none"
            allow="fullscreen; autoplay; keyboard"
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
          />
        </div>

        {/* Instructions Collapsible Drawer */}
        {showInstructions && (
          <aside className="w-80 border-l border-slate-800 bg-slate-900/95 p-5 flex flex-col gap-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-sky-400" />
                <span>How to Play</span>
              </h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="text-slate-500 hover:text-slate-300 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

            <div>
              <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-1.5">
                Overview
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {game.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs uppercase font-semibold tracking-wider text-slate-400 mb-1.5">
                Controls
              </h4>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-sky-300 font-mono leading-relaxed">
                {game.instructions}
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-slate-800 text-xs text-slate-500 space-y-1">
              <div>Rating: <span className="text-slate-300 font-medium">★ {game.rating}</span></div>
              <div>Estimated Plays: <span className="text-slate-300 font-medium">{game.plays}</span></div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
