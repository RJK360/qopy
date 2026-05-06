import koffi from 'koffi';

const user32 = koffi.load('user32.dll');

const SendInput = user32.func('uint32 __stdcall SendInput(uint32 cInputs, void *pInputs, int cbSize)');
const GetForegroundWindowFn = user32.func('uintptr __stdcall GetForegroundWindow()');
const GetWindowTextW = user32.func('int __stdcall GetWindowTextW(uintptr hwnd, void *lpString, int nMaxCount)');
const GetGUIThreadInfo = user32.func('bool __stdcall GetGUIThreadInfo(uint32 idThread, void *pgui)');
const SendMessageW = user32.func('intptr __stdcall SendMessageW(uintptr hwnd, uint32 Msg, uintptr wParam, intptr lParam)');

const INPUT_KEYBOARD = 1;
const KEYEVENTF_KEYUP = 0x0002;
const INPUT_SIZE = 40;

const WM_COPY = 0x0301;
const WM_PASTE = 0x0302;

// GUITHREADINFO offsets on 64-bit Windows:
// cbSize(4) + flags(4) + hwndActive(8) = 16 → hwndFocus at offset 16
const GUITHREADINFO_SIZE = 72;
const HWND_FOCUS_OFFSET = 16;

const VK: Record<string, number> = {
  CTRL: 0x11,
  C: 0x43,
  V: 0x56,
};

function makeKeyInput(vk: number, flags: number): Buffer {
  const buf = Buffer.alloc(INPUT_SIZE, 0);
  buf.writeUInt32LE(INPUT_KEYBOARD, 0);
  buf.writeUInt16LE(vk, 8);
  buf.writeUInt32LE(flags, 12);
  return buf;
}

function sendInputs(inputs: Buffer[]): number {
  const buf = Buffer.concat(inputs);
  return SendInput(inputs.length, buf, INPUT_SIZE);
}

export function simulateCtrlC(): number {
  return sendInputs([
    makeKeyInput(VK.CTRL, 0),
    makeKeyInput(VK.C, 0),
    makeKeyInput(VK.C, KEYEVENTF_KEYUP),
    makeKeyInput(VK.CTRL, KEYEVENTF_KEYUP),
  ]);
}

export function simulateCtrlV(): number {
  return sendInputs([
    makeKeyInput(VK.CTRL, 0),
    makeKeyInput(VK.V, 0),
    makeKeyInput(VK.V, KEYEVENTF_KEYUP),
    makeKeyInput(VK.CTRL, KEYEVENTF_KEYUP),
  ]);
}

export function getForegroundHwnd(): number {
  return GetForegroundWindowFn();
}

export function getWindowTitle(hwnd: number): string {
  const buf = Buffer.alloc(512, 0);
  GetWindowTextW(hwnd, buf, 256);
  return buf.toString('utf16le').replace(/\0.*$/, '');
}

export function getFocusedHwnd(): number {
  const buf = Buffer.alloc(GUITHREADINFO_SIZE, 0);
  buf.writeUInt32LE(GUITHREADINFO_SIZE, 0); // cbSize must be set before calling
  const ok = GetGUIThreadInfo(0, buf);
  if (!ok) return 0;
  return Number(buf.readBigUInt64LE(HWND_FOCUS_OFFSET));
}

// WM_COPY/WM_PASTE — works for standard Win32 EDIT controls (e.g. Notepad)
export function copyViaMessage(hwnd: number): void {
  SendMessageW(hwnd, WM_COPY, 0, 0);
}

export function pasteViaMessage(hwnd: number): void {
  SendMessageW(hwnd, WM_PASTE, 0, 0);
}
