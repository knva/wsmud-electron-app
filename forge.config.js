module.exports = {
  packagerConfig: {
    "icon": "img/icon.cio"
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    }, {
      name: '@electron-forge/maker-squirrel',
      config: {
      
      },
    },
  ],
};
