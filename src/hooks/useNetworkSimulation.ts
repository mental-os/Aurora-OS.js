import { useNetworkContext } from '@/components/NetworkContext';
import type { Network } from '@/components/NetworkContext';

export type { Network };

export function useNetworkSimulation() {
  return useNetworkContext();
}
