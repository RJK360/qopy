import koffi from 'koffi';

const user32 = koffi.load('user32.dll');
const kernel32 = koffi.load('kernel32.dll');
const msvcrt = koffi.load('msvcrt.dll');

const OpenClipboard = user32.func('bool __stdcall OpenClipboard(uintptr hwndNewOwner)');
const CloseClipboard = user32.func('bool __stdcall CloseClipboard()');
const EmptyClipboard = user32.func('bool __stdcall EmptyClipboard()');
const GetClipboardData = user32.func('uintptr __stdcall GetClipboardData(uint32 uFormat)');
const SetClipboardData = user32.func('uintptr __stdcall SetClipboardData(uint32 uFormat, uintptr hMem)');

const GlobalAlloc = kernel32.func('uintptr __stdcall GlobalAlloc(uint32 uFlags, uintptr dwBytes)');
const GlobalLock = kernel32.func('void* __stdcall GlobalLock(uintptr hMem)');
const GlobalUnlock = kernel32.func('bool __stdcall GlobalUnlock(uintptr hMem)');
const GlobalFree = kernel32.func('uintptr __stdcall GlobalFree(uintptr hMem)');
const GlobalSize = kernel32.func('uintptr __stdcall GlobalSize(uintptr hMem)');
const Memcpy = msvcrt.func('void* __cdecl memcpy(void *dst, void *src, uintptr count)');

const CF_UNICODETEXT = 13;
const GMEM_MOVEABLE = 0x0002;

export function readClipboard(): string {
  if (!OpenClipboard(0)) return '';
  try {
    const hMem = GetClipboardData(CF_UNICODETEXT);
    if (!hMem) return '';
    const size = GlobalSize(hMem);
    const ptr = GlobalLock(hMem);
    if (!ptr) return '';
    try {
      const buf = Buffer.alloc(size);
      Memcpy(buf, ptr, size);
      // UTF-16LE null-terminated — strip from first null terminator
      return buf.toString('utf16le').replace(/\0[\s\S]*$/, '');
    } finally {
      GlobalUnlock(hMem);
    }
  } finally {
    CloseClipboard();
  }
}

export function writeClipboard(text: string): void {
  const encoded = Buffer.from(text + '\0', 'utf16le');
  const hMem = GlobalAlloc(GMEM_MOVEABLE, encoded.length);
  if (!hMem) return;

  const ptr = GlobalLock(hMem);
  if (!ptr) { GlobalFree(hMem); return; }

  Memcpy(ptr, encoded, encoded.length);
  GlobalUnlock(hMem);

  if (!OpenClipboard(0)) { GlobalFree(hMem); return; }
  EmptyClipboard();
  const ok = SetClipboardData(CF_UNICODETEXT, hMem);
  CloseClipboard();

  // System owns hMem after successful SetClipboardData — only free on failure
  if (!ok) GlobalFree(hMem);
}
