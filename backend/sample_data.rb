# データの更新とサンプル追加
mohito = Cocktail.find_by(name: "モヒート")
if mohito
  mohito.update!(glass: "タンブラー")

  # 既存の材料を削除
  mohito.ingredients.destroy_all

  # 新しい材料を追加
  mohito.ingredients.create!([
    { name: "ホワイトラム", amount: "45ml" },
    { name: "ライム", amount: "1/2個" },
    { name: "ミントの葉", amount: "10枚" },
    { name: "砂糖", amount: "2tsp" },
    { name: "ソーダ", amount: "適量" }
  ])

  puts "モヒートのデータを更新しました"
end

# 他のカクテルにもサンプルデータを追加
gin_tonic = Cocktail.find_by(name: "ジントニック")
if gin_tonic
  gin_tonic.update!(glass: "タンブラー")
  gin_tonic.ingredients.create!([
    { name: "ジン", amount: "45ml" },
    { name: "トニックウォーター", amount: "適量" },
    { name: "ライム", amount: "1/4個" }
  ])
  puts "ジントニックのデータを更新しました"
end

martini = Cocktail.find_by(name: "マティーニ")
if martini
  martini.update!(glass: "カクテルグラス")
  martini.ingredients.create!([
    { name: "ジン", amount: "60ml" },
    { name: "ドライベルモット", amount: "10ml" },
    { name: "オリーブ", amount: "1個" }
  ])
  puts "マティーニのデータを更新しました"
end

puts "サンプルデータの追加が完了しました"
