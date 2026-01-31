/**
 * Validates if a string is a valid IPv4 address
 * @param ip - The IP address string to validate
 * @returns true if valid, false otherwise
 */
export const isValidIP = (ip: string): boolean => {
  const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(ipPattern);
  if (!match) return false;

  for (let i = 1; i <= 4; i++) {
    const octet = parseInt(match[i]);
    if (octet < 0 || octet > 255) return false;
  }
  return true;
};

/**
 * Validates network configuration coherence
 * @param config - Network configuration object
 * @returns Validation result with optional error message
 */
export const validateNetworkConfig = (config: {
  ip: string;
  gateway: string;
  subnetMask: string;
  dns: string;
}): { valid: boolean; error?: string } => {
  if (!isValidIP(config.ip)) {
    return { valid: false, error: 'invalidIP' };
  }
  if (!isValidIP(config.gateway)) {
    return { valid: false, error: 'invalidGateway' };
  }
  if (!isValidIP(config.subnetMask)) {
    return { valid: false, error: 'invalidSubnetMask' };
  }
  if (!isValidIP(config.dns)) {
    return { valid: false, error: 'invalidDNS' };
  }

  // Check if gateway is in the same subnet as IP
  const ipParts = config.ip.split('.').map(Number);
  const gatewayParts = config.gateway.split('.').map(Number);
  const maskParts = config.subnetMask.split('.').map(Number);

  for (let i = 0; i < 4; i++) {
    if ((ipParts[i] & maskParts[i]) !== (gatewayParts[i] & maskParts[i])) {
      return { valid: false, error: 'gatewayNotInSubnet' };
    }
  }

  return { valid: true };
};
