class ApplicationMailer < ActionMailer::Base
  DEFAULT_SENDER = ENV["MAIL_FROM_ADDRESS"].presence || "onboarding@resend.dev"

  default from: DEFAULT_SENDER,
          reply_to: ENV["MAIL_REPLY_TO"].presence || DEFAULT_SENDER
  layout "mailer"
end
