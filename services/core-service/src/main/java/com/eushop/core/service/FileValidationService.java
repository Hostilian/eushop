package com.eushop.core.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@Service
public class FileValidationService {

    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final long MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

    public boolean isValid(MultipartFile file) {
        return isMimeTypeAllowed(file.getContentType()) && isSizeAllowed(file.getSize());
    }

    private boolean isMimeTypeAllowed(String mimeType) {
        return ALLOWED_MIME_TYPES.contains(mimeType.toLowerCase());
    }

    private boolean isSizeAllowed(long fileSize) {
        return fileSize <= MAX_FILE_SIZE_BYTES;
    }

    // COMPLIANCE-REVIEW: Placeholder for virus scanning logic.
    public boolean isVirusFree(MultipartFile file) {
        // In a real implementation, this would integrate with a virus scanning service (e.g., ClamAV).
        // For now, we'll assume all files are clean.
        return true;
    }

    // COMPLIANCE-REVIEW: Placeholder for PDF validation logic.
    public boolean isValidPdf(MultipartFile file) {
        if (!"application/pdf".equals(file.getContentType())) {
            return true; // Not a PDF, so we don't need to validate it as such.
        }
        // In a real implementation, this would use a library like PDFBox or iText to validate the PDF structure.
        // For now, we'll assume all PDFs are valid.
        return true;
    }
}
