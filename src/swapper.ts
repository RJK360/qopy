import {
  simulateCtrlC,
  simulateCtrlV,
  getForegroundHwnd,
  getFocusedHwnd,
  copyViaMessage,
  pasteViaMessage,
} from './keys';
import { readClipboard, writeClipboard } from './clipboard';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function swap(): Promise<void> {
  const a = readClipboard();

  if (!a) return;

  const foreground = getForegroundHwnd();
  const focused = getFocusedHwnd();

  // Strategy 1: WM_COPY to focused child control (Notepad / Win32 EDIT controls)
  if (focused) {
    copyViaMessage(focused);
    const b1 = readClipboard();
    if (b1 && b1 !== a) {
      writeClipboard(a);
      pasteViaMessage(focused);
      writeClipboard(b1);
      return;
    }
  }

  // Strategy 2: WM_COPY to foreground window
  if (foreground && foreground !== focused) {
    copyViaMessage(foreground);
    const b2 = readClipboard();
    if (b2 && b2 !== a) {
      writeClipboard(a);
      pasteViaMessage(foreground);
      writeClipboard(b2);
      return;
    }
  }

  // Strategy 3: SendInput Ctrl+C (VS Code / Electron / other apps)
  simulateCtrlC();
  await sleep(300);
  const b = readClipboard();

  if (!b || b === a) {
    writeClipboard(a);
    return;
  }

  writeClipboard(a);
  await sleep(50);
  simulateCtrlV();
  await sleep(50);
  writeClipboard(b);
}
