import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from '../ui/drawer';
import { Button } from '../ui/button';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

interface CreditsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

import { validateIntegrity } from '../../utils/integrity';
import { ConnectivityBadge } from '../ui/ConnectivityBadge';

// ... imports

export function CreditsDrawer({ isOpen, onClose }: CreditsDrawerProps) {
    const isSecure = validateIntegrity();

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="bg-zinc-950 border-zinc-900 text-white z-[999999]">
                <div className="mx-auto w-full max-w-md">
                    <DrawerHeader>
                        <div className="flex justify-center mb-4">
                            {isSecure ? (
                                <ShieldCheck className="w-16 h-16 text-emerald-500" />
                            ) : (
                                <AlertTriangle className="w-16 h-16 text-red-500 animate-pulse" />
                            )}
                        </div>
                        <div className="flex justify-center mb-4 text-[10px] transform scale-90">
                            <ConnectivityBadge />
                        </div>
                        <DrawerTitle className="text-2xl text-center font-bold text-white mb-2">
                            {isSecure ? 'yAMI OS Insurance Policy' : 'System Integrity Compromised'}
                        </DrawerTitle>
                        <DrawerDescription className="text-center text-zinc-400">
                            {isSecure ? 'Verification of Original Ownership' : 'Unauthorized Modifications Detected'}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5 space-y-2 h-full flex flex-col justify-between">
                                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-widest">Original Author</h3>
                                <p className="text-lg font-semibold leading-tight">Cătălin-Robert Drăgoiu</p>
                            </div>

                            <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5 space-y-2 h-full flex flex-col justify-between">
                                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-widest">License</h3>
                                <div>
                                    <p className="text-lg font-semibold">AGPL-3.0</p>
                                    <p className="text-xs text-zinc-500 mt-1 leading-snug">
                                        Free software. Source code must be distributed.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border border-red-500/20 bg-red-500/5 p-4 rounded-lg flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-red-200/80">
                                This project contains integrity checks. Modifying the original author metadata or package identity will result in system functionality degradation (Safe Mode).
                            </div>
                        </div>
                    </div>

                    <DrawerFooter>
                        <DrawerClose asChild>
                            <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 hover:text-white text-white">Close Verification</Button>
                        </DrawerClose>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
