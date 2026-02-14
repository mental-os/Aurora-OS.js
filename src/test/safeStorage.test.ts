import { describe, it, expect, beforeEach } from 'vitest';
import { safeParseLocal } from '../utils/safeStorage';

describe('safeParseLocal', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('returns null for missing key', () => {
        const res = safeParseLocal('no-such-key');
        expect(res).toBeNull();
    });

    it('parses simple JSON value', () => {
        localStorage.setItem('simple', JSON.stringify({ a: 1, b: 'x' }));
        const res = safeParseLocal<{ a: number; b: string }>('simple');
        expect(res).toEqual({ a: 1, b: 'x' });
    });

    it('strips __proto__ and prototype and constructor keys', () => {
        // We manually construct the JSON to ensure __proto__ is treated as a key in the input
        const maliciousJson = '{"good":1, "__proto__":{"injected":true}, "constructor":{"evil":true}, "prototype":{"nope":true}}';

        localStorage.setItem('mal', maliciousJson);
        const res: any = safeParseLocal('mal');
        expect(res).toBeTruthy();
        expect(res.good).toBe(1);

        // Should not have these as OWN properties
        expect(Object.prototype.hasOwnProperty.call(res, '__proto__')).toBe(false);
        expect(Object.prototype.hasOwnProperty.call(res, 'constructor')).toBe(false);
        expect(Object.prototype.hasOwnProperty.call(res, 'prototype')).toBe(false);

        // Ensure Object.prototype is not polluted

        expect(({} as any).injected).toBeUndefined();
    });

    it('handles nested malicious keys deeply', () => {
        // Manually construct JSON to ensure __proto__ is a key
        const nestedJson = '{"a": {"b": {"c": 2, "__proto__": {"pwnd": true}}}}';
        localStorage.setItem('deep', nestedJson);
        const res: any = safeParseLocal('deep');
        expect(res.a.b.c).toBe(2);
        expect(Object.prototype.hasOwnProperty.call(res.a.b, '__proto__')).toBe(false);
    });

    it('returns null on malformed JSON', () => {
        // invalid JSON
        localStorage.setItem('bad', '{ invalid: , }');
        const res = safeParseLocal('bad');
        expect(res).toBeNull();
    });

    it('sanitizes arrays and nested objects', () => {
        // Inject __proto__ into array element via string
        const json = '{"arr": [1, {"x": 2, "__proto__": {"a": 1}}], "s": "ok"}';
        localStorage.setItem('arr', json);
        const res: any = safeParseLocal('arr');
        expect(Array.isArray(res.arr)).toBe(true);
        expect(res.arr[1].x).toBe(2);
        expect(Object.prototype.hasOwnProperty.call(res.arr[1], '__proto__')).toBe(false);
    });
});
