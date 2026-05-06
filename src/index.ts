import { uIOhook, UiohookKey } from 'uiohook-napi';
import { swap } from './swapper';

let ctrlHeld = false;
let shiftHeld = false;
let swapArmed = false;
let busy = false;

uIOhook.on('keydown', (e) => {
  if (e.keycode === UiohookKey.Ctrl) { ctrlHeld = true; return; }
  if (e.keycode === UiohookKey.Shift) { shiftHeld = true; return; }

  if (ctrlHeld && shiftHeld && e.keycode === UiohookKey.Q && !busy) {
    swapArmed = true;
  }
});

uIOhook.on('keyup', async (e) => {
  if (e.keycode === UiohookKey.Ctrl) ctrlHeld = false;
  if (e.keycode === UiohookKey.Shift) shiftHeld = false;

  if (swapArmed && !ctrlHeld && !shiftHeld && !busy) {
    swapArmed = false;
    busy = true;
    try {
      await swap();
    } finally {
      busy = false;
    }
  }
});

uIOhook.start();

console.log('Qopy is running.');
console.log('  1. Select A  →  Ctrl+C');
console.log('  2. Select B  →  Ctrl+Shift+Q  (release keys — A is pasted, B goes to clipboard)');
console.log('  3. Go to A\'s old location  →  Ctrl+V');
console.log('\nPress Ctrl+C in this terminal to quit.\n');
