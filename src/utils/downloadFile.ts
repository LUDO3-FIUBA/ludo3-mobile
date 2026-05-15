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

export async function downloadFile(url?: string, downloadName?: string | null, submissionDownloadUrl?: string | null): Promise<void> {
  if (!url || !downloadName) return;

  const safeFileName = downloadName.replace(/[\\/]/g, '_');
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
    await ReactNativeBlobUtil.config({ fileCache: true, path: filePath }).fetch('GET', downloadUrl);
  } catch (err) {
    throw err;
  }
}

export default downloadFile;
