import { baseUrl } from '../networking';
import SessionManager from '../managers/sessionManager';

function resolveDownloadUrl(downloadUrl: string): string {
  if (downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://')) return downloadUrl;
  if (downloadUrl.startsWith('/')) return `${baseUrl}${downloadUrl}`;
  return `${baseUrl}/${downloadUrl}`;
}

export async function downloadSubmissionFile(downloadUrl: string, downloadName: string): Promise<void> {
  const token = SessionManager.getInstance()?.getAuthToken();
  if (!token) {
    throw new Error('No auth token');
  }

  const response = await fetch(resolveDownloadUrl(downloadUrl), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = blobUrl;
  anchor.download = downloadName;
  anchor.style.display = 'none';

  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(blobUrl);
}

export default { downloadSubmissionFile };
