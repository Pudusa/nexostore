import { cn, formatPrice } from '@/lib/utils';

describe('Utils', () => {
  // Pruebas para la función cn
  describe('cn', () => {
    it('should merge class names correctly', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
    });

    it('should handle conditional classes', () => {
      const isActive = true;
      const hasError = false;
      expect(cn('base', isActive && 'active', hasError && 'error')).toBe('base active');
    });

    it('should override conflicting classes from tailwind-merge', () => {
      // tailwind-merge should resolve p-4 and p-2 to the last one, p-2
      expect(cn('p-4', 'p-2')).toBe('p-2');
      // tailwind-merge should resolve bg-red-500 and bg-blue-500 to the last one
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
    });
  });

  // Pruebas para la función formatPrice
  describe('formatPrice', () => {
    it('should format a number into a USD currency string', () => {
      expect(formatPrice(100)).toBe('$100.00');
    });

    it('should handle decimal values correctly', () => {
      expect(formatPrice(99.99)).toBe('$99.99');
    });

    it('should handle zero', () => {
      expect(formatPrice(0)).toBe('$0.00');
    });

    it('should handle large numbers', () => {
      expect(formatPrice(1234567.89)).toBe('$1,234,567.89');
    });
  });
});
