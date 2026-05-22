export interface SubmissionFileValue {
  uri?: string;
  name: string;
  type?: string;
  size?: number;
}

export const SUBMISSION_FILE_MAX_NAME_LENGTH = 100;

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_PDF_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const normalize = (value?: string) => (value || '').trim().toLowerCase();

export const getSubmissionFileExtension = (name?: string) => {
  const normalizedName = normalize(name);
  const dotIndex = normalizedName.lastIndexOf('.');

  if (dotIndex === -1) {
    return '';
  }

  return normalizedName.slice(dotIndex + 1);
};

export const validateSubmissionFile = (file: Pick<SubmissionFileValue, 'name' | 'type' | 'size'>) => {
  if (file.name && file.name.length > SUBMISSION_FILE_MAX_NAME_LENGTH) {
    return 'El nombre del archivo no puede exceder 100 caracteres.';
  }

  const extension = getSubmissionFileExtension(file.name);
  const mimeType = normalize(file.type);
  const isPdf = extension === 'pdf' || mimeType === 'application/pdf';
  const isImage = (ALLOWED_MIME_TYPES.includes(mimeType) && mimeType !== 'application/pdf') || ['jpeg', 'jpg', 'png', 'webp'].includes(extension);

  if (!isPdf && !isImage) {
    return 'Solo se permiten PDF, JPEG, JPG, PNG o WEBP.';
  }

  const sizeInBytes = typeof file.size === 'number' ? file.size : 0;

  if (isPdf && sizeInBytes > MAX_PDF_BYTES) {
    return 'El PDF debe ser menor a 5 MB.';
  }

  if (isImage && sizeInBytes > MAX_IMAGE_BYTES) {
    return 'La imagen debe ser menor a 2 MB.';
  }

  return null;
};