# frozen_string_literal: true
# encoding: utf-8

# Set default external encoding to UTF-8 before any requires
Encoding.default_external = Encoding.find("UTF-8")
Encoding.default_internal = Encoding.find("UTF-8")

# Set stdout/stderr encoding to UTF-8
$stdout.set_encoding(Encoding::UTF_8) if $stdout.respond_to?(:set_encoding)
$stderr.set_encoding(Encoding::UTF_8) if $stderr.respond_to?(:set_encoding)
$stdin.set_encoding(Encoding::UTF_8) if $stdin.respond_to?(:set_encoding)

ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

require "bundler/setup" # Set up gems listed in the Gemfile.

# Disable bootsnap in test environment to avoid encoding issues
unless ENV["DISABLE_BOOTSNAP"]
  begin
    require "bootsnap/setup" # Speed up boot time by caching expensive operations.
  rescue Encoding::CompatibilityError
    # If bootsnap fails due to encoding, disable it
    ENV["DISABLE_BOOTSNAP"] = "1"
  end
end
