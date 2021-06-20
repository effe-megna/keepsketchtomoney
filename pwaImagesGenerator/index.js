const pwaAssetGenerator = require('pwa-asset-generator');

// Generate images over a module function call, instead of using CLI commands
(async () => {
  const { savedImages, htmlMeta, manifestJsonContent } = await pwaAssetGenerator.generateImages(
    'https://cdn.dribbble.com/users/942818/screenshots/15239661/media/d608d7b65260a78904723495383eb476.jpg',
    './temp',
    {
      scrape: false,
      background: "linear-gradient(to right, #2628B4 0%, #40aeb8 100%)",
      splashOnly: true,
      portraitOnly: true,
      log: false
    });
})();

// Access to static data for Apple Device specs that are used for generating launch images
const appleDeviceSpecsForLaunchImages = pwaAssetGenerator.appleDeviceSpecsForLaunchImages;