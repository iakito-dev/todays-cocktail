# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TranslationService, type: :service do
  # ChatGPT 経由の翻訳ロジックをモックしながら、例外ハンドリングや整形処理まで確認する
  subject(:service) { described_class.new }

  let(:client) { instance_double(OpenAI::Client) }
  let(:responses_api) { instance_double('OpenAIResponses') }
  let(:original_openai_key) { ENV['OPENAI_API_KEY'] }

  before do
    # OpenAI クライアントを丸っとダブル化して、外部APIを一切叩かないようにする
    ENV['OPENAI_API_KEY'] = 'test-key'
    allow(OpenAI::Client).to receive(:new).and_return(client)
    allow(client).to receive(:responses).and_return(responses_api)
  end

  after do
    ENV['OPENAI_API_KEY'] = original_openai_key
  end

  # Responses API の戻り値は {"output_text" => ["..."]} という形なので
  # 同じ構造を生成するヘルパーを用意してテストを読みやすくする
  def build_output(text)
    { 'output_text' => [ text ] }
  end

  describe '#translate_cocktail_name' do
    it 'returns nil without hitting the API when name is blank' do
      expect(responses_api).not_to receive(:create)
      expect(service.translate_cocktail_name(nil)).to be_nil
    end

    it 'returns translated text when the API succeeds' do
      # OpenAI から想定どおりの文字列が返れば、そのまま値が返却される
      allow(responses_api).to receive(:create).and_return(build_output('モヒート'))

      expect(service.translate_cocktail_name('Mojito')).to eq('モヒート')
    end

    it 'returns nil when the API raises an error' do
      # 例外を握りつぶして nil を返すことで呼び出し元がフォールバックできる
      allow(responses_api).to receive(:create).and_raise(StandardError, 'boom')

      expect(service.translate_cocktail_name('Mojito')).to be_nil
    end
  end

  describe '#determine_base' do
    it 'returns vodka immediately when ingredient list is blank' do
      expect(responses_api).not_to receive(:create)
      expect(service.determine_base([])).to eq('vodka')
    end

    it 'normalizes valid responses from the API' do
      # 余計な空白や大文字小文字を削って enum key にフィットさせる挙動を検証
      allow(responses_api).to receive(:create).and_return(build_output(' Gin '))

      expect(service.determine_base([ 'Gin', 'Vermouth' ])).to eq('gin')
    end

    it 'falls back to vodka when API returns an unsupported base' do
      # モデル外の値が返ってきても既定の 'vodka' で壊れないことを担保
      allow(responses_api).to receive(:create).and_return(build_output('cachaça'))

      expect(service.determine_base([ 'Cachaça' ])).to eq('vodka')
    end
  end

  describe '#determine_strength' do
    it 'short-circuits to light for non alcoholic cocktails' do
      expect(responses_api).not_to receive(:create)
      expect(service.determine_strength('Virgin Mojito', [], 'Non alcoholic')).to eq('light')
    end

    it 'maps Japanese intensity labels to enum keys' do
      # GPT から日本語で返るケースを想定し、enum へマッピングできるかを検証
      strength_payload = {
        name: 'ネグローニ',
        intensity: 'ストロング',
        reason: '高アルコールのスピリッツが主体'
      }.to_json
      allow(responses_api).to receive(:create).and_return(build_output(strength_payload))

      expect(service.determine_strength('Negroni', %w[gin vermouth campari])).to eq('strong')
    end
  end

  describe '#translate_ingredients_batch' do
    it 'returns translated names split by line' do
      # バッチ翻訳結果は改行区切りで返るので、split して配列にする仕様を確認
      allow(responses_api).to receive(:create).and_return(build_output("ジン\nトニック\nライム"))

      result = service.translate_ingredients_batch([ 'Gin', 'Tonic', 'Lime' ])
      expect(result).to eq([ 'ジン', 'トニック', 'ライム' ])
    end

    it 'returns an empty array when the API fails' do
      # API 失敗時でも例外を上げずに空配列を返すことで呼び出し元が安全になる
      allow(responses_api).to receive(:create).and_raise(StandardError, 'timeout')

      expect(service.translate_ingredients_batch([ 'Gin' ])).to eq([])
    end
  end

  describe '#translate_measure' do
    it 'returns nil when translation raises an error' do
      allow(service).to receive(:translate).and_raise(TranslationService::TranslationError, 'boom')

      expect(service.translate_measure('1 oz')).to be_nil
    end
  end

  describe '#extract_output_text' do
    # Responses API から返ってくる複雑な JSON からテキストを拾うプライベートメソッド。
    # ここは地味だが壊れると全部の翻訳が nil になるので、形を固定しておく。
    it 'collects text from output arrays' do
      response = {
        'output' => [
          {
            'content' => [
              { 'type' => 'output_text', 'text' => 'line1' },
              { 'type' => 'output_text', 'text' => 'line2' }
            ]
          }
        ]
      }

      expect(service.send(:extract_output_text, response)).to eq("line1line2")
    end

    it 'falls back to choices content when provided' do
      response = {
        'choices' => [
          { 'message' => { 'content' => 'fallback text' } }
        ]
      }

      expect(service.send(:extract_output_text, response)).to eq('fallback text')
    end
  end
end
