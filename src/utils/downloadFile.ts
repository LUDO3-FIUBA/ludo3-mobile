import { Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { baseUrl } from '../networking';
import { downloadSubmissionFile } from '../repositories/submissionFiles';

function resolveDownloadUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('//')) return `${Platform.OS === 'web' ? window.location.protocol : 'https:'}${url}`;
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
}

// Filenames coming from the document picker can arrive percent-encoded
// (e.g. "Equipo%20150.pdf"). Decode them so they read naturally both in the
// UI and on disk.
export function decodeFileName(name: string): string {
  try {
    return decodeURIComponent(name);
  } catch {
    return name.replace(/%/g, ' ');
  }
}

function sanitizeFileName(name: string): string {
  // A raw '%' (and other reserved chars) breaks Android's Uri.parse on the
  // destination path, so DownloadManager fails with "the file does not
  // downloaded to destination". Decode first, then strip characters that are
  // invalid in a file path.
  return decodeFileName(name).replace(/[\\/:*?"<>|%]/g, '_').trim() || 'archivo';
}

export async function downloadFile(url?: string, downloadName?: string | null, submissionDownloadUrl?: string | null): Promise<void> {
  if (!url || !downloadName) return;

  const safeFileName = sanitizeFileName(downloadName);
  const downloadUrl = resolveDownloadUrl(url);
  const resolvedSubmissionDownloadUrl = submissionDownloadUrl ? resolveDownloadUrl(submissionDownloadUrl) : null;

  try {
    if (Platform.OS === 'web') {
        if (resolvedSubmissionDownloadUrl) {
          await downloadSubmissionFile(resolvedSubmissionDownloadUrl, safeFileName);
          return;
        }

        const anchor = document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = safeFileName;
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        return;
    }

    if (Platform.OS === 'android') {
        const path = `/storage/emulated/0/Download/${safeFileName}`;
        await ReactNativeBlobUtil.config({
            addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            title: safeFileName,
            description: 'Descarga de archivo',
            mediaScannable: true,
            path,
            },
        }).fetch('GET', downloadUrl);
        return;
    }

    // iOS
    const filePath = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${safeFileName}`;
    const res = await ReactNativeBlobUtil.config({ fileCache: true, path: filePath }).fetch('GET', downloadUrl);
    try {
      // Abrir el share sheet de iOS para que el usuario pueda guardar/compartir el archivo.
      await ReactNativeBlobUtil.ios.openDocument(res.path());
    } catch (e) {
      // Si falla la apertura del share sheet, la descarga igual fue exitosa.
    }
  } catch (err) {
    // El feedback al usuario lo maneja quien llama (ver SubmissionFileCard).
    throw err;
  }
}

export default downloadFile;
