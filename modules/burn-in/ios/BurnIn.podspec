Pod::Spec.new do |s|
  s.name           = 'BurnIn'
  s.version        = '0.1.0'
  s.summary        = 'Captions burned into a video'
  s.description    = 'Rasterises the draw list JavaScript laid out and muxes it over the source video.'
  s.author         = 'Wordburn'
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.frameworks = 'AVFoundation', 'CoreImage', 'CoreText', 'CoreMedia', 'CoreVideo'

  # The caption fonts are not here: a pod cannot reach outside its own directory,
  # so plugins/with-bundled-models.js puts `assets/fonts` in the app bundle and
  # CaptionPainter opens them from there by file name.
  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
