import { Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

export async function downloadFile(url?: string, downloadName?: string | null): Promise<void> {
  if (!url || !downloadName) return;

  const safeFileName = downloadName.replace(/[\\/]/g, '_');

  try {
    if (Platform.OS === 'web') {
        const anchor = document.createElement('a');
        anchor.href = url;
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
        }).fetch('GET', url);
        return;
    }

    // iOS
    const filePath = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${safeFileName}`;
    await ReactNativeBlobUtil.config({ fileCache: true, path: filePath }).fetch('GET', url);
  } catch (err) {
    throw err;
  }
}

export default downloadFile;
