# frozen_string_literal: true

# Resend HTTP API経由でメールを送信するカスタムデリバリー方法
# RenderではSMTPポートがブロックされているため、HTTP APIを使用
class ResendDelivery
  def initialize(values)
    @settings = values
  end

  def deliver!(mail)
    require "net/http"
    require "json"

    uri = URI("https://api.resend.com/emails")
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true

    request = Net::HTTP::Post.new(uri.path)
    request["Authorization"] = "Bearer #{ENV['RESEND_API_KEY']}"
    request["Content-Type"] = "application/json"

    # メール本文（HTMLまたはテキスト）
    body_content = if mail.html_part
                     { html: mail.html_part.body.decoded }
    elsif mail.text_part
                     { text: mail.text_part.body.decoded }
    else
                     { text: mail.body.decoded }
    end

    # Resend API用のペイロード
    payload = {
      from: mail.from.first,
      to: mail.to,
      subject: mail.subject
    }.merge(body_content)

    request.body = payload.to_json

    response = http.request(request)

    unless response.is_a?(Net::HTTPSuccess)
      raise "Resend API error: #{response.code} #{response.body}"
    end

    response
  end
end
