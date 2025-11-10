import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FavoriteButton } from '../FavoriteButton';

describe('FavoriteButton', () => {
  it('お気に入りでない場合、空のハートを表示する', () => {
    const onToggle = vi.fn();
    render(<FavoriteButton isFavorited={false} onToggle={onToggle} />);

    const button = screen.getByRole('button', { name: 'お気に入りに追加' });
    expect(button).toBeInTheDocument();
  });

  it('お気に入りの場合、塗りつぶしハートを表示する', () => {
    const onToggle = vi.fn();
    render(<FavoriteButton isFavorited={true} onToggle={onToggle} />);

    const button = screen.getByRole('button', { name: 'お気に入りから削除' });
    expect(button).toBeInTheDocument();
  });

  it('クリックするとonToggleが呼ばれる', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<FavoriteButton isFavorited={false} onToggle={onToggle} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('無効化されている場合、クリックできない', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <FavoriteButton
        isFavorited={false}
        onToggle={onToggle}
        disabled={true}
      />,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('イベント伝播を止める', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const onParentClick = vi.fn();

    render(
      <div onClick={onParentClick}>
        <FavoriteButton isFavorited={false} onToggle={onToggle} />
      </div>,
    );

    const button = screen.getByRole('button');
    await user.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it('異なるサイズを適用できる', () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <FavoriteButton isFavorited={false} onToggle={onToggle} size="sm" />,
    );

    let button = screen.getByRole('button');
    expect(button).toHaveClass('w-6', 'h-6');

    rerender(
      <FavoriteButton isFavorited={false} onToggle={onToggle} size="md" />,
    );
    button = screen.getByRole('button');
    expect(button).toHaveClass('w-8', 'h-8');

    rerender(
      <FavoriteButton isFavorited={false} onToggle={onToggle} size="lg" />,
    );
    button = screen.getByRole('button');
    expect(button).toHaveClass('w-10', 'h-10');
  });
});
