import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  it('複数のクラス名を結合する', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('条件付きクラス名を適用する', () => {
    const result = cn('base-class', {
      'active-class': true,
      'inactive-class': false,
    });
    expect(result).toContain('base-class');
    expect(result).toContain('active-class');
    expect(result).not.toContain('inactive-class');
  });

  it('重複するTailwindクラスを適切にマージする', () => {
    const result = cn('px-2', 'px-4');
    // twMergeにより、後のpx-4が優先される
    expect(result).toBe('px-4');
  });

  it('falsy値を無視する', () => {
    const result = cn('text-red-500', null, undefined, false, 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('配列形式のクラス名を処理する', () => {
    const result = cn(['text-red-500', 'bg-blue-500']);
    expect(result).toBe('text-red-500 bg-blue-500');
  });
});
