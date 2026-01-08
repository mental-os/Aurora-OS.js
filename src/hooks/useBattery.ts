import { useState, useEffect } from "react";
import { BatteryInfo, BatteryManager } from "../types";

/**
 * Custom hook to get battery information
 * Returns null if the API is not available (Desktop PC)
 */
export function useBattery(): BatteryInfo | null {
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);

  useEffect(() => {
    let isMounted = true;
    let battery: BatteryManager | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let webBatteryListener: (() => void) | null = null;

    // Helper to update state
    const updateState = (
      level: number,
      charging: boolean,
      chargingTime: number | null,
      dischargingTime: number | null,
      extra?: {
        health?: number;
        cycleCount?: number;
        temperature?: number;
        voltage?: number;
      }
    ) => {
      if (!isMounted) return;
      setBatteryInfo({
        level,
        charging,
        chargingTime,
        dischargingTime,
        ...extra
      });
    };

    const initBattery = async (): Promise<void> => {
      try {
        // 1. Electron Strategy (Main Process via systeminformation)
        if (window.electron?.getBattery) {
          const fetchElectronBattery = async () => {
            try {
              const data = await window.electron!.getBattery();
              if (data && isMounted) {
                if (!data.hasBattery) {
                  setBatteryInfo(null);
                  return;
                }

                // Calculate health if possible
                let health = undefined;
                if ((data.designedCapacity??0) > 0 && (data.maxCapacity??0) > 0) {
                     health = Math.round((data.maxCapacity / data.designedCapacity) * 100);
                }

                updateState(
                  data.percent / 100,
                  data.isCharging,
                  null,
                  data.timeRemaining ? data.timeRemaining * 60 : null,
                  {
                      cycleCount: data.cycleCount,
                      temperature: data.temperature,
                      voltage: data.voltage,
                      health: health
                  }
                );
              }
            } catch (e) {
              console.error("Electron battery fetch failed", e);
            }
          };

          await fetchElectronBattery();
          pollInterval = setInterval(fetchElectronBattery, 10000);
          return;
        }

        // 2. Web API Strategy (Browser / Fallback)
        if ("getBattery" in navigator) {
          const batteryPromise = (
            navigator as { getBattery?: () => Promise<BatteryManager> }
          ).getBattery?.();
          if (!batteryPromise) return;

          const batteryResult = await batteryPromise;
          if (!isMounted) return;

          battery = batteryResult as BatteryManager;

          // Define listener
          webBatteryListener = () => {
            if (battery) {
              updateState(
                 battery.level,
                 battery.charging,
                 battery.chargingTime === Infinity ? null : battery.chargingTime,
                 battery.dischargingTime === Infinity ? null : battery.dischargingTime,
                 {
                     // Web API doesn't provide detailed metrics
                     health: undefined,
                     cycleCount: undefined,
                     temperature: undefined,
                     voltage: undefined
                 }
              );
            }
          };


          // Initial update
          webBatteryListener();

          // Add event listeners
          const events = [
            "chargingchange",
            "levelchange",
            "chargingtimechange",
            "dischargingtimechange",
          ] as const;
          events.forEach((evt) =>
            battery!.addEventListener(evt, webBatteryListener!)
          );
          return;
        }
      } catch (error) {
        console.warn("Failed to get battery information:", error);
        if (isMounted) setBatteryInfo(null);
      }
    };

    initBattery();

    // Cleanup
    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
      if (battery && webBatteryListener) {
        const events = [
          "chargingchange",
          "levelchange",
          "chargingtimechange",
          "dischargingtimechange",
        ] as const;

        events.forEach((evt) => battery!.removeEventListener(evt, webBatteryListener!));
      }
    };
  }, []);

  return batteryInfo;
}
