import type { ComponentProps } from 'react';
import { describe, it, expect, vi, afterEach, beforeAll, afterAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthDialog } from './AuthDialog';

// 同じラベルのボタンが複数あるため、フォーム内の送信ボタンのみを抽出するヘルパー。
const getSubmitButton = (label: string) => {
  const buttons = screen.getAllByRole('button', { name: label });
  const submit = buttons.find(
    (button) =>
      (button as HTMLButtonElement).type === 'submit' && button.closest('form')
  );
  if (!submit) {
    throw new Error(`Submit button with label "${label}" not found`);
  }
  return submit as HTMLButtonElement;
};

describe('AuthDialog', () => {
  let alertSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    if (typeof window.alert !== 'function') {
      window.alert = () => {};
    }
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterAll(() => {
    alertSpy.mockRestore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // すべてのテストで共通の初期状態（常にダイアログを開く）を用意し、overrideできるようにする。
  const setup = (overrideProps: Partial<ComponentProps<typeof AuthDialog>> = {}) => {
    const props = {
      isOpen: true,
      onClose: vi.fn(),
      onLogin: vi.fn().mockResolvedValue(undefined),
      onSignup: vi.fn().mockResolvedValue(undefined),
      isLoading: false,
      ...overrideProps,
    } satisfies ComponentProps<typeof AuthDialog>;

    render(<AuthDialog {...props} />);
    return props;
  };

  it('surface login errors coming from the API', async () => {
    // APIがエラーを返した場合、ユーザーにその文言が表示されることを確認
    const props = setup({
      onLogin: vi.fn().mockRejectedValue(new Error('invalid credentials')),
    });
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('メールアドレス'), 'login@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'password123');

    await user.click(getSubmitButton('ログイン'));

    await waitFor(() => {
      expect(props.onLogin).toHaveBeenCalled();
    });

    expect(await screen.findByText('invalid credentials')).toBeInTheDocument();
  });

  it('submits login credentials and resets form state', async () => {
    // 正常ログイン後に入力フォームがリセットされる挙動を担保
    const props = setup();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('メールアドレス'), 'login@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'password123');

    await user.click(getSubmitButton('ログイン'));

    await waitFor(() => {
      expect(props.onLogin).toHaveBeenCalledWith('login@example.com', 'password123');
    });

    expect(screen.getByLabelText('メールアドレス')).toHaveValue('');
    expect(screen.getByLabelText('パスワード')).toHaveValue('');
  });

  it('shows signup error messages from the API', async () => {
    // サインアップ失敗時はアラートではなくフォーム内のエラーメッセージを使う仕様を検証
    const props = setup({
      onSignup: vi.fn().mockRejectedValue(new Error('duplicate email')),
    });
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: '新規登録' }));

    await user.type(screen.getByLabelText('ユーザー名'), 'Tester');
    await user.type(screen.getByLabelText('メールアドレス'), 'signup@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'supersafe');

    await user.click(getSubmitButton('新規登録'));

    await waitFor(() => {
      expect(props.onSignup).toHaveBeenCalled();
    });

    expect(await screen.findByText('duplicate email')).toBeInTheDocument();
    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('submits signup data, notifies user, and closes dialog', async () => {
    // サインアップ成功時にユーザー通知とダイアログのクローズが走るか確認
    const props = setup();
    const user = userEvent.setup();

    await user.click(screen.getByRole('tab', { name: '新規登録' }));

    await user.type(screen.getByLabelText('ユーザー名'), 'Tester');
    await user.type(screen.getByLabelText('メールアドレス'), 'signup@example.com');
    await user.type(screen.getByLabelText('パスワード'), 'supersafe');

    await user.click(getSubmitButton('新規登録'));

    await waitFor(() => {
      expect(props.onSignup).toHaveBeenCalledWith('signup@example.com', 'supersafe', 'Tester');
      expect(props.onClose).toHaveBeenCalled();
    });

    expect(alertSpy).toHaveBeenCalledTimes(1);
  });
});
