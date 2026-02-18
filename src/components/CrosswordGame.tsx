'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layout, RotateCcw, Trophy, ChevronRight, ChevronDown } from 'lucide-react';
import clsx from 'clsx';

const GRID_SIZE = 10;

interface Clue {
    number: number;
    answer: string;
    clue: string;
    row: number;
    col: number;
    direction: 'across' | 'down';
}

const CLUES: Clue[] = [
    { number: 1, answer: 'CHRONICLE', clue: 'The name of our digital newsletter platform.', row: 1, col: 1, direction: 'down' },
    { number: 1, answer: 'CHRIST', clue: 'Our beloved university.', row: 1, col: 1, direction: 'across' },
    { number: 2, answer: 'CREATIVE', clue: 'Expressing your artistic and innovative side.', row: 3, col: 0, direction: 'across' },
    { number: 3, answer: 'ONLINE', clue: 'Where we access this digital platform.', row: 5, col: 0, direction: 'across' },
    { number: 4, answer: 'ACE', clue: 'To perform exceptionally well in your studies.', row: 7, col: 0, direction: 'across' },
];

export default function CrosswordGame() {
    const [userGrid, setUserGrid] = useState<string[][]>(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('')));
    const [isWon, setIsWon] = useState(false);
    const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
    const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const initGame = () => {
        setUserGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('')));
        setIsWon(false);
        setSelectedCell(null);
    };

    const isCellInGame = (r: number, c: number) => {
        return CLUES.some(clue => {
            if (clue.direction === 'across') {
                return r === clue.row && c >= clue.col && c < clue.col + clue.answer.length;
            } else {
                return c === clue.col && r >= clue.row && r < clue.row + clue.answer.length;
            }
        });
    };

    const getCellLabel = (r: number, c: number) => {
        const startClue = CLUES.find(clue => clue.row === r && clue.col === c);
        return startClue ? startClue.number : null;
    };

    const handleInput = (r: number, c: number, val: string) => {
        if (isWon) return;
        const newVal = val.toUpperCase().slice(-1);
        const newGrid = [...userGrid];
        newGrid[r][c] = newVal;
        setUserGrid(newGrid);

        if (newVal !== '') {
            // Move to next cell in current word or just next cell
            const nextInput = findNextCell(r, c);
            if (nextInput) {
                inputRefs.current[`${nextInput[0]}-${nextInput[1]}`]?.focus();
                setSelectedCell(nextInput);
            }
        }
    };

    const findNextCell = (r: number, c: number): [number, number] | null => {
        // Simple logic: move right if possible, else down
        if (c + 1 < GRID_SIZE && isCellInGame(r, c + 1)) return [r, c + 1];
        if (r + 1 < GRID_SIZE && isCellInGame(r + 1, c)) return [r + 1, c];
        return null;
    };

    const handleKeyDown = (r: number, c: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && userGrid[r][c] === '') {
            const prevInput = findPrevCell(r, c);
            if (prevInput) {
                inputRefs.current[`${prevInput[0]}-${prevInput[1]}`]?.focus();
                setSelectedCell(prevInput);
            }
        }
    };

    const findPrevCell = (r: number, c: number): [number, number] | null => {
        if (c - 1 >= 0 && isCellInGame(r, c - 1)) return [r, c - 1];
        if (r - 1 >= 0 && isCellInGame(r - 1, c)) return [r - 1, c];
        return null;
    };

    useEffect(() => {
        const checkWin = () => {
            const won = CLUES.every(clue => {
                for (let i = 0; i < clue.answer.length; i++) {
                    const r = clue.direction === 'across' ? clue.row : clue.row + i;
                    const c = clue.direction === 'across' ? clue.col + i : clue.col;
                    if (userGrid[r][c] !== clue.answer[i]) return false;
                }
                return true;
            });
            if (won && !isWon) setIsWon(true);
        };
        checkWin();
    }, [userGrid]);

    return (
        <div className="bg-white rounded-3xl border border-christ-light shadow-2xl overflow-hidden max-w-4xl mx-auto font-sans">
            <div className="bg-christ-blue p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Layout className="text-christ-gold" />
                    <h3 className="text-xl font-bold tracking-tight uppercase">Criss Cross Crossword</h3>
                </div>
                <button onClick={initGame} className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
                    <RotateCcw size={18} />
                </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="flex justify-center items-start">
                    <div className="grid grid-cols-10 gap-px bg-cream-200 border border-cream-200 rounded-lg overflow-hidden shadow-inner w-full max-w-[400px]">
                        {Array(GRID_SIZE).fill(0).map((_, r) => (
                            Array(GRID_SIZE).fill(0).map((_, c) => {
                                const inGame = isCellInGame(r, c);
                                const label = getCellLabel(r, c);
                                const isSelected = selectedCell?.[0] === r && selectedCell?.[1] === c;

                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        className={clsx(
                                            "aspect-square relative flex items-center justify-center transition-all duration-200 border-2 border-christ-dark", // Added border-2 border-christ-dark
                                            inGame ? (isSelected ? "bg-christ-light" : "bg-white") : "bg-christ-silver"
                                        )}
                                        onClick={() => inGame && setSelectedCell([r, c])}
                                    >
                                        {label && (
                                            <span className="absolute top-0.5 left-0.5 text-[8px] font-bold text-christ-blue/50 leading-none">
                                                {label}
                                            </span>
                                        )}
                                        {inGame ? (
                                            <input
                                                ref={el => { inputRefs.current[`${r}-${c}`] = el }}
                                                type="text"
                                                maxLength={1}
                                                className={clsx(
                                                    "w-full h-full text-center text-lg font-black uppercase bg-transparent outline-none transition-all",
                                                    isWon ? "text-green-600" : "text-christ-dark",
                                                    isSelected && "ring-2 ring-christ-blue/20"
                                                )}
                                                value={userGrid[r][c]}
                                                onChange={(e) => handleInput(r, c, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(r, c, e)}
                                                onFocus={() => setSelectedCell([r, c])}
                                                disabled={isWon}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-christ-dark/5" />
                                        )}
                                    </div>
                                );
                            })
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-christ-blue uppercase tracking-[0.2em] mb-4">
                            <ChevronRight size={14} /> Across
                        </h4>
                        <div className="space-y-3">
                            {CLUES.filter(c => c.direction === 'across').map((clue, idx) => (
                                <div key={idx} className="flex gap-3 group">
                                    <span className="font-bold text-christ-blue/30 text-sm">{clue.number}.</span>
                                    <p className="text-sm text-christ-dark leading-snug group-hover:text-christ-blue transition-colors font-medium">
                                        {clue.clue}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="flex items-center gap-2 text-xs font-bold text-christ-blue uppercase tracking-[0.2em] mb-4">
                            <ChevronDown size={14} /> Down
                        </h4>
                        <div className="space-y-3">
                            {CLUES.filter(c => c.direction === 'down').map((clue, idx) => (
                                <div key={idx} className="flex gap-3 group">
                                    <span className="font-bold text-christ-blue/30 text-sm">{clue.number}.</span>
                                    <p className="text-sm text-christ-dark leading-snug group-hover:text-christ-blue transition-colors font-medium">
                                        {clue.clue}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isWon && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 bg-green-50 border-t border-green-200 text-center"
                    >
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <Trophy className="text-green-600 w-10 h-10" />
                            </div>
                        </div>
                        <h4 className="text-2xl font-black text-christ-dark mb-2">MASTER CRYPTOGRAPHER!</h4>
                        <p className="text-christ-dark/70 mb-6 font-serif italic text-lg max-w-lg mx-auto">
                            Fantastic! You've successfully deciphered all the clues and completed the university crossword.
                        </p>
                        <button
                            onClick={initGame}
                            className="px-8 py-3 bg-christ-blue text-white font-bold rounded-full hover:bg-christ-dark transition-all shadow-xl"
                        >
                            Reset Grid
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
