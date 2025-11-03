# frozen_string_literal: true

# Resend HTTP API deliveryメソッドを登録
require Rails.root.join('lib/resend_delivery')

ActionMailer::Base.add_delivery_method :resend, ResendDelivery
