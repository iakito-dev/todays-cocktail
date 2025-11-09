import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('returns null when only a single page exists', () => {
    // 1ページしかない場合はレンダリング自体をスキップする仕様
    const { container } = render(<Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders boundary pages and ellipsis for long ranges', () => {
    // 総ページ数が多い場合に先頭/末尾と省略記号が出るか確認
    render(<Pagination currentPage={5} totalPages={10} onPageChange={vi.fn()} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getAllByText('More pages')).toHaveLength(2);
  });

  it('invokes onPageChange when users click links and controls', async () => {
    // 個別ページリンク・前へ・次へをクリックしたときのコールバック順序を確認
    const onPageChange = vi.fn();
    const user = userEvent.setup();

    render(<Pagination currentPage={2} totalPages={4} onPageChange={onPageChange} />);

    await user.click(screen.getByRole('link', { name: '3' }));
    await user.click(screen.getByLabelText('Go to previous page'));
    await user.click(screen.getByLabelText('Go to next page'));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 3);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(3, 3);
  });

  it('disables previous and next controls on the edges', () => {
    // 先頭/末尾では矢印が非活性になる（クリックできない）ことを担保
    const { rerender } = render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);

    const prev = screen.getByLabelText('Go to previous page');
    expect(prev).toHaveClass('pointer-events-none');
    expect(prev).toHaveClass('opacity-50');

    rerender(<Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />);
    const next = screen.getByLabelText('Go to next page');
    expect(next).toHaveClass('pointer-events-none');
    expect(next).toHaveClass('opacity-50');
  });
});
