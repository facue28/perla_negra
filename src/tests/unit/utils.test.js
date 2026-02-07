import { describe, it, expect } from 'vitest';
import { formatPrice } from '../../lib/utils';

describe('utils.js', () => {
    describe('formatPrice', () => {
        it('formats integers correctly', () => {
            expect(formatPrice(10)).toBe('€10.00');
        });

        it('formats decimals correctly', () => {
            expect(formatPrice(10.5)).toBe('€10.50');
            expect(formatPrice(10.123)).toBe('€10.12');
            expect(formatPrice(10.999)).toBe('€11.00'); // Rounding
        });

        it('handles string inputs', () => {
            expect(formatPrice('20')).toBe('€20.00');
            expect(formatPrice('30.5')).toBe('€30.50');
        });

        it('handles zero', () => {
            expect(formatPrice(0)).toBe('€0.00');
        });

        it('handles invalid inputs gracefully', () => {
            expect(formatPrice(null)).toBe('€0.00');
            expect(formatPrice(undefined)).toBe('€0.00');
            expect(formatPrice('abc')).toBe('€0.00');
        });

        it('allows custom currency symbol', () => {
            expect(formatPrice(50, '$')).toBe('$50.00');
        });
    });
});
