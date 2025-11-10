import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageWithFallback } from './ImageWithFallback';

describe('ImageWithFallback', () => {
  it('正常な画像を表示する', () => {
    render(
      <ImageWithFallback
        src="https://example.com/image.jpg"
        alt="Test Image"
      />,
    );

    const img = screen.getByRole('img', { name: 'Test Image' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('画像読み込みエラー時にフォールバック画像を表示する', () => {
    render(
      <ImageWithFallback
        src="https://example.com/broken.jpg"
        alt="Test Image"
      />,
    );

    const img = screen.getByRole('img', { name: 'Test Image' });

    // エラーイベントをトリガー
    fireEvent.error(img);

    // フォールバック画像が表示される
    const fallbackImg = screen.getByRole('img', {
      name: 'Error loading image',
    });
    expect(fallbackImg).toBeInTheDocument();
  });

  it('カスタムクラス名を適用できる', () => {
    render(
      <ImageWithFallback
        src="https://example.com/image.jpg"
        alt="Test Image"
        className="custom-class"
      />,
    );

    const img = screen.getByRole('img', { name: 'Test Image' });
    expect(img).toHaveClass('custom-class');
  });

  it('カスタムスタイルを適用できる', () => {
    render(
      <ImageWithFallback
        src="https://example.com/image.jpg"
        alt="Test Image"
        style={{ width: '100px', height: '100px' }}
      />,
    );

    const img = screen.getByRole('img', { name: 'Test Image' });
    expect(img).toHaveStyle({ width: '100px', height: '100px' });
  });

  it('元のURLをdata属性として保持する', () => {
    const originalUrl = 'https://example.com/broken.jpg';
    render(<ImageWithFallback src={originalUrl} alt="Test Image" />);

    const img = screen.getByRole('img', { name: 'Test Image' });
    fireEvent.error(img);

    const fallbackImg = screen.getByRole('img', {
      name: 'Error loading image',
    });
    expect(fallbackImg).toHaveAttribute('data-original-url', originalUrl);
  });
});
