module.exports = {
  pwa: {
    name: 'MeBobba', // Assurez-vous que le nom est correctement défini ici
    themeColor: '#ffffff',
    msTileColor: '#ffffff',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: './src/service-worker.js',
      swDest: 'service-worker.js',
    },
  },
};
