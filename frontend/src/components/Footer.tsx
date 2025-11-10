import { Github, ArrowUp } from 'lucide-react';

export const Footer = () => {
  const handleBackToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-slate-950 text-slate-100 border-t border-slate-800/60 mt-12">
      {/* 背景グラデーション */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-950 to-slate-950/95 pointer-events-none" />

      <div className="relative max-w-6xl xl:max-w-7xl mx-auto px-6 py-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-12 md:items-start">
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

          {/* 右カラム：説明・リンク・ボタン */}
          <div className="md:col-span-7 md:col-start-6 text-slate-300 md:pl-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              ご利用にあたって
            </p>
            <div className="mt-3 space-y-4 text-sm md:text-base leading-relaxed text-slate-300">
              <p>
                Today's Cocktailは、「今日だけの特別な一杯」と出会えるカクテル図鑑です。
                ベースや材料、人気順などから直感的にレシピを探せるので、
                カクテル初心者でも自分だけの定番が見つかります。
                今日の気分に合わせて、お家でもバーでも素敵なひとときをお楽しみください。
              </p>
              <p className="text-xs md:text-sm text-slate-500">
                ※掲載レシピは参考情報です。20歳未満の飲酒および飲酒運転は法律で禁止されています。
              </p>
            </div>

            <button
              type="button"
              onClick={handleBackToTop}
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20
                         px-4 py-2.5 text-sm font-medium text-white/90 backdrop-blur-sm
                         transition hover:border-white/40 hover:bg-white/10 hover:text-white"
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
              ページ上部へ戻る
            </button>
          </div>
        </div>

        {/* 下部：コピーライトとGitHubリンク */}
        <div className="mt-10 border-t border-white/10 pt-5 md:pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm text-slate-500">
          <p className="text-center md:text-left">
            © 2025 Today's Cocktail. Licensed under MIT License.
          </p>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-sm">Created by</span>
            <a
              href="https://github.com/iakito-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-white/90 hover:text-blue-300 transition"
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
