import React, { useState, useRef, useEffect } from 'react';
import { Camera, ShieldCheck, Trophy, Calendar } from 'lucide-react';

/**
 * LUZ Playoff Predictor - Version Épurée
 * Logo en Helvetica et bouton de sauvegarde renommé.
 */

const COLORS = {
  luzNeon: '#E3FC00',
  luzBlack: '#000000',
  habsRed: '#AF1E2D',
  habsBlue: '#192168',
  zinc800: '#27272a',
  zinc900: '#18181b',
};

const INITIAL_TEAMS = {
  west: [
    { id: 'w1', t1: 'Avalanche', city1: 'Colorado', t2: 'Kings', city2: 'Los Angeles', s1: 0, s2: 0, seed1: 1, seed2: 4, icon1: '🏔️', icon2: '👑' },
    { id: 'w2', t1: 'Stars', city1: 'Dallas', t2: 'Wild', city2: 'Minnesota', s1: 0, s2: 0, seed1: 2, seed2: 3, icon1: '⭐', icon2: '🌲' },
    { id: 'w3', t1: 'Golden Knights', city1: 'Vegas', t2: 'Mammoth', city2: 'Colorado', s1: 0, s2: 0, seed1: 1, seed2: 4, icon1: '⚔️', icon2: '🦣' },
    { id: 'w4', t1: 'Oilers', city1: 'Edmonton', t2: 'Ducks', city2: 'Anaheim', s1: 0, s2: 0, seed1: 2, seed2: 3, icon1: '💧', icon2: '🦆' },
  ],
  east: [
    { id: 'e1', t1: 'Sabres', city1: 'Buffalo', t2: 'Bruins', city2: 'Boston', s1: 0, s2: 0, seed1: 1, seed2: 4, icon1: '⚔️', icon2: '🐻' },
    { id: 'e2', t1: 'Lightning', city1: 'Tampa Bay', t2: 'Canadiens', city2: 'Montréal', s1: 0, s2: 0, seed1: 2, seed2: 3, icon1: '⚡', icon2: '🇨🇦' },
    { id: 'e3', t1: 'Hurricanes', city1: 'Carolina', t2: 'Senators', city2: 'Ottawa', s1: 0, s2: 0, seed1: 1, seed2: 4, icon1: '🌀', icon2: '🛡️' },
    { id: 'e4', t1: 'Penguins', city1: 'Pittsburgh', t2: 'Flyers', city2: 'Philadelphia', s1: 0, s2: 0, seed1: 2, seed2: 3, icon1: '🐧', icon2: '🧡' },
  ]
};

