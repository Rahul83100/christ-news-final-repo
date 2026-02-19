'use client';

import { useState, useEffect } from 'react';

export default function Preloader() {
    const [isVisible, setIsVisible] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Check if user has already seen the preloader in this session
        const hasSeen = sessionStorage.getItem('hasSeenPreloader');
        if (hasSeen) {
            setIsVisible(false);
            return;
        }

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    sessionStorage.setItem('hasSeenPreloader', 'true');
                    setTimeout(() => setIsVisible(false), 800);
                    return 100;
                }
                return prev + 1;
            });
        }, 35);

        return () => clearInterval(interval);
    }, []);

    if (!isVisible) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-all duration-[1000ms] ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            style={{ backgroundColor: '#000b2e' }}>
            <style jsx>{`
                .logo-container {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .logo-text {
                    font-size: clamp(2.5rem, 8vw, 4rem);
                    font-weight: 700;
                    letter-spacing: -0.02em;
                    /* Logo Color Match: Blue -> Gold -> Blue */
                    background: linear-gradient(90deg, #00a8ff 0%, #00d2ff 25%, #feca57 50%, #00d2ff 75%, #00a8ff 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    opacity: 0;
                    transform: translateY(20px);
                    animation: textReveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    animation-delay: 0.2s;
                    text-shadow: 0 0 30px rgba(254, 202, 87, 0.1);
                }

                @keyframes textReveal {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .bee-container {
                    position: absolute;
                    top: -70px;
                    left: 20%;
                    width: 70px;
                    height: 70px;
                    z-index: 10;
                    opacity: 0;
                    animation: beeFlight 2.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                    animation-delay: 0.6s;
                }

                @keyframes beeFlight {
                    0% {
                        opacity: 0;
                        transform: translate(-150px, -50px) scale(0.6) rotate(-30deg);
                    }
                    15% {
                        opacity: 1;
                        transform: translate(-100px, -70px) scale(0.8) rotate(-10deg);
                    }
                    40% {
                        transform: translate(20px, -90px) scale(1.1) rotate(5deg);
                    }
                    70% {
                        transform: translate(110px, -45px) scale(0.95) rotate(-5deg);
                    }
                    100% {
                        opacity: 1;
                        transform: translate(130px, -30px) scale(1) rotate(0deg);
                    }
                }

                .bee-body-anim {
                    width: 100%;
                    height: 100%;
                    animation: idleMotion 3s ease-in-out infinite alternate;
                    animation-delay: 3.4s;
                }

                @keyframes idleMotion {
                    0% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-3px) rotate(1deg); }
                    100% { transform: translateY(0) rotate(-1deg); }
                }

                .wing {
                    fill: none;
                    stroke: white;
                    stroke-width: 1;
                    opacity: 0.7;
                    animation: flap 0.1s ease-in-out infinite alternate;
                    transform-origin: center;
                }

                @keyframes flap {
                    from { transform: scaleY(0.7) skewX(-5deg); }
                    to { transform: scaleY(1.1) skewX(5deg); }
                }

                .progress-container {
                    position: absolute;
                    bottom: -60px;
                    width: 240px;
                    height: 2px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                    overflow: hidden;
                    opacity: 0;
                    animation: fadeIn 0.5s ease forwards;
                    animation-delay: 1.2s;
                }

                .progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #00d2ff, #feca57);
                    box-shadow: 0 0 15px rgba(254, 202, 87, 0.3);
                    transition: width 0.1s ease-out;
                }

                @keyframes fadeIn {
                    to { opacity: 1; }
                }

                .skip-button {
                    position: absolute;
                    bottom: 40px;
                    right: 40px;
                    padding: 8px 16px;
                    background: transparent;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.3);
                    font-size: 10px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                    border-radius: 100px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    z-index: 110;
                }

                .skip-button:hover {
                    color: white;
                    border-color: rgba(255, 255, 255, 0.4);
                    background: rgba(255, 255, 255, 0.05);
                }
            `}</style>

            <div className="logo-container">
                <div className="bee-container">
                    <div className="bee-body-anim">
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                            <defs>
                                <radialGradient id="beeGlow" cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" style={{ stopColor: '#feca57', stopOpacity: 0.9 }} />
                                    <stop offset="100%" style={{ stopColor: '#ff9f43', stopOpacity: 0 }} />
                                </radialGradient>
                            </defs>
                            <circle cx="50" cy="55" r="18" fill="url(#beeGlow)" className="animate-pulse" />

                            <path className="wing" d="M50 45 C75 10 95 30 50 45" />
                            <path className="wing" d="M50 45 C85 25 90 55 50 45" />
                            <path className="wing" d="M50 45 C25 10 5 30 50 45" />
                            <path className="wing" d="M50 45 C15 25 10 55 50 45" />

                            <circle cx="50" cy="55" r="18" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
                            <path d="M40 48 Q50 38 60 48" stroke="white" strokeWidth="0.8" fill="none" />
                            <path d="M36 55 Q50 45 64 55" stroke="white" strokeWidth="1" fill="none" />
                            <path d="M40 62 Q50 52 60 62" stroke="white" strokeWidth="0.8" fill="none" />

                            <circle cx="50" cy="38" r="5" fill="none" stroke="white" strokeWidth="0.8" />
                            <path d="M48 34 Q45 20 35 22" stroke="white" strokeWidth="0.8" fill="none" />
                            <path d="M52 34 Q55 20 65 22" stroke="white" strokeWidth="0.8" fill="none" />
                        </svg>
                    </div>
                </div>

                <h1 className="logo-text">
                    E-luminate
                </h1>

                <div className="progress-container">
                    <div
                        className="progress-bar"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <button onClick={() => {
                sessionStorage.setItem('hasSeenPreloader', 'true');
                setIsVisible(false);
            }} className="skip-button">
                Skip Intro
            </button>

            <div className="absolute bottom-10 left-10 text-white/10 text-[10px] tracking-[0.4em] uppercase font-medium">
                Newsletter Insight / Vol. 2026
            </div>
        </div>
    );
}
