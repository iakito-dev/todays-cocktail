# frozen_string_literal: true

# URLバリデーター
# HTTP/HTTPSプロトコルのみを許可し、javascript:などの危険なプロトコルを拒否する
class UrlValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    return if value.blank?

    # URI.parseでパース可能かチェック
    uri = URI.parse(value)

    # スキームがhttpまたはhttpsのみ許可
    unless %w[http https].include?(uri.scheme&.downcase)
      record.errors.add(attribute, :invalid_url_protocol, message: "はHTTPまたはHTTPSプロトコルである必要があります")
      return
    end

    # ホストが存在するかチェック
    if uri.host.blank?
      record.errors.add(attribute, :invalid_url_format, message: "は有効なURL形式である必要があります")
    end
  rescue URI::InvalidURIError
    record.errors.add(attribute, :invalid_url_format, message: "は有効なURL形式である必要があります")
  end
end
