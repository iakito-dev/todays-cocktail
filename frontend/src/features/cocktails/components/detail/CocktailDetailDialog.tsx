import { useEffect, useMemo, useState } from 'react';
import type { Cocktail } from '../../../../lib/types';
import { Dialog, DialogContent } from '../../../../components/ui/dialog';
import { Skeleton } from '../../../../components/ui/skeleton';
import { EditCocktailDialog } from '../EditCocktailDialog';
import { useAuth } from '../../../../hooks/useAuth';
import { useSwipeToClose } from './useSwipeToClose';
import { CocktailDetailHeader } from './CocktailDetailHeader';
import { CocktailDetailLeftColumn } from './CocktailDetailLeftColumn';
import { CocktailDetailRightColumn } from './CocktailDetailRightColumn';
import {
  buildDefaultDescription,
  buildDefaultInstructions,
  getProvidedText,
} from './cocktailUtils';

// =======================================
// Props
// =======================================
// モーダル制御に必要なstate・ハンドラーを型で定義
interface CocktailDetailDialogProps {
  cocktail: Cocktail | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (cocktailId: number) => void;
  onUpdate?: (updatedCocktail: Cocktail) => void;
}

// =======================================
// Component
// =======================================
// カクテルの詳細情報をフルスクリーンに展示し、編集やお気に入り操作も内包する
export function CocktailDetailDialog({
  cocktail,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onUpdate,
}: CocktailDetailDialogProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentCocktail, setCurrentCocktail] = useState<Cocktail | null>(
    cocktail,
  );
  const { isAdmin } = useAuth();

  const {
    scrollRef,
    dialogRef,
    translateY,
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  } = useSwipeToClose({ onClose });

  // 親コンポーネントから渡されるカクテルが変わった際にstateを同期
  useEffect(() => {
    setCurrentCocktail(cocktail);
  }, [cocktail]);

  // 編集完了時に最新データでUIを再描画し、親にも変更を伝える
  const handleUpdateSuccess = (updatedCocktail: Cocktail) => {
    setCurrentCocktail(updatedCocktail);
    onUpdate?.(updatedCocktail);
  };

  // 表示名（日本語優先）とサブタイトルをメモ化し、描画コストを抑える
  const { primaryName, secondaryName } = useMemo(() => {
    const primary = currentCocktail?.name_ja || currentCocktail?.name || '';
    const secondary =
      currentCocktail?.name && currentCocktail?.name !== primary
        ? currentCocktail.name
        : null;
    return { primaryName: primary, secondaryName: secondary };
  }, [currentCocktail]);

  // 説明文がなければデフォルトテンプレートを生成
  const noteText = useMemo(() => {
    return (
      getProvidedText(currentCocktail?.description) ??
      buildDefaultDescription(currentCocktail)
    );
  }, [currentCocktail]);

  // 作り方も同様に補完し、和文→英語→自動生成の優先順位で決定
  const instructionsText = useMemo(() => {
    return (
      getProvidedText(currentCocktail?.instructions_ja) ??
      getProvidedText(currentCocktail?.instructions) ??
      buildDefaultInstructions(currentCocktail)
    );
  }, [currentCocktail]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          ref={dialogRef}
          size="full"
          className=" w-[92vw] sm:w-[84vw] lg:w-[74vw] xl:w-[68vw] 2xl:w-[62vw] max-w-[1400px] max-h-[calc(100dvh-6rem)] flex flex-col p-2 sm:p-4 border border-slate-200 rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.12)] bg-white overflow-hidden [&>button]:hidden"
          style={{
            transform: `translate(-50%, calc(-50% + ${translateY}px))`,
            transition: isDragging
              ? 'none'
              : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease-out',
            opacity: isDragging ? 0.98 : 1,
            willChange: 'transform, opacity',
          }}
        >
          {/* ローディング状態：詳細情報がない場合はSkeletonで占位 */}
          {!currentCocktail ? (
            <div className="p-2 sm:p-6 md:p-8 space-y-6">
              <Skeleton className="h-8 sm:h-10 w-3/4 rounded-2xl" />
              <Skeleton className="h-5 sm:h-6 w-1/2 rounded-2xl" />
              <div className="flex gap-2">
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 rounded-full" />
                <Skeleton className="h-6 sm:h-8 w-16 sm:w-20 rounded-full" />
              </div>
              <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
            </div>
          ) : (
            <>
              <div className="sm:hidden flex justify-center pt-2 pb-1 shrink-0">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              {/* 詳細ヘッダー：タイトル・操作ボタン・お気に入り切り替えをまとめる */}
              <CocktailDetailHeader
                cocktail={currentCocktail}
                noteText={noteText}
                primaryName={primaryName}
                secondaryName={secondaryName}
                isFavorite={isFavorite}
                isAdmin={isAdmin}
                onClose={onClose}
                onEditClick={() => setIsEditOpen(true)}
                onToggleFavorite={onToggleFavorite}
              />

              {/* 2カラムレイアウト：左にビジュアル、右にレシピ詳細を配置 */}
              <div
                ref={scrollRef}
                className="flex-1 flex flex-col lg:flex-row bg-white overflow-y-auto lg:overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchCancel}
              >
                <CocktailDetailLeftColumn cocktail={currentCocktail} />
                <CocktailDetailRightColumn
                  cocktail={currentCocktail}
                  instructionsText={instructionsText}
                />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 管理者のみ編集ダイアログを表示 */}
      {isAdmin && currentCocktail && (
        <EditCocktailDialog
          cocktail={currentCocktail}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
}
