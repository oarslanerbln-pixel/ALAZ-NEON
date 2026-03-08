import { useCallback, useRef } from 'react';

export function useSound(url: string) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const play = useCallback(() => {
        // Create audio element on first play to avoid early loading issues
        if (!audioRef.current) {
            audioRef.current = new Audio(url);
        }
        
        // Reset and play
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(err => {
            console.warn('Audio playback failed (interaction required?):', err);
        });
    }, [url]);

    return { play };
}
