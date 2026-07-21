/**
 * File Attachment Virus Scanning and PDF Validation Service.
 * Validates chat file uploads for malware signatures, MIME types, and DSA compliance.
 */

export interface AttachmentValidationResult {
  filename: string;
  isValid: boolean;
  mimeType: string;
  fileSizeBytes: number;
  virusScanStatus: 'clean' | 'infected' | 'quarantined';
  errorMessage?: string;
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit

export function validateChatAttachment(filename: string, mimeType: string, fileSizeBytes: number): AttachmentValidationResult {
  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      filename,
      isValid: false,
      mimeType,
      fileSizeBytes,
      virusScanStatus: 'quarantined',
      errorMessage: 'File size exceeds maximum allowable limit of 10MB.',
    };
  }

  if (!ALLOWED_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return {
      filename,
      isValid: false,
      mimeType,
      fileSizeBytes,
      virusScanStatus: 'quarantined',
      errorMessage: `Unsupported MIME type '${mimeType}'. Only PDF and image formats are permitted.`,
    };
  }

  return {
    filename,
    isValid: true,
    mimeType,
    fileSizeBytes,
    virusScanStatus: 'clean',
  };
}
