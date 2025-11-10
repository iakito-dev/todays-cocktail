import { Github, ArrowUp } from 'lucide-react';

// =======================================
// BackToTopButton コンポーネント
// =======================================
const BackToTopButton = () => {
  const handleBackToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <button
      type="button"
      onClick={handleBackToTop}
      className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10
                 px-5 py-2.5 text-sm font-medium text-slate-200 backdrop-blur-sm
                 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
    >
      <ArrowUp className="h-4 w-4" aria-hidden />
      ページ上部へ戻る
    </button>
  );
};

// =======================================
// Footer コンポーネント
// =======================================
export const Footer = () => {
  return (
    <footer className="relative bg-slate-950 text-slate-100 border-t border-slate-800/60 mt-16">
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-950 to-slate-950/95 pointer-events-none" />

      <div className="relative max-w-6xl xl:max-w-7xl mx-auto px-6 py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-12 md:items-start">
          {/* 左カラム：ブランド部分 */}
          <div className="md:col-span-5 flex items-start gap-4">
            <div className="text-4xl select-none">🍸</div>
            <div>
              <h3 className="text-xl font-semibold text-white tracking-tight">
                Today's Cocktail
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                今日の一杯が見つかるカクテル検索アプリ
              </p>
            </div>
          </div>

          {/* 右カラム：説明文・ボタン */}
          <div className="md:col-span-7 md:col-start-6 text-slate-300 md:pl-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              今日の気分にぴったりな一杯を。
            </p>

            <div className="mt-3 space-y-3 sm:space-y-4 text-sm md:text-base leading-relaxed text-slate-300">
              <p>
                Today's Cocktail
                は、カクテルをもっと身近に楽しむためのレシピ図鑑です。
                <span className="hidden md:inline">
                  <br />
                </span>
                お家でもバーでも、自分だけの“今日の一杯”を見つけてください。
              </p>
              <p className="text-xs md:text-sm text-slate-500">
                ※20歳未満の飲酒および飲酒運転は法律で禁止されています。
              </p>
            </div>

            <BackToTopButton />
          </div>
        </div>

        {/* 下部コピーライト */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm text-slate-500">
          <p className="text-center md:text-left text-slate-500">
            © 2025 Today's Cocktail. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-sm">Created by</span>
            <a
              href="https://github.com/iakito-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-200 hover:text-blue-300 transition"
              aria-label="iakito-dev の GitHub プロフィール"
            >
              <Github className="h-4 w-4" aria-hidden />
              <span>iakito-dev</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
