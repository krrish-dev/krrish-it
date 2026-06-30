import { constants } from 'node:fs';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fontsDir = resolve(rootDir, 'public', 'fonts');

const assets = [
  {
    label: 'Noto Kufi Arabic variable font',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/notokufiarabic/NotoKufiArabic%5Bwght%5D.ttf',
    path: resolve(fontsDir, 'noto-kufi-arabic-variable.ttf'),
    binary: true,
  },
  {
    label: 'Noto Kufi Arabic OFL license',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/notokufiarabic/OFL.txt',
    path: resolve(fontsDir, 'OFL-Noto-Kufi-Arabic.txt'),
    binary: false,
  },
];

const exists = async (path) => {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
};

const download = async ({ label, url, path, binary }) => {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'krrish-it-build-font-loader',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to download ${label}: ${response.status} ${response.statusText}`);
  }

  const content = binary ? Buffer.from(await response.arrayBuffer()) : await response.text();
  await writeFile(path, content);
  console.log(`Downloaded ${label} -> ${path}`);
};

await mkdir(fontsDir, { recursive: true });

for (const asset of assets) {
  if (await exists(asset.path)) {
    console.log(`Using existing ${asset.label} -> ${asset.path}`);
    continue;
  }

  await download(asset);
}
