import { Github, ArrowUp } from 'lucide-react';

export const Footer = () => {
  const handleBackToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-100 mt-8">
      <div className="max-w-6xl xl:max-w-7xl mx-auto px-6 py-7 md:py-9">
        <div className="grid gap-6 md:grid-cols-12 md:items-start">
          <div className="md:col-span-5 flex items-start gap-3 md:gap-4">
            <div className="text-3xl md:text-4xl">🍸</div>
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-white">Today's Cocktails</h3>
              <p className="text-sm md:text-base text-slate-300">"今日の一杯"が見つかるカクテル検索アプリ</p>
            </div>
          </div>
          <div className="md:col-span-7 md:col-start-6 text-slate-200 md:pl-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">ご利用にあたって</p>
            <div className="mt-2 space-y-4 text-sm md:text-base leading-relaxed">
              <p>
                Today's Cocktailsは、「あなただけの特別な一杯」と出会えるカクテル図鑑です。ベースや材料、人気順などから直感的にレシピを探せるので、カクテル初心者でも自分だけの定番が見つかります。今日の気分に合わせて、お家でもバーでも特別なひとときをお楽しみください。
              </p>
              <p className="text-xs md:text-sm text-slate-400">
                ※掲載レシピは参考情報です。20歳未満の飲酒および飲酒運転は法律で禁止されています。
              </p>
            </div>
            <button
              type="button"
              onClick={handleBackToTop}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/10"
            >
              <ArrowUp className="h-4 w-4" aria-hidden />
              ページ上部へ
            </button>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4 md:pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs md:text-sm text-slate-400">
          <p className="text-center md:text-left">© 2025 Today's Cocktails. Licensed under MIT License.</p>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-sm">Created by</span>
            <a
              href="https://github.com/iakito-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-white transition hover:text-blue-300"
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
