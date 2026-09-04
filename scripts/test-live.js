const https = require('https');

https.get('https://www.qorelysofts.co.in/', res => {
  let b = '';
  res.on('data', c => b += c);
  res.on('end', () => {
    const idx = b.indexOf('id="products"');
    if (idx !== -1) {
      console.log('Section snippet:\n', b.slice(idx, idx + 1200));
    } else {
      console.log('id="products" not found in response');
    }
  });
}).on('error', e => console.error(e));
