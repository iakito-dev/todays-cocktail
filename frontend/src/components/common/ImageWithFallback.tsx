import React, { useState } from 'react';

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Rya2Utd2lkdGg9IjMuNyI+PHJlY3QgeD0iMTYiIHk9IjE2IiB3aWR0aD0iNTYiIGhlaWdodD0iNTYiIHJ4PSI2Ii8+PHBhdGggZD0ibTE2IDU4IDE2LTE4IDMyIDMyIi8+PGNpcmNsZSBjeD0iNTMiIGN5PSIzNSIgcj0iNyIvPjwvc3ZnPgoK';

// =======================================
// Component
// =======================================
// 画像読み込み失敗時にフォールバックSVGを表示するシンプルなコンポーネント
export function ImageWithFallback(
  props: React.ImgHTMLAttributes<HTMLImageElement>,
) {
  const [didError, setDidError] = useState(false);

  // onErrorでプレースホルダー表示へ切り替える
  const handleError = () => {
    setDidError(true);
  };

  const {
    src,
    alt,
    style,
    className,
    loading,
    decoding,
    fetchPriority,
    ...rest
  } = props;
  // 既定で遅延読み込みを無効化（初期描画の体感改善）
  const effectiveLoading = loading ?? 'eager';
  const effectiveDecoding = decoding ?? 'async';
  const effectivePriority: React.ImgHTMLAttributes<HTMLImageElement>['fetchPriority'] =
    fetchPriority ?? (effectiveLoading === 'eager' ? 'high' : undefined);

  return didError ? (
    <div
      className={`inline-block bg-gray-100 text-center align-middle ${className ?? ''}`}
      style={style}
    >
      <div className="flex items-center justify-center w-full h-full">
        <img
          src={ERROR_IMG_SRC}
          alt="Error loading image"
          loading={effectiveLoading}
          decoding={effectiveDecoding}
          fetchPriority={effectivePriority}
          {...rest}
          data-original-url={src}
        />
      </div>
    </div>
  ) : (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={effectiveLoading}
      decoding={effectiveDecoding}
      fetchPriority={effectivePriority}
      {...rest}
      onError={handleError}
    />
  );
}
