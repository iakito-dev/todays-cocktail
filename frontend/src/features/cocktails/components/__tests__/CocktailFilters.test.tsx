import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CocktailFilters } from '../CocktailFilters';

// コンポーネント単体では状態を持たないため、最小限のステートラッパーを用意して双方向バインドを再現する。
const FiltersHarness = ({
  onBasesChange = vi.fn(),
  onTechniquesChange = vi.fn(),
  onStrengthsChange = vi.fn(),
  onSearchChange = vi.fn(),
  onToggleTodaysPick = vi.fn(),
}: {
  onBasesChange?: (bases: string[]) => void;
  onTechniquesChange?: (techniques: string[]) => void;
  onStrengthsChange?: (strengths: string[]) => void;
  onSearchChange?: (query: string) => void;
  onToggleTodaysPick?: (value: boolean) => void;
}) => {
  const [bases, setBases] = useState<string[]>([]);
  const [techniques, setTechniques] = useState<string[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [showPick, setShowPick] = useState(true);
  return (
    <CocktailFilters
      searchQuery=""
      onSearchChange={onSearchChange}
      selectedBases={bases}
      onBasesChange={(next) => {
        setBases(next);
        onBasesChange(next);
      }}
      selectedTechniques={techniques}
      onTechniquesChange={(next) => {
        setTechniques(next);
        onTechniquesChange(next);
      }}
      selectedStrengths={strengths}
      onStrengthsChange={(next) => {
        setStrengths(next);
        onStrengthsChange(next);
      }}
      showTodaysPick={showPick}
      onToggleTodaysPick={(value) => {
        setShowPick(value);
        onToggleTodaysPick(value);
      }}
    />
  );
};

describe('CocktailFilters', () => {
  it('toggles base selection via the buttons', async () => {
    const onBasesChange = vi.fn();
    const user = userEvent.setup();
    render(<FiltersHarness onBasesChange={onBasesChange} />);

    const ginButton = screen.getByRole('button', { name: /ジン/ });

    await user.click(ginButton);
    expect(onBasesChange).toHaveBeenLastCalledWith(['gin']);

    await user.click(ginButton);
    expect(onBasesChange).toHaveBeenLastCalledWith([]);
  });

  it('replaces base selection when choosing a different option', async () => {
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
        selectedTechniques={[]}
        onTechniquesChange={vi.fn()}
        selectedStrengths={[]}
        onStrengthsChange={vi.fn()}
      />,
    );

    const input = screen.getByLabelText('カクテル名・材料で検索');
    await user.type(input, '  mojito  ');

    onSearchChange.mockClear();
    await user.keyboard('{Enter}');

    expect(onSearchChange).toHaveBeenCalledWith('mojito');
  });

  it('allows only one technique to be active at a time', async () => {
    const onTechniquesChange = vi.fn();
    const user = userEvent.setup();
    render(<FiltersHarness onTechniquesChange={onTechniquesChange} />);

    await user.click(screen.getByRole('button', { name: /ビルド/ }));
    expect(onTechniquesChange).toHaveBeenLastCalledWith(['build']);

    await user.click(screen.getByRole('button', { name: /ステア/ }));
    expect(onTechniquesChange).toHaveBeenLastCalledWith(['stir']);
  });

  it('switches alcohol strength selection when picking another badge', async () => {
    const onStrengthsChange = vi.fn();
    const user = userEvent.setup();
    render(<FiltersHarness onStrengthsChange={onStrengthsChange} />);

    await user.click(screen.getByRole('button', { name: /ライト/ }));
    expect(onStrengthsChange).toHaveBeenLastCalledWith(['light']);

    await user.click(screen.getByRole('button', { name: /ミディアム/ }));
    expect(onStrengthsChange).toHaveBeenLastCalledWith(['medium']);
  });

  it("toggles Today's Pick visibility", async () => {
    const onToggleTodaysPick = vi.fn();
    const user = userEvent.setup();
    render(<FiltersHarness onToggleTodaysPick={onToggleTodaysPick} />);

    const button = screen.getByRole('button', { name: '今日のおすすめを表示' });
    await user.click(button);
    expect(onToggleTodaysPick).toHaveBeenLastCalledWith(false);
  });
});
