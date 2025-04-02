const ASSET_NAMES = [
  'ship.svg',
  'bullet.svg',
  '0.png',
  '1.png',
  '2.png',
  '3.png',
  '4.png',
  '5.png',
  '6.png',
  '7.png',
  '8.png',
  '9.png',
  '10.png',
  '11.png',
  '12.png',
  '13.png',
  '14.png',
  '15.png',
  '16.png',
  '16-2.png',
  '17.png',
  '18.png',
  '19.png',
  '20.png',
  '21.png',
  '22.png',
  '23.png',
  'hook.png',
  'target.png',
  'ocean.mp3',
  'speed.png',
  'sonar.png',
  'sonar2.svg',
  'sonar3.svg',
  'splash0.svg',
  'splash1.svg',
  'oceansky.mp3',
  'splash.mp3',
  'salmonsd.png',
  'defense.png',
  'terrain.png',
  'food.png',
  'algae.png',
  'beaverdam.png',
  'hammerheadwall.svg',
  'hammerheadaoe.svg',
  'attack.png',
  'ssb.svg',
  'ssb2.svg',
  'mantispunch1.png',
  'mantispunch2.png',
  'stun.png',
  'lionfishblast.png',
  'barb.png',
];

const assets = {};

const downloadPromise = Promise.all(ASSET_NAMES.map(downloadAsset));

function downloadAsset(assetName) {
  /*
  if (ASSET_NAMES.includes(assetName)) {
  if (assetName.indexOf(".mp3") != -1) {
    return new Promise(resolve => {
      const asset = new Audio();
        console.log(`Downloaded ${assetName}`);
        asset.src = `/assets/${assetName}`;
        assets[assetName] = asset;
        resolve();
    });
  } else {
  return new Promise(resolve => {
    const asset = new Image();
    asset.onload = () => {
      console.log(`Downloaded ${assetName}`);
      assets[assetName] = asset;
      resolve();
    };
    asset.src = `/assets/${assetName}`;
  });
}
  } else {
    return false
  }
    */
}

export const downloadAssets = () => downloadPromise;

export const getAsset = assetName => assets[assetName];
