import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CocktailFilters } from './CocktailFilters';

// コンポーネント単体では状態を持たないため、最小限のステートラッパーを用意して双方向バインドを再現する。
const FiltersHarness = ({
  onBasesChange = vi.fn(),
  onSearchChange = vi.fn(),
}: {
  onBasesChange?: (bases: string[]) => void;
  onSearchChange?: (query: string) => void;
}) => {
  const [bases, setBases] = useState<string[]>([]);
  return (
    <CocktailFilters
      searchQuery=""
      onSearchChange={onSearchChange}
      selectedBases={bases}
      onBasesChange={(next) => {
        setBases(next);
        onBasesChange(next);
      }}
    />
  );
};

describe('CocktailFilters', () => {
  it('toggles single base selection via the buttons', async () => {
    // ボタンは単一選択（ON/OFF）として動作する想定
    const onBasesChange = vi.fn();
    const user = userEvent.setup();
    render(<FiltersHarness onBasesChange={onBasesChange} />);

    const ginButton = screen.getByRole('button', { name: /ジン/ });

    await user.click(ginButton);
    expect(onBasesChange).toHaveBeenLastCalledWith(['gin']);

    await user.click(ginButton);
    expect(onBasesChange).toHaveBeenLastCalledWith([]);
  });

  it('shows and uses the clear selection button', async () => {
    // 選択中のみ表示される「選択を解除」ボタンの挙動を確認
    const onBasesChange = vi.fn();
    const user = userEvent.setup();
    render(<FiltersHarness onBasesChange={onBasesChange} />);

    await user.click(screen.getByRole('button', { name: /ジン/ }));

    const clearButton = await screen.findByRole('button', { name: /選択を解除/ });
    await user.click(clearButton);

    expect(onBasesChange).toHaveBeenLastCalledWith([]);
  });

  it('submits trimmed search query when pressing Enter', async () => {
    // Enterキーでトリムされた文字列が親コンポーネントに渡ることを保証
    const onSearchChange = vi.fn();
    const user = userEvent.setup();

    render(
      <CocktailFilters
        searchQuery=""
        onSearchChange={onSearchChange}
        selectedBases={[]}
        onBasesChange={vi.fn()}
      />
    );

    const input = screen.getByPlaceholderText('マティーニ、Mojito、ライム...');
    await user.type(input, '  mojito  ');

    onSearchChange.mockClear();
    await user.keyboard('{Enter}');

    expect(onSearchChange).toHaveBeenCalledWith('mojito');
  });
});
