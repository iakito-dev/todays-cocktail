import { useCallback, useEffect, useRef, useState } from 'react';
import type { TouchEvent } from 'react';

const MAX_DRAG_DISTANCE = 360;
const CLOSE_THRESHOLD = 150;

interface SwipeToCloseOptions {
  onClose: () => void;
}

// =======================================
// Hook
// =======================================
// モバイル向けに下方向スワイプでモーダルを閉じる動作を提供する
export const useSwipeToClose = ({ onClose }: SwipeToCloseOptions) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<number | null>(null);
  const lastTouchRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const translateYRef = useRef(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // 生のドラッグ距離をイージングして自然な移動量に変換
  const getEasedDistance = useCallback((distance: number) => {
    if (distance <= 0) return 0;
    const clamped = Math.min(distance, MAX_DRAG_DISTANCE);
    const progress = clamped / MAX_DRAG_DISTANCE;
    return (1 - Math.pow(1 - progress, 2.2)) * MAX_DRAG_DISTANCE;
  }, []);

  // requestAnimationFrameでtranslate更新をスロットリング
  const scheduleTranslate = useCallback((value: number) => {
    translateYRef.current = value;
    if (typeof window === 'undefined') {
      setTranslateY(value);
      return;
    }
    if (animationFrameRef.current) return;
    animationFrameRef.current = window.requestAnimationFrame(() => {
      setTranslateY(translateYRef.current);
      animationFrameRef.current = null;
    });
  }, []);

  // アンマウント時に余っているanimation frameを解放
  useEffect(() => {
    return () => {
      if (animationFrameRef.current && typeof window !== 'undefined') {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // スクロール位置が最上部のときのみスワイプを開始
  const handleTouchStart = useCallback((e: TouchEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;
    if (scrollRef.current.scrollTop === 0) {
      lastTouchRef.current = null;
      touchStartRef.current = e.targetTouches[0].clientY;
      setIsDragging(true);
    }
  }, []);

  // 指の移動量に応じてモーダルを追従させる
  const handleTouchMove = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (touchStartRef.current === null) return;
      const currentTouch = e.targetTouches[0].clientY;
      lastTouchRef.current = currentTouch;
      const distance = currentTouch - (touchStartRef.current ?? 0);
      if (distance > 0) {
        if (distance > 6) {
          e.preventDefault();
        }
        scheduleTranslate(getEasedDistance(distance));
      } else {
        scheduleTranslate(0);
      }
    },
    [getEasedDistance, scheduleTranslate],
  );

  // ジェスチャー終了時にstateを初期化
  const resetGesture = useCallback(() => {
    setIsDragging(false);
    touchStartRef.current = null;
    lastTouchRef.current = null;
  }, []);

  // 規定距離以上ドラッグされたらモーダルを閉じる
  const handleTouchEnd = useCallback(() => {
    const start = touchStartRef.current;
    const end = lastTouchRef.current;
    resetGesture();
    if (start !== null && end !== null) {
      const distance = end - start;
      if (distance > CLOSE_THRESHOLD) {
        onClose();
        scheduleTranslate(0);
        return;
      }
    }
    scheduleTranslate(0);
  }, [onClose, resetGesture, scheduleTranslate]);

  return {
    scrollRef,
    dialogRef,
    translateY,
    isDragging,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel: handleTouchEnd,
  };
};
