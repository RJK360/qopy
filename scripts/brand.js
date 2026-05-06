const rcedit = require('rcedit');

rcedit('qopy.exe', {
  'product-name': 'Qopy',
  'file-description': 'Qopy - Clipboard Swap',
}).then(() => console.log('Branded qopy.exe')).catch(console.error);
