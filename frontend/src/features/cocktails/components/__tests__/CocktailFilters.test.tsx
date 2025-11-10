import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CocktailFilters } from '../CocktailFilters';

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

  it('enforces single selection by replacing the active base', async () => {
    const onBasesChange = vi.fn();
    const user = userEvent.setup();
    render(<FiltersHarness onBasesChange={onBasesChange} />);

    await user.click(screen.getByRole('button', { name: /ジン/ }));
    expect(onBasesChange).toHaveBeenLastCalledWith(['gin']);

    await user.click(screen.getByRole('button', { name: /ラム/ }));
    expect(onBasesChange).toHaveBeenLastCalledWith(['rum']);
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
      />,
    );

    const input = screen.getByLabelText('カクテル名・材料名で検索');
    await user.type(input, '  mojito  ');

    onSearchChange.mockClear();
    await user.keyboard('{Enter}');

    expect(onSearchChange).toHaveBeenCalledWith('mojito');
  });
});
