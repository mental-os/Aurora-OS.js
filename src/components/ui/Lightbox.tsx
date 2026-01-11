import { useState } from 'react';
import { Maximize2, ZoomIn, ZoomOut, X, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Photo } from '@/components/PhotosContext';
import { Dialog, DialogPortal, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/components/ui/utils';
import { useThemeColors } from '@/hooks/useThemeColors';

interface LightboxProps {
    photo: Photo;
    onClose: () => void;
    onToggleFavorite: (id: string) => void;
}

export function Lightbox({ photo, onClose, onToggleFavorite }: LightboxProps) {
    const { windowBackground, titleBarBackground, blurStyle } = useThemeColors();
    const [zoom, setZoom] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleReset = () => {
        setZoom(1);
        setOffset({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom <= 1) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setOffset({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogPortal>
                <DialogTitle className="sr-only">
                    {photo.name}
                </DialogTitle>
                <div 
                    className="fixed inset-0 z-50 flex flex-col animate-in fade-in zoom-in duration-200 select-none"
                    style={{
                        background: windowBackground,
                        ...blurStyle
                    }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                >
                    {/* Header */}
                    <div 
                        className="flex items-center justify-between text-white z-10 p-4 border-b border-white/5"
                        style={{ background: titleBarBackground }}
                    >
                        <div className="flex flex-col">
                            <span className="font-medium">{photo.name}</span>
                            <span className="text-xs text-white/50">{photo.album}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onToggleFavorite(photo.id); }}>
                                {photo.isFavorite ? <Heart className="w-5 h-5 fill-red-500 text-red-500" /> : <Heart className="w-5 h-5" />}
                            </Button>
                            <div className="h-4 w-px bg-white/10 mx-1" />
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(0.5, z - 0.25)); }}>
                                <ZoomOut className="w-5 h-5" />
                            </Button>
                            <span className="text-xs tabular-nums w-12 text-center font-medium">{Math.round(zoom * 100)}%</span>
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(5, z + 0.25)); }}>
                                <ZoomIn className="w-5 h-5" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                                className={zoom === 1 ? 'text-white/30' : 'text-white'}
                            >
                                <Maximize2 className="w-5 h-5" />
                            </Button>
                            <div className="h-4 w-px bg-white/10 mx-1" />
                            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-red-500/20 hover:text-red-500 transition-colors">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Image Container */}
                    <div 
                        className={cn(
                            "flex-1 relative flex items-center justify-center overflow-hidden transition-all duration-300",
                            zoom > 1 ? "cursor-grab" : "cursor-default",
                            isDragging && "cursor-grabbing"
                        )}
                        onMouseDown={handleMouseDown}
                        onClick={(e) => {
                            if (e.target === e.currentTarget) onClose();
                        }}
                    >
                        <div 
                            className="relative flex items-center justify-center"
                            style={{
                                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                                transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
                            }}
                        >
                            <img
                                src={photo.url}
                                alt={photo.name}
                                draggable={false}
                                className="max-w-[85vw] max-h-[85vh] rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] object-contain transition-shadow duration-300"
                            />
                        </div>
                    </div>
                </div>
            </DialogPortal>
        </Dialog>
    );
}
