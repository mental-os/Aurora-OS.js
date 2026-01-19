import { describe, it, expect } from 'vitest';
import { isValidIP, validateNetworkConfig } from './networkValidation';

describe('Network Validation', () => {
  describe('isValidIP', () => {
    it('validates correct IPv4 addresses', () => {
      expect(isValidIP('192.168.1.1')).toBe(true);
      expect(isValidIP('10.0.0.1')).toBe(true);
      expect(isValidIP('172.16.0.1')).toBe(true);
      expect(isValidIP('8.8.8.8')).toBe(true);
      expect(isValidIP('255.255.255.255')).toBe(true);
      expect(isValidIP('0.0.0.0')).toBe(true);
    });

    it('rejects invalid IP formats', () => {
      expect(isValidIP('192.168.1')).toBe(false);          // Missing octet
      expect(isValidIP('192.168.1.1.1')).toBe(false);      // Too many octets
      expect(isValidIP('192.168.1.a')).toBe(false);        // Non-numeric
      expect(isValidIP('192.168.-1.1')).toBe(false);       // Negative number
      expect(isValidIP('')).toBe(false);                   // Empty string
      expect(isValidIP('not an ip')).toBe(false);          // Random text
    });

    it('rejects IP addresses with octets out of range', () => {
      expect(isValidIP('256.168.1.1')).toBe(false);        // First octet > 255
      expect(isValidIP('192.256.1.1')).toBe(false);        // Second octet > 255
      expect(isValidIP('192.168.256.1')).toBe(false);      // Third octet > 255
      expect(isValidIP('192.168.1.256')).toBe(false);      // Fourth octet > 255
      expect(isValidIP('300.300.300.300')).toBe(false);    // All octets > 255
    });
  });

  describe('validateNetworkConfig', () => {
    it('validates a correct network configuration', () => {
      const config = {
        ip: '192.168.1.100',
        gateway: '192.168.1.1',
        subnetMask: '255.255.255.0',
        dns: '8.8.8.8'
      };
      const result = validateNetworkConfig(config);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('detects invalid IP address', () => {
      const config = {
        ip: '192.168.1.256',  // Invalid IP
        gateway: '192.168.1.1',
        subnetMask: '255.255.255.0',
        dns: '8.8.8.8'
      };
      const result = validateNetworkConfig(config);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('invalidIP');
    });

    it('detects invalid gateway', () => {
      const config = {
        ip: '192.168.1.100',
        gateway: 'invalid.gateway',  // Invalid gateway
        subnetMask: '255.255.255.0',
        dns: '8.8.8.8'
      };
      const result = validateNetworkConfig(config);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('invalidGateway');
    });

    it('detects gateway not in same subnet', () => {
      const config = {
        ip: '192.168.1.100',
        gateway: '192.168.2.1',       // Different subnet
        subnetMask: '255.255.255.0',
        dns: '8.8.8.8'
      };
      const result = validateNetworkConfig(config);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('gatewayNotInSubnet');
    });

    it('validates gateway in same subnet with different subnet mask', () => {
      const config = {
        ip: '192.168.0.100',
        gateway: '192.168.1.1',
        subnetMask: '255.255.254.0',  // /23 subnet mask
        dns: '8.8.8.8'
      };
      const result = validateNetworkConfig(config);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('detects invalid DNS server', () => {
      const config = {
        ip: '192.168.1.100',
        gateway: '192.168.1.1',
        subnetMask: '255.255.255.0',
        dns: '8.8.8.300'  // Invalid DNS
      };
      const result = validateNetworkConfig(config);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('invalidDNS');
    });
  });
});
