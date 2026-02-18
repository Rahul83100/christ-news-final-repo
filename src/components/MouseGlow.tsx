'use client';

import { useState, useEffect } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

export default function MouseGlow() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 700 };
    const cursorX = useSpring(mouseX, springConfig);
    const cursorY = useSpring(mouseY, springConfig);

    useEffect(() => {
        const moveMouse = (e: MouseEvent) => {
            mouseX.set(e.clientX - 250);
            mouseY.set(e.clientY - 250);
        };

        window.addEventListener('mousemove', moveMouse);
        return () => window.removeEventListener('mousemove', moveMouse);
    }, []);

    return (
        <motion.div
            className="fixed pointer-events-none z-[1] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]"
            style={{
                x: cursorX,
                y: cursorY,
            }}
        />
    );
}
