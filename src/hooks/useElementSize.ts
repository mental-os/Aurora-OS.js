
import { useState, useCallback, useEffect } from 'react';

interface Size {
    width: number;
    height: number;
}

export function useElementSize<T extends HTMLElement = HTMLDivElement>(): [
    (node: T | null) => void,
    Size
] {
    const [ref, setRef] = useState<T | null>(null);
    const [size, setSize] = useState<Size>({
        width: 0,
        height: 0,
    });

    // Prevent too many updates with useCallback
    const handleSize = useCallback(() => {
        setSize({
            width: ref?.offsetWidth || 0,
            height: ref?.offsetHeight || 0,
        });
    }, [ref]);

    useEffect(() => {
        if (!ref) return;



        const observer = new ResizeObserver(() => {
            handleSize();
        });

        observer.observe(ref);

        return () => {
            observer.disconnect();
        };
    }, [ref, handleSize]);

    return [setRef, size];
}
