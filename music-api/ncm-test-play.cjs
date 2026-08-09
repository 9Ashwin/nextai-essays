const { song_url_v1 } = require('NeteaseCloudMusicApi');
const fs = require('fs');

(async () => {
  const cookie = fs.readFileSync('/tmp/ncm-cookie.txt', 'utf8').trim();
  console.log('cookie 长度:', cookie.length, '| MUSIC_U:', cookie.includes('MUSIC_U'));
  for (const id of [1973665667, 1331001514, 277382]) {
    try {
      const p = await song_url_v1({ id, br: 128000, cookie });
      console.log(`\n=== ${id} ===`);
      console.log('body:', JSON.stringify(p.body).substring(0, 400));
    } catch (e) {
      console.log(`\n=== ${id} ERR ===`, e.message);
    }
  }
})();
