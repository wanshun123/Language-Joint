/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'webrtc-translate',
    environment: environment,
    baseURL: '/',
    locationType: 'auto',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    },

    GOOGLE_TRANSLATE_API_KEY: process.env.GOOGLE_TRANSLATE_API_KEY
  };

  if (environment === 'development') {
    ENV.HOST = 'http://localhost:3000';
    // ENV.APP.LOG_RESOLVER = true;
    ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    ENV.APP.LOG_VIEW_LOOKUPS = true;

    ENV.SIGNALMASTER = {
      HOST: 'https://languagejoint.com:8890',
      PORT: '8890',
      FORCE_CONNECTION: true
    };

    ENV.contentSecurityPolicy = {
      'default-src': "'none'",
      'script-src': "'self' simplewebrtc.com www.google-analytics.com www.googleapis.com 'unsafe-inline'",
      'style-src': "'self' maxcdn.bootstrapcdn.com 'unsafe-inline'",
      'font-src': "'self' data: maxcdn.bootstrapcdn.com",
      'img-src': "'self' camo.githubusercontent.com www.google-analytics.com",
      'connect-src': "'self' simplewebrtc.com http://localhost:3000 http://localhost:8888/ ws://localhost:8888/ 'unsafe-inline'",
      'media-src': "'self' blob:",
      'object-src': "'self'"
    };
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.HOST = '';

    ENV.SIGNALMASTER = {
      HOST: 'https://languagejoint.com:8890',
      PORT: '8890',
      FORCE_CONNECTION: true
    };

    ENV.contentSecurityPolicy = {
      'default-src': "'none'",
      'script-src': "'self' simplewebrtc.com www.google-analytics.com www.googleapis.com 'unsafe-inline'",
      'style-src': "'self' maxcdn.bootstrapcdn.com 'unsafe-inline'",
      'font-src': "'self' data: maxcdn.bootstrapcdn.com",
      'img-src': "'self' camo.githubusercontent.com www.google-analytics.com",
      'connect-src': "'self' simplewebrtc.com http://localhost:3000 http://198.187.30.127:8888 ws://198.187.30.127:8888 'unsafe-inline'",
      // 'connect-src': "'self' simplewebrtc.com http://localhost:3000 http://localhost:8888 ws://localhost:8888 'unsafe-inline'",
      'media-src': "'self' blob:",
      'object-src': "'self'"
    };

    // ENV.contentSecurityPolicy = {
    //   'default-src': "'none'",
    //   'script-src': "'self' 'unsafe-inline' simplewebrtc.com www.google-analytics.com www.googleapis.com",
    //   'style-src': "'self' 'unsafe-inline' maxcdn.bootstrapcdn.com",
    //   'font-src': "'self' data: maxcdn.bootstrapcdn.com",
    //   'img-src': "'self' camo.githubusercontent.com www.google-analytics.com",
    //   'connect-src': "'self' https://webrtc-translate-signalmaster.herokuapp.com wss://webrtc-translate-signalmaster.herokuapp.com",
    //   'media-src': "'self' blob:",
    //   'object-src': "'self'"
    // };
  }

  return ENV;
};