const App = () => {
  const [userName, setUserName] = useState('');
  const [round1, setRound1] = useState(INITIAL_TEAMS);
  const bracketRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleScoreChange = (side, seriesId, teamIndex, value) => {
    const score = Math.min(4, Math.max(0, parseInt(value) || 0));
    setRound1(prev => ({
      ...prev,
      [side]: prev[side].map(s => s.id === seriesId ? { ...s, [`s${teamIndex}`]: score } : s)
    }));
  };

  const exportAsImage = async () => {
    if (!bracketRef.current || !window.html2canvas) return;
    try {
      const canvas = await window.html2canvas(bracketRef.current, {
        backgroundColor: '#000000',
        scale: 2,
        logging: false,
        useCORS: true,
        onclone: (clonedDoc) => {
          const names = clonedDoc.querySelectorAll('.team-name');
          const cities = clonedDoc.querySelectorAll('.city-name');
          names.forEach(el => {
            el.style.display = 'block';
            el.style.lineHeight = '1.4';
            el.style.paddingBottom = '5px';
          });
          cities.forEach(el => {
            el.style.display = 'block';
            el.style.lineHeight = '1.2';
            el.style.paddingBottom = '2px';
          });
        }
      });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `LUZ-Predictions-NHL-2026-${userName || 'User'}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to capture image:", err);
    }
  };

  const TeamRow = ({ name, city, score, seed, icon, isWinner, isHabs, onChange }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg transition-all duration-300 ${isWinner ? 'bg-[#E3FC00]/10' : 'bg-black/20'}`}>
      <div className="flex items-center gap-3 overflow-visible">
        <span className="text-[10px] font-black text-zinc-600 w-4 flex-shrink-0 self-center">{seed}</span>
        <span className="text-xl flex-shrink-0 self-center">{icon}</span>
        <div className="flex flex-col overflow-visible">
          <span className={`team-name text-lg font-black tracking-tight leading-[1.3] block truncate ${isHabs ? 'text-[#AF1E2D]' : 'text-white'} ${isWinner ? 'text-[#E3FC00]' : ''}`}>
            {name.toUpperCase()}
          </span>
          <span className="city-name text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-normal block">
            {city}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 self-center">
        {isWinner && <Trophy size={16} className="text-[#E3FC00] animate-pulse" />}
        <input 
          type="number" 
          value={score} 
          onChange={(e) => onChange(e.target.value)}
          className={`w-14 h-11 bg-zinc-950 border-2 rounded-lg text-center text-xl font-black outline-none transition-colors ${isWinner ? 'border-[#E3FC00] text-[#E3FC00]' : 'border-zinc-800 text-zinc-400 focus:border-zinc-500'}`}
        />
      </div>
    </div>
  );

  const Matchup = ({ series, side, onScoreChange }) => {
    const isWinner1 = series.s1 === 4;
    const isWinner2 = series.s2 === 4;

    return (
      <div className={`relative group mb-6 w-full lg:w-[400px] bg-zinc-900 rounded-2xl overflow-hidden border-2 transition-all duration-500 ${(isWinner1 || isWinner2) ? 'border-[#E3FC00] shadow-[0_0_30px_rgba(227,252,0,0.1)]' : 'border-zinc-800'} ${side === 'east' ? 'hover:border-[#AF1E2D]/50' : 'hover:border-[#192168]/50'}`}>
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${side === 'east' ? 'bg-[#AF1E2D]' : 'bg-[#192168]'}`} />
        
        <div className="p-4 space-y-4">
          <TeamRow 
            name={series.t1} 
            city={series.city1}
            score={series.s1} 
            seed={series.seed1} 
            icon={series.icon1}
            isWinner={isWinner1}
            isHabs={series.t1 === 'Canadiens'}
            onChange={(val) => onScoreChange(side, series.id, 1, val)}
          />
          <div className="h-px bg-zinc-800 mx-2" />
          <TeamRow 
            name={series.t2} 
            city={series.city2}
            score={series.s2} 
            seed={series.seed2} 
            icon={series.icon2}
            isWinner={isWinner2}
            isHabs={series.t2 === 'Canadiens'}
            onChange={(val) => onScoreChange(side, series.id, 2, val)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#E3FC00] selection:text-black p-4 md:p-10">
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between mb-16 gap-10">
        <div className="space-y-4">
          <div 
            className="text-6xl font-bold uppercase tracking-tight"
            style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}
          >
            LUZ STUDIO
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[#E3FC00] font-black uppercase tracking-[0.3em] text-sm">
                <ShieldCheck size={18} />
                <span>Feuille de Prédiction Officielle</span>
            </div>
            <div className="bg-[#AF1E2D] text-white text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase italic shadow-lg">
                NHL Playoffs 2026
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:items-end gap-3">
          <label className="text-xs uppercase text-zinc-500 font-black tracking-[0.2em]">Soumis Par</label>
          <input 
            type="text" 
            placeholder="VOTRE NOM" 
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="bg-zinc-900 border-2 border-zinc-800 focus:border-[#E3FC00] py-3 px-6 rounded-xl outline-none text-2xl font-black transition-all w-full md:w-80 uppercase italic text-[#E3FC00] placeholder:text-zinc-700"
          />
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex flex-wrap gap-5 mb-16">
        <button 
          onClick={exportAsImage}
          className="flex items-center gap-3 bg-[#E3FC00] text-black px-10 py-5 rounded-2xl font-black uppercase text-base hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_40px_rgba(227,252,0,0.2)]"
        >
          <Camera size={22} /> Sauvegarder vos prédictions
        </button>
      </div>

      {/* ZONE DE CAPTURE */}
      <div 
        ref={bracketRef} 
        className="max-w-7xl mx-auto bg-zinc-950 p-6 md:p-12 rounded-[40px] border border-zinc-900 shadow-2xl relative overflow-visible"
      >
        {/* En-tête interne */}
        <div className="relative z-10 mb-12 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-900 pb-8 gap-6">
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-[#E3FC00] text-black px-2 py-0.5 font-black text-[11px] uppercase tracking-tighter italic">SÉRIES ÉLIMINATOIRES</div>
                <div className="text-[#AF1E2D] font-black text-[14px] uppercase tracking-[0.4em]">NHL 2026</div>
            </div>
            <div className="text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
              {userName || "Participant Anonyme"}
            </div>
          </div>
          <div className="text-right flex flex-col items-end flex-shrink-0">
             <div className="flex items-center gap-3 mb-2">
                <div className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.3em]">LUZ STUDIO DIGITAL PREDICTIONS</div>
                <div className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center">
                    <Trophy size={14} className="text-zinc-700" />
                </div>
             </div>
             <div className="text-7xl font-black text-zinc-900 leading-none tracking-tighter select-none">2026</div>
          </div>
        </div>

        {/* Filigrane arrière-plan */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-black opacity-[0.02] whitespace-nowrap pointer-events-none italic">
          LUZ PLAYOFFS
        </div>

        <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-20 overflow-visible">
          {/* OUEST */}
          <div className="space-y-10 order-1 overflow-visible">
            <div className="flex items-center gap-0">
               <div className="bg-[#192168] flex items-center px-6 py-4 rounded-l-2xl shadow-xl">
                  <h3 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none">
                    OUEST
                  </h3>
               </div>
               <div className="bg-zinc-900 flex items-center px-4 py-4 rounded-r-2xl border-y border-r border-[#192168]/30">
                  <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Conférence</span>
               </div>
               <div className="h-[2px] bg-gradient-to-r from-[#192168] to-transparent flex-grow ml-4 opacity-50" />
            </div>
            <div className="flex flex-wrap gap-6 justify-center xl:justify-start overflow-visible">
              {round1.west.map(s => (
                <Matchup key={s.id} series={s} side="west" onScoreChange={handleScoreChange} />
              ))}
            </div>
          </div>

          {/* EST */}
          <div className="space-y-10 order-2 overflow-visible">
            <div className="flex items-center gap-0 justify-end">
               <div className="h-[2px] bg-gradient-to-l from-[#AF1E2D] to-transparent flex-grow mr-4 opacity-50" />
               <div className="bg-zinc-900 flex items-center px-4 py-4 rounded-l-2xl border-y border-l border-[#AF1E2D]/30">
                  <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Conférence</span>
               </div>
               <div className="bg-[#AF1E2D] flex items-center px-6 py-4 rounded-r-2xl shadow-xl">
                  <h3 className="text-4xl font-black uppercase tracking-tighter italic text-white leading-none">
                    EST
                  </h3>
               </div>
            </div>
            <div className="flex flex-wrap gap-6 justify-center xl:justify-end overflow-visible">
              {round1.east.map(s => (
                <Matchup key={s.id} series={s} side="east" onScoreChange={handleScoreChange} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center">
            <div className="px-6 py-2 bg-zinc-900 rounded-full text-[#E3FC00] font-black text-xs uppercase tracking-[0.8em] border border-[#E3FC00]/20 flex items-center gap-3">
              <Calendar size={12} />
              Tour 01 • NHL PLAYOFFS 2026
            </div>
        </div>
      </div>

      <footer className="max-w-7xl mx-auto mt-20 pb-10 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 text-xs font-black uppercase tracking-[0.4em]">
        <div className="flex items-center gap-2">
          <span>© 2026</span>
          <span className="text-white">LUZ STUDIO</span>
          <span className="text-zinc-800">|</span>
          <span>Séries LNH 2026</span>
        </div>
        <div className="flex gap-12">
          <span className="hover:text-[#AF1E2D] transition-colors cursor-default">Montréal, QC</span>
          <span className="text-[#AF1E2D] animate-pulse">#GoHabsGo</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
