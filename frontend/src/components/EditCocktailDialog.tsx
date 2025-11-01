import { useState, useEffect } from 'react';
import type { Cocktail } from '../lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { updateCocktail, type UpdateCocktailRequest } from '../lib/api';

interface EditCocktailDialogProps {
  cocktail: Cocktail;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedCocktail: Cocktail) => void;
}

export function EditCocktailDialog({
  cocktail,
  isOpen,
  onClose,
  onSuccess,
}: EditCocktailDialogProps) {
  const [formData, setFormData] = useState({
    name: cocktail.name || '',
    name_ja: cocktail.name_ja || '',
    glass: cocktail.glass || '',
    glass_ja: cocktail.glass_ja || '',
    description: cocktail.description || '',
    instructions: cocktail.instructions || '',
    instructions_ja: cocktail.instructions_ja || '',
    image_url_override: cocktail.image_url_override || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ダイアログが開かれたとき、またはカクテルが変更されたときにフォームデータを更新
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: cocktail.name || '',
        name_ja: cocktail.name_ja || '',
        glass: cocktail.glass || '',
        glass_ja: cocktail.glass_ja || '',
        description: cocktail.description || '',
        instructions: cocktail.instructions || '',
        instructions_ja: cocktail.instructions_ja || '',
        image_url_override: cocktail.image_url_override || '',
      });
      setError(null);
    }
  }, [isOpen, cocktail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const requestData: UpdateCocktailRequest = {
        cocktail: {
          name: formData.name,
          name_ja: formData.name_ja,
          glass: formData.glass,
          glass_ja: formData.glass_ja,
          description: formData.description,
          instructions: formData.instructions,
          instructions_ja: formData.instructions_ja,
          image_url_override: formData.image_url_override || undefined,
        },
      };

      const updatedCocktail = await updateCocktail(cocktail.id, requestData);
      onSuccess(updatedCocktail);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">カクテル情報を編集</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">名前（英語）</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name_ja">名前（日本語）</Label>
              <Input
                id="name_ja"
                value={formData.name_ja}
                onChange={(e) => setFormData({ ...formData, name_ja: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="glass">グラス（英語）</Label>
              <Input
                id="glass"
                value={formData.glass}
                onChange={(e) => setFormData({ ...formData, glass: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="glass_ja">グラス（日本語）</Label>
              <Input
                id="glass_ja"
                value={formData.glass_ja}
                onChange={(e) => setFormData({ ...formData, glass_ja: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url_override">画像URL（手動設定）</Label>
            <Input
              id="image_url_override"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={formData.image_url_override}
              onChange={(e) => setFormData({ ...formData, image_url_override: e.target.value })}
            />
            <p className="text-sm text-gray-500">
              画像URLを指定すると、自動取得した画像より優先して表示されます
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明文</Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="カクテルの特徴や魅力を説明してください"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">作り方（英語）</Label>
            <Textarea
              id="instructions"
              rows={4}
              value={formData.instructions}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, instructions: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions_ja">作り方（日本語）</Label>
            <Textarea
              id="instructions_ja"
              rows={4}
              value={formData.instructions_ja}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, instructions_ja: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
