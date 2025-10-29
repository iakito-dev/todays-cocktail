export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-16">
      <div className="container mx-auto px-4 text-center">
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
    </footer>
  );
};
