# Qopy

A lightweight Windows utility that lets you swap two pieces of text between any two locations with a single hotkey — no clipboard juggling required.

## How it works

1. Select **A** → `Ctrl+C`
2. Select **B** → `Ctrl+Shift+Q`
3. A is pasted where B was. B is now in your clipboard.
4. Go to where A was → `Ctrl+V`

Works in VS Code, Notepad, browsers, and most Windows apps.

## Installation

### Option 1: Download (easiest)

Download and extract `qopy-v1.0.0.zip` from the [Releases](../../releases) page, then double-click `launch-qopy.vbs` to run.

### Option 2: Build from source

Requires [Node.js](https://nodejs.org) v20+.

```bash
git clone https://github.com/YOUR_USERNAME/qopy.git
cd qopy
npm install
npm run package
```

This produces `qopy.exe` in the project folder.

## Running

- **With terminal:** `.\qopy.exe`
- **Silently (recommended):** double-click `launch-qopy.vbs`

To stop Qopy, open Task Manager and end the `qopy.exe` process.

## Auto-start on boot

1. Press `Win+R`, type `shell:startup`, press Enter
2. Drop a shortcut to `launch-qopy.vbs` in that folder

## Hotkey

| Action | Shortcut |
|--------|----------|
| Swap | `Ctrl+Shift+Q` |

## Requirements

- Windows 10 or 11
- No runtime required when using the packaged exe
