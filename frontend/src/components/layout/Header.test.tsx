import type { Mock } from 'vitest';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';
import { useAuth } from '../../hooks/useAuth';

// HeaderはuseAuthに強く依存するため、フックごとモック化してシナリオを切り替える。
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

const mockUseAuth = useAuth as unknown as Mock;

// ルーター配下で描画し、Link/Router要素の警告を避ける
const renderHeader = () =>
  render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens auth dialog and calls login via useAuth handler', async () => {
    // 未ログイン時にダイアログを開き、フォーム送信でloginが呼ばれるか
    const loginMock = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      login: loginMock,
      signup: vi.fn(),
      logout: vi.fn(),
      isLoading: false,
    });

    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByRole('button', { name: /ログイン/ }));

    const emailInput = await screen.findByLabelText('メールアドレス');
    await user.type(emailInput, 'header@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'pa55word');

    const submitButton = screen
      .getAllByRole('button', { name: 'ログイン' })
      .find((button) => (button as HTMLButtonElement).type === 'submit');

    if (!submitButton) {
      throw new Error('Login submit button not found');
    }

    await user.click(submitButton);

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith('header@example.com', 'pa55word');
    });

    await waitFor(() => {
      expect(screen.queryByLabelText('メールアドレス')).not.toBeInTheDocument();
    });
  });

  it('shows authenticated UI and triggers logout', async () => {
    // ログイン済みユーザーには名前とログアウトボタンが出ること、クリックでlogoutが動くこと
    const logoutMock = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      user: {
        id: 1,
        email: 'user@example.com',
        name: 'カクテル太郎',
        admin: false,
      },
      isAuthenticated: true,
      login: vi.fn(),
      signup: vi.fn(),
      logout: logoutMock,
      isLoading: false,
    });

    const user = userEvent.setup();
    renderHeader();

    expect(screen.getByText('カクテル太郎')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /ログアウト/ }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });
});
