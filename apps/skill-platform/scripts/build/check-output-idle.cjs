const fs = require('node:fs/promises');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

// Electron keeps ASAR handles open. Check BEFORE electron-builder empties the
// output, otherwise a sharing violation can leave a partly deleted old build.
module.exports = async function checkOutputIdle({ appOutDir, electronPlatformName }) {
  if (process.platform !== 'win32' || electronPlatformName !== 'win32') return;
  try {
    await fs.access(appOutDir);
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  const script = `
    $ErrorActionPreference = 'Stop'
    $files = Get-ChildItem -LiteralPath $env:MOMO_PACK_OUTPUT_CHECK -Recurse -File -Force
    foreach ($file in $files) {
      try {
        $handle = [System.IO.File]::Open($file.FullName, [System.IO.FileMode]::Open, [System.IO.FileAccess]::Read, [System.IO.FileShare]::None)
        $handle.Dispose()
      } catch {
        [Console]::Error.WriteLine('Output file in use or unreadable: ' + $file.FullName)
        exit 1
      }
    }
  `;
  try {
    await promisify(execFile)(
      'powershell.exe',
      [
        '-NoProfile',
        '-NonInteractive',
        '-EncodedCommand',
        Buffer.from(script, 'utf16le').toString('base64'),
      ],
      {
        windowsHide: true,
        timeout: 30000,
        env: { ...process.env, MOMO_PACK_OUTPUT_CHECK: appOutDir },
      },
    );
  } catch (error) {
    throw new Error(
      `打包输出仍被占用或不可读取，已在清理前停止。请关闭该目录启动的 AIM 后重试，或指定新的输出目录。\n${error.stderr || error.message}`,
    );
  }
};
