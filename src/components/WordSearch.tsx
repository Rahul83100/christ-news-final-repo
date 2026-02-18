'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, RotateCcw, CheckCircle2, Trophy, Plus, X, Loader2, Settings, Save } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';

const DEFAULT_WORDS = ['CHRIST', 'CHRONICLE', 'NEWSLETTER', 'CAMPUS', 'LOGIC', 'PUZZLE'];
const DEFAULT_GRID_SIZE = 10;
const MAX_WORDS = 10;
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

interface WordSearchProps {
    isAdmin?: boolean;
}

export default function WordSearch({ isAdmin = false }: WordSearchProps) {
    const [grid, setGrid] = useState<string[][]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [selection, setSelection] = useState<{ start: [number, number], end: [number, number] } | null>(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [wordPositions, setWordPositions] = useState<{ word: string, positions: [number, number][] }[]>([]);
    const [isWon, setIsWon] = useState(false);
    const [wordsToFind, setWordsToFind] = useState<string[]>(DEFAULT_WORDS);
    const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
    const [loadingConfig, setLoadingConfig] = useState(true);
    const [showAdmin, setShowAdmin] = useState(false);
    const [adminWords, setAdminWords] = useState<string[]>([]);
    const [adminGridSize, setAdminGridSize] = useState(DEFAULT_GRID_SIZE);
    const [newWord, setNewWord] = useState('');
    const [savingConfig, setSavingConfig] = useState(false);
    const [configId, setConfigId] = useState<string | null>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    // Fetch config from Supabase
    useEffect(() => {
        async function loadConfig() {
            setLoadingConfig(true);
            try {
                const { data, error } = await supabase
                    .from('word_search_config')
                    .select('*')
                    .limit(1)
                    .single();

                if (data && !error) {
                    setWordsToFind(data.words || DEFAULT_WORDS);
                    setGridSize(data.grid_size || DEFAULT_GRID_SIZE);
                    setAdminWords(data.words || DEFAULT_WORDS);
                    setAdminGridSize(data.grid_size || DEFAULT_GRID_SIZE);
                    setConfigId(data.id);
                }
            } catch {
                // Use defaults if table doesn't exist yet
            }
            setLoadingConfig(false);
        }
        loadConfig();
    }, []);

    // Initialize game when words/gridSize change
    useEffect(() => {
        if (!loadingConfig) {
            initGame();
        }
    }, [wordsToFind, gridSize, loadingConfig]);

    const initGame = () => {
        const size = gridSize;
        const newGrid = Array(size).fill(null).map(() => Array(size).fill(''));
        const positions: { word: string, positions: [number, number][] }[] = [];

        wordsToFind.forEach(word => {
            let placed = false;
            let attempts = 0;
            while (!placed && attempts < 200) {
                const direction = Math.floor(Math.random() * 3);
                const row = Math.floor(Math.random() * size);
                const col = Math.floor(Math.random() * size);

                if (canPlaceWord(newGrid, word, row, col, direction, size)) {
                    const wordPos = placeWord(newGrid, word, row, col, direction);
                    positions.push({ word, positions: wordPos });
                    placed = true;
                }
                attempts++;
            }
        });

        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (newGrid[r][c] === '') {
                    newGrid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
                }
            }
        }

        setGrid(newGrid);
        setWordPositions(positions);
        setFoundWords([]);
        setIsWon(false);
    };

    const canPlaceWord = (grid: string[][], word: string, row: number, col: number, dir: number, size: number) => {
        if (dir === 0 && col + word.length > size) return false;
        if (dir === 1 && row + word.length > size) return false;
        if (dir === 2 && (row + word.length > size || col + word.length > size)) return false;

        for (let i = 0; i < word.length; i++) {
            const r = row + (dir >= 1 ? i : 0);
            const c = col + (dir !== 1 ? i : 0);
            if (grid[r][c] !== '' && grid[r][c] !== word[i]) return false;
        }
        return true;
    };

    const placeWord = (grid: string[][], word: string, row: number, col: number, dir: number) => {
        const positions: [number, number][] = [];
        for (let i = 0; i < word.length; i++) {
            const r = row + (dir >= 1 ? i : 0);
            const c = col + (dir !== 1 ? i : 0);
            grid[r][c] = word[i];
            positions.push([r, c]);
        }
        return positions;
    };

    const handleMouseDown = (r: number, c: number) => {
        setIsSelecting(true);
        setSelection({ start: [r, c], end: [r, c] });
    };

    const handleMouseEnter = (r: number, c: number) => {
        if (isSelecting && selection) {
            setSelection({ ...selection, end: [r, c] });
        }
    };

    const handleMouseUp = () => {
        setIsSelecting(false);
        if (selection) {
            const selectedWord = getSelectedWord();
            if (selectedWord && wordsToFind.includes(selectedWord) && !foundWords.includes(selectedWord)) {
                setFoundWords([...foundWords, selectedWord]);
                if (foundWords.length + 1 === wordsToFind.length) {
                    setIsWon(true);
                }
            }
        }
        setSelection(null);
    };

    const getSelectedWord = () => {
        if (!selection) return null;
        const [sr, sc] = selection.start;
        const [er, ec] = selection.end;

        const dr = er === sr ? 0 : er > sr ? 1 : -1;
        const dc = ec === sc ? 0 : ec > sc ? 1 : -1;

        if (dr === 0 && dc === 0) return grid[sr]?.[sc] || null;
        if (dr !== 0 && dc !== 0 && Math.abs(er - sr) !== Math.abs(ec - sc)) return null;

        const length = Math.max(Math.abs(er - sr), Math.abs(ec - sc)) + 1;
        let word = '';
        for (let i = 0; i < length; i++) {
            word += grid[sr + dr * i]?.[sc + dc * i] || '';
        }
        return word;
    };

    const isCellHighlighted = (r: number, c: number) => {
        if (!selection) return false;
        const [sr, sc] = selection.start;
        const [er, ec] = selection.end;

        const dr = er === sr ? 0 : er > sr ? 1 : -1;
        const dc = ec === sc ? 0 : ec > sc ? 1 : -1;

        if (dr === 0 && dc === 0) return r === sr && c === sc;
        if (dr !== 0 && dc !== 0 && Math.abs(er - sr) !== Math.abs(ec - sc)) return false;

        const length = Math.max(Math.abs(er - sr), Math.abs(ec - sc)) + 1;
        for (let i = 0; i < length; i++) {
            if (sr + dr * i === r && sc + dc * i === c) return true;
        }
        return false;
    };

    const isCellFound = (r: number, c: number) => {
        return wordPositions.some(wp => wp.positions.some(([pr, pc]) => pr === r && pc === c) && foundWords.includes(wp.word));
    };

    // Admin: save config
    const handleSaveConfig = async () => {
        setSavingConfig(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            if (configId) {
                const { error } = await supabase
                    .from('word_search_config')
                    .update({
                        words: adminWords,
                        grid_size: adminGridSize,
                        updated_at: new Date().toISOString(),
                        updated_by: user.id,
                    })
                    .eq('id', configId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase
                    .from('word_search_config')
                    .insert({
                        words: adminWords,
                        grid_size: adminGridSize,
                        updated_by: user.id,
                    })
                    .select()
                    .single();
                if (error) throw error;
                if (data) setConfigId(data.id);
            }

            setWordsToFind(adminWords);
            setGridSize(adminGridSize);
            toast.success('Word search config saved!');
            setShowAdmin(false);
        } catch (err: any) {
            toast.error(err.message || 'Failed to save config');
        } finally {
            setSavingConfig(false);
        }
    };

    const handleAddWord = () => {
        const word = newWord.toUpperCase().trim();
        if (!word) return;
        if (adminWords.length >= MAX_WORDS) {
            toast.error(`Maximum ${MAX_WORDS} words allowed`);
            return;
        }
        if (adminWords.includes(word)) {
            toast.error('Word already exists');
            return;
        }
        if (word.length > adminGridSize) {
            toast.error(`Word "${word}" is too long for grid size ${adminGridSize}`);
            return;
        }
        setAdminWords([...adminWords, word]);
        setNewWord('');
    };

    if (loadingConfig) {
        return (
            <div className="bg-white rounded-3xl border border-christ-light shadow-2xl p-20 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-christ-blue" size={48} />
                <p className="text-christ-blue/40 font-bold uppercase tracking-widest text-xs">Loading Puzzle...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Admin: Config Panel */}
            {isAdmin && (
                <div>
                    {showAdmin ? (
                        <div className="bg-purple-50 border border-purple-200 rounded-2xl p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-bold text-purple-800 flex items-center gap-2">
                                    <Settings size={18} /> Word Search Settings
                                </h4>
                                <button onClick={() => setShowAdmin(false)} className="text-purple-400 hover:text-purple-600">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Grid Size */}
                            <div>
                                <label className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                                    Grid Size: {adminGridSize} × {adminGridSize}
                                </label>
                                <input
                                    type="range"
                                    min={8}
                                    max={20}
                                    value={adminGridSize}
                                    onChange={(e) => setAdminGridSize(parseInt(e.target.value))}
                                    className="w-full mt-1 accent-purple-600"
                                />
                                <div className="flex justify-between text-[10px] text-purple-500 font-medium">
                                    <span>8</span><span>20</span>
                                </div>
                            </div>

                            {/* Current Words */}
                            <div>
                                <label className="text-xs font-bold text-purple-700 uppercase tracking-wider">
                                    Words ({adminWords.length}/{MAX_WORDS})
                                </label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {adminWords.map((word, i) => (
                                        <span key={i} className="flex items-center gap-1 px-3 py-1 bg-white border border-purple-200 rounded-full text-sm font-bold text-purple-800">
                                            {word}
                                            <button
                                                onClick={() => setAdminWords(adminWords.filter((_, j) => j !== i))}
                                                className="text-purple-400 hover:text-red-500 ml-1"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Add Word */}
                            {adminWords.length < MAX_WORDS && (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newWord}
                                        onChange={(e) => setNewWord(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddWord())}
                                        placeholder="Add a word..."
                                        className="flex-grow px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-300 outline-none"
                                        maxLength={adminGridSize}
                                    />
                                    <button
                                        onClick={handleAddWord}
                                        className="px-4 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 text-sm"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            )}

                            {/* Save */}
                            <button
                                onClick={handleSaveConfig}
                                disabled={savingConfig || adminWords.length === 0}
                                className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
                            >
                                {savingConfig ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                Save & Regenerate Grid
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowAdmin(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 font-bold rounded-xl hover:bg-purple-200 transition-colors text-sm"
                        >
                            <Settings size={16} /> Edit Words ({wordsToFind.length})
                        </button>
                    )}
                </div>
            )}

            {/* Game */}
            <div className="bg-white rounded-3xl border border-christ-light shadow-2xl overflow-hidden max-w-2xl mx-auto">
                <div className="bg-christ-blue p-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Search size={20} className="text-christ-gold" />
                        <h3 className="text-lg font-bold">Word Search</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-medium">
                            {foundWords.length}/{wordsToFind.length}
                        </span>
                        <button
                            onClick={initGame}
                            className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                            title="New puzzle"
                        >
                            <RotateCcw size={16} />
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-4">
                    <AnimatePresence>
                        {isWon && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-green-50 border border-green-200 rounded-xl p-4 text-center"
                            >
                                <Trophy className="mx-auto text-green-500 mb-2" size={32} />
                                <p className="font-bold text-green-700">All words found!</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Grid */}
                    <div
                        ref={gridRef}
                        className="grid gap-0.5 mx-auto select-none"
                        style={{
                            gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                            maxWidth: `${Math.min(gridSize * 36, 500)}px`
                        }}
                        onMouseLeave={handleMouseUp}
                    >
                        {grid.map((row, r) =>
                            row.map((cell, c) => (
                                <div
                                    key={`${r}-${c}`}
                                    onMouseDown={() => handleMouseDown(r, c)}
                                    onMouseEnter={() => handleMouseEnter(r, c)}
                                    onMouseUp={handleMouseUp}
                                    className={clsx(
                                        'aspect-square flex items-center justify-center font-bold rounded-sm cursor-pointer transition-all duration-150',
                                        gridSize > 14 ? 'text-[10px]' : gridSize > 10 ? 'text-xs' : 'text-sm',
                                        isCellFound(r, c)
                                            ? 'bg-green-200 text-green-800'
                                            : isCellHighlighted(r, c)
                                                ? 'bg-christ-gold/40 text-christ-dark scale-110'
                                                : 'bg-christ-silver/50 text-christ-dark hover:bg-christ-light'
                                    )}
                                >
                                    {cell}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Word List */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {wordsToFind.map(word => (
                            <span
                                key={word}
                                className={clsx(
                                    'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide transition-all',
                                    foundWords.includes(word)
                                        ? 'bg-green-100 text-green-700 line-through'
                                        : 'bg-christ-light text-christ-dark'
                                )}
                            >
                                {foundWords.includes(word) && <CheckCircle2 size={12} className="inline mr-1" />}
                                {word}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
