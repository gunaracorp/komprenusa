import 'server-only';

import { createHash, randomUUID } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { Dropbox, type files } from 'dropbox';
import { exportCmsDatabaseSnapshot } from '@/lib/cms-db';
import { getDropboxClientForAdmin, isAuthRequiredError } from '@/lib/product-image-intelligence';

type DropboxUser = { id: string };

export type CmsDropboxBackupSummary = {
  fileName: string;
  sizeBytes: number;
  capturedAt: string;
  tableCount: number;
  rowCount: number;
  contentHash: string;
};

export type CmsDropboxBackupHistoryItem = {
  fileName: string;
  sizeBytes: number;
  modifiedAt: string;
};

export class CmsDropboxBackupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CmsDropboxBackupError';
  }
}

const BACKUP_FOLDER = '/Kompresa-Kompresor-CMS-Backups';
const MAX_JSON_BYTES = 32 * 1024 * 1024;
const DROPBOX_HASH_BLOCK_BYTES = 4 * 1024 * 1024;

function getDropboxStatus(error: unknown) {
  if (!error || typeof error !== 'object' || !('status' in error)) return null;
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' ? status : null;
}

function getDropboxContentHash(contents: Buffer) {
  const blockHashes: Buffer[] = [];

  for (let offset = 0; offset < contents.length; offset += DROPBOX_HASH_BLOCK_BYTES) {
    blockHashes.push(createHash('sha256').update(contents.subarray(offset, offset + DROPBOX_HASH_BLOCK_BYTES)).digest());
  }

  return createHash('sha256').update(Buffer.concat(blockHashes)).digest('hex');
}

async function ensureBackupFolder(client: Dropbox) {
  try {
    await client.filesCreateFolderV2({ path: BACKUP_FOLDER, autorename: false });
  } catch (error) {
    if (getDropboxStatus(error) !== 409) throw error;
    const existing = await client.filesGetMetadata({ path: BACKUP_FOLDER });
    if (existing.result['.tag'] !== 'folder') {
      throw new CmsDropboxBackupError('Nama folder cadangan di Dropbox sudah dipakai oleh file lain.');
    }
  }
}

export async function createCmsDropboxBackup(user: DropboxUser): Promise<CmsDropboxBackupSummary> {
  const client = await getDropboxClientForAdmin(user);
  let snapshot;
  try {
    snapshot = await exportCmsDatabaseSnapshot();
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('CMS_BACKUP_SCHEMA_MISMATCH:')) {
      throw new CmsDropboxBackupError('Struktur database berubah. Cadangan dihentikan agar tabel baru tidak terlewat; skema perlu ditinjau sebelum mencoba lagi.');
    }
    throw error;
  }

  const serialized = JSON.stringify(snapshot);
  const uncompressed = Buffer.from(serialized, 'utf8');
  if (uncompressed.byteLength > MAX_JSON_BYTES) {
    throw new CmsDropboxBackupError('Ukuran data melewati batas aman untuk satu snapshot. Cadangan belum diunggah ke Dropbox.');
  }

  const compressed = gzipSync(uncompressed, { level: 6 });
  const contentHash = getDropboxContentHash(compressed);
  const fileName = `cms-${snapshot.capturedAt.replaceAll(':', '-').replaceAll('.', '-')}-${randomUUID()}.json.gz`;
  const path = `${BACKUP_FOLDER}/${fileName}`;

  await ensureBackupFolder(client);
  const uploaded = await client.filesUpload({
    path,
    mode: { '.tag': 'add' },
    autorename: false,
    contents: compressed,
  });

  if (uploaded.result.size !== compressed.byteLength || uploaded.result.content_hash !== contentHash) {
    await client.filesDeleteV2({ path: uploaded.result.path_lower ?? path }).catch(() => undefined);
    throw new CmsDropboxBackupError('Dropbox menerima file, tetapi verifikasi ukuran atau hash tidak cocok. File tidak ditandai sebagai cadangan berhasil.');
  }

  return {
    fileName,
    sizeBytes: compressed.byteLength,
    capturedAt: snapshot.capturedAt,
    tableCount: snapshot.tables.length,
    rowCount: snapshot.tables.reduce((total, table) => total + table.rowCount, 0),
    contentHash,
  };
}

export async function getCmsDropboxBackupHistory(user: DropboxUser): Promise<CmsDropboxBackupHistoryItem[]> {
  const client = await getDropboxClientForAdmin(user);
  let response;

  try {
    response = await client.filesListFolder({ path: BACKUP_FOLDER, limit: 100 });
  } catch (error) {
    if (getDropboxStatus(error) === 409) return [];
    throw error;
  }

  const backups: CmsDropboxBackupHistoryItem[] = [];
  let page = response.result;
  let pagesRead = 0;

  while (true) {
    for (const entry of page.entries) {
      if (entry['.tag'] !== 'file') continue;
      const file = entry as files.FileMetadata;
      if (!file.name.startsWith('cms-') || !file.name.endsWith('.json.gz')) continue;
      backups.push({
        fileName: file.name,
        sizeBytes: file.size,
        modifiedAt: file.server_modified,
      });
    }

    pagesRead += 1;
    if (!page.has_more || pagesRead >= 10) break;
    page = (await client.filesListFolderContinue({ cursor: page.cursor })).result;
  }

  return backups.sort((left, right) => Date.parse(right.modifiedAt) - Date.parse(left.modifiedAt)).slice(0, 20);
}

