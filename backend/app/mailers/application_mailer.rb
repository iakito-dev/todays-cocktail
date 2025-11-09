class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch("MAIL_FROM_ADDRESS", "noreply@todays-cocktail.local")
  layout "mailer"
end
