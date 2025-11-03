const { withInfoPlist } = require('@expo/config-plugins');

/**
 * Config plugin to add track player capabilities to iOS
 */
module.exports = function withTrackPlayer(config) {
  return withInfoPlist(config, (config) => {
    if (!config.modResults.UIBackgroundModes) {
      config.modResults.UIBackgroundModes = [];
    }

    // Add audio background mode if not already present
    if (!config.modResults.UIBackgroundModes.includes('audio')) {
      config.modResults.UIBackgroundModes.push('audio');
    }

    return config;
  });
};
