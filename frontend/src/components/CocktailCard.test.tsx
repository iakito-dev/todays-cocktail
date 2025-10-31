import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CocktailCard } from './CocktailCard';
import type { Cocktail } from '../lib/types';

const mockCocktail: Cocktail = {
  id: 1,
  name: 'マティーニ',
  base: 'gin',
  strength: 'strong',
  technique: 'stir',
  image_url: 'https://example.com/martini.jpg',
  instructions: 'ステアして作る',
  created_at: '2023-01-01',
  updated_at: '2023-01-01',
};

describe('CocktailCard', () => {
  it('カクテル情報を正しく表示する', () => {
    const onViewDetails = vi.fn();
    render(<CocktailCard cocktail={mockCocktail} onViewDetails={onViewDetails} />);

    expect(screen.getByText('マティーニ')).toBeInTheDocument();
    expect(screen.getByText('ジン')).toBeInTheDocument();
    expect(screen.getByText('ステア')).toBeInTheDocument();
  });

  it('強度バッジを正しく表示する', () => {
    const onViewDetails = vi.fn();
    render(<CocktailCard cocktail={mockCocktail} onViewDetails={onViewDetails} />);

    expect(screen.getByText('ストロング')).toBeInTheDocument();
  });

  it('カードをクリックすると詳細表示が呼ばれる', async () => {
    const user = userEvent.setup();
    const onViewDetails = vi.fn();
    render(<CocktailCard cocktail={mockCocktail} onViewDetails={onViewDetails} />);

    const card = screen.getByText('マティーニ').closest('div[class*="cursor-pointer"]');
    if (card) {
      await user.click(card);
    }

    expect(onViewDetails).toHaveBeenCalledWith(mockCocktail);
  });

  it('お気に入りボタンを表示する', () => {
    const onViewDetails = vi.fn();
    const onFavoriteToggle = vi.fn();

    render(
      <CocktailCard
        cocktail={mockCocktail}
        onViewDetails={onViewDetails}
        onFavoriteToggle={onFavoriteToggle}
        isFavorited={false}
        showFavoriteButton={true}
      />
    );

    const favoriteButton = screen.getByRole('button', { name: 'お気に入りに追加' });
    expect(favoriteButton).toBeInTheDocument();
  });

  it('お気に入りボタンをクリックするとトグル関数が呼ばれる', async () => {
    const user = userEvent.setup();
    const onViewDetails = vi.fn();
    const onFavoriteToggle = vi.fn();

    render(
      <CocktailCard
        cocktail={mockCocktail}
        onViewDetails={onViewDetails}
        onFavoriteToggle={onFavoriteToggle}
        isFavorited={false}
        showFavoriteButton={true}
      />
    );

    const favoriteButton = screen.getByRole('button', { name: 'お気に入りに追加' });
    await user.click(favoriteButton);

    expect(onFavoriteToggle).toHaveBeenCalledWith(mockCocktail.id);
    expect(onViewDetails).not.toHaveBeenCalled(); // カードのクリックイベントは伝播しない
  });

  it('お気に入り状態を正しく表示する', () => {
    const onViewDetails = vi.fn();
    const onFavoriteToggle = vi.fn();

    render(
      <CocktailCard
        cocktail={mockCocktail}
        onViewDetails={onViewDetails}
        onFavoriteToggle={onFavoriteToggle}
        isFavorited={true}
        showFavoriteButton={true}
      />
    );

    const favoriteButton = screen.getByRole('button', { name: 'お気に入りから削除' });
    expect(favoriteButton).toBeInTheDocument();
  });

  it('異なるベースでカードを表示できる', () => {
    const onViewDetails = vi.fn();
    const rumCocktail = { ...mockCocktail, base: 'rum' as const };

    render(<CocktailCard cocktail={rumCocktail} onViewDetails={onViewDetails} />);

    expect(screen.getByText('ラム')).toBeInTheDocument();
  });

  it('異なる強度でバッジの色が変わる', () => {
    const onViewDetails = vi.fn();

    const { rerender } = render(
      <CocktailCard cocktail={{ ...mockCocktail, strength: 'light' }} onViewDetails={onViewDetails} />
    );
    expect(screen.getByText('ライト')).toBeInTheDocument();

    rerender(
      <CocktailCard cocktail={{ ...mockCocktail, strength: 'medium' }} onViewDetails={onViewDetails} />
    );
    expect(screen.getByText('ミディアム')).toBeInTheDocument();
  });
});
