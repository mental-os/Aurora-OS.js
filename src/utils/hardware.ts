export interface HardwareInfo {
    cpuCores: number;
    cpuModel: string;
    memory: number; // in GiB
    platform: string;
    gpuRenderer: string;
    screenResolution: string;
}

export const getHardwareInfo = async (): Promise<HardwareInfo> => {
    // Default / Browser Fallbacks
    const info: HardwareInfo = {
        cpuCores: navigator.hardwareConcurrency || 4,
        cpuModel: 'Generic Processor',
        memory: 8, // Default fallback
        platform: navigator.platform || 'Unknown',
        gpuRenderer: 'Virtual Display Adapter',
        screenResolution: `${window.screen.width}x${window.screen.height}`
    };

    // 1. Try Electron Real Hardware Info
    if (window.electron) {
        try {
            const sys = await window.electron.getSystemInfo();
            if (sys) {
                // CPU
                info.cpuCores = sys.cpu.cores;
                info.cpuModel = sys.cpu.model;

                // Memory (Bytes -> GiB)
                info.memory = Math.round(sys.memory.total / (1024 * 1024 * 1024));

                // GPU
                info.gpuRenderer = sys.gpu.model;

                // OS
                info.platform = sys.os.platform; // e.g., 'x64'
            }
        } catch (e) {
            console.error('Failed to fetch Electron system info', e);
        }
    }
    // 2. Browser Best-Effort
    else {
        // RAM (Chrome/Edge only) - returns approx buckets (0.25, 0.5, 1, 2, 4, 8)
        if ('deviceMemory' in navigator) {
            info.memory = (navigator as any).deviceMemory;
        }

        // GPU Renderer (Common WebGL hack)
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') as WebGLRenderingContext;
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    // Cleanup renderer string (e.g., "ANGLE (NVIDIA ...)")
                    info.gpuRenderer = renderer;
                }
            }
        } catch {
            // ignore
        }
    }

    return info;
};
