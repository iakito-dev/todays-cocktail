import { Github } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="text-3xl">🍸</div>
            <h3 className="text-lg font-semibold text-gray-900">Today's Cocktail</h3>
          </div>
          <p className="text-gray-600 mb-2">
            家でもバーでも、"今日の一杯"が見つかるカクテル図鑑
          </p>
          <p className="text-sm text-gray-500">
            カクテル初心者から愛好家まで、あなたにぴったりのレシピを
          </p>
        </div>

        <div className="text-center mb-6">
          <p className="text-xs text-gray-500">
            20歳未満の飲酒および飲酒運転は法律で禁止されています。
          </p>
        </div>
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div>
            © 2025 Today's Cocktail. Licensed under MIT License.
          </div>
          <div className="flex items-center gap-2">
            <span>Created by</span>
            <a
              href="https://github.com/iakito-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>iakito-dev</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
