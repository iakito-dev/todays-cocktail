# Ensure request specs use an allowed host to avoid HostAuthorization 403
RSpec.configure do |config|
  config.before(:each, type: :request) do
    host! 'localhost'
  end
end
