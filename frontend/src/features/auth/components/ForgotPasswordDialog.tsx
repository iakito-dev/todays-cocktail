import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { requestPasswordReset } from '../../../lib/api';

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordDialog({
  isOpen,
  onClose,
}: ForgotPasswordDialogProps) {
  const [email, setEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatusMessage('');
    setStatusType('');

    if (!email) {
      setStatusMessage('メールアドレスを入力してください');
      setStatusType('error');
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset(email);
      setStatusMessage('パスワード再設定メールを送信しました。');
      setStatusType('success');
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'メール送信に失敗しました。',
      );
      setStatusType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStatusMessage('');
    setStatusType('');
    setEmail('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        placement="raised"
        size="auth"
        className="items-stretch gap-4"
      >
        <DialogHeader className="space-y-2 text-center">
          <DialogTitle className="text-xl font-semibold text-gray-900">
            パスワードをリセット
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            登録済みのメールアドレス宛に再設定リンクを送信します。
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="reset-email">メールアドレス</Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="your@email.com"
              disabled={isSubmitting}
              required
            />
          </div>

          {statusMessage && (
            <p
              className={`text-sm rounded-lg px-3 py-2 ${
                statusType === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {statusMessage}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            {isSubmitting ? '送信中...' : 'メールを送信'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
