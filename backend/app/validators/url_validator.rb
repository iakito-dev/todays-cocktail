# frozen_string_literal: true

# URLバリデーター
# HTTP/HTTPSプロトコルのみを許可し、javascript:などの危険なプロトコルを拒否する
class UrlValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return if value.blank?

    # まずスキームをチェック（javascript:やdata:などの危険なプロトコルを早期に検出）
    if value.include?(":")
      scheme = value.split(":").first&.downcase
      unless %w[http https].include?(scheme)
        record.errors.add(attribute, :invalid_url_protocol, message: "はHTTPまたはHTTPSプロトコルである必要があります")
        return
      end
    end

    # URI.parseでパース可能かチェック
    begin
      uri = URI.parse(value)

      # スキームがhttpまたはhttpsのみ許可（二重チェック）
      unless %w[http https].include?(uri.scheme&.downcase)
        record.errors.add(attribute, :invalid_url_protocol, message: "はHTTPまたはHTTPSプロトコルである必要があります")
        return
      end

      # ホストが存在するかチェック
      if uri.host.blank?
        record.errors.add(attribute, :invalid_url_format, message: "は有効なURL形式である必要があります")
      end
    rescue URI::InvalidURIError
      # URI.parseが失敗した場合、スキームチェックで既にエラーが追加されている可能性がある
      # まだエラーが追加されていない場合のみ、URL形式エラーを追加
      unless record.errors[attribute].any? { |e| e.type == :invalid_url_protocol }
        record.errors.add(attribute, :invalid_url_format, message: "は有効なURL形式である必要があります")
      end
    end
  end
end
