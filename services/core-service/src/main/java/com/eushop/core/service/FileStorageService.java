package com.eushop.core.service;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService() throws IOException {
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        Files.createDirectories(this.fileStorageLocation);
    }

    /**
     * Store a file
     * @param file The file to store
     * @param conversationId The conversation ID (optional)
     * @return The file URL
     * @throws IOException If file storage fails
     */
    public String storeFile(MultipartFile file, String conversationId) throws IOException {
        // COMPLIANCE-REVIEW: Implements file name & extension sanitization per CodeQL Task 125
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "");
        if (originalFileName.contains("..")) {
            throw new IllegalArgumentException("Invalid file name: path traversal characters detected");
        }

        String fileExtension = "";
        if (originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();
        }

        // Allowed extensions filter
        if (!fileExtension.matches("^\\.(png|jpg|jpeg|gif|webp|pdf)$")) {
            throw new IllegalArgumentException("Unsupported file extension: " + fileExtension);
        }

        // Generate unique file name
        String fileName = UUID.randomUUID().toString() + fileExtension;

        // Sanitize conversationId if provided
        Path targetLocation = this.fileStorageLocation.resolve(fileName).normalize();
        if (conversationId != null && !conversationId.isEmpty()) {
            String cleanConversationId = StringUtils.cleanPath(conversationId);
            if (cleanConversationId.contains("..")) {
                throw new IllegalArgumentException("Invalid conversation ID path traversal attempt");
            }
            Path conversationDir = this.fileStorageLocation.resolve(cleanConversationId).normalize();
            if (!conversationDir.startsWith(this.fileStorageLocation)) {
                throw new IllegalArgumentException("Path traversal attempt in conversation directory");
            }
            Files.createDirectories(conversationDir);
            targetLocation = conversationDir.resolve(fileName).normalize();
        }

        if (!targetLocation.startsWith(this.fileStorageLocation)) {
            throw new IllegalArgumentException("Path traversal attempt in target file location");
        }

        // Copy file to target location
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Return relative path for URL construction
        return "/uploads/" + (conversationId != null ? StringUtils.cleanPath(conversationId) + "/" : "") + fileName;
    }

    /**
     * Get file information
     * @param fileId The file ID (path)
     * @return Map with file information
     * @throws IOException If file not found
     */
    public Map<String, String> getFileInfo(String fileId) throws IOException {
        // COMPLIANCE-REVIEW: Path traversal prevention check per OWASP / CodeQL Task 125
        if (fileId == null || fileId.contains("..")) {
            throw new IllegalArgumentException("Invalid file ID: path traversal attempt detected");
        }

        Path filePath = this.fileStorageLocation.resolve(fileId).normalize();

        if (!filePath.startsWith(this.fileStorageLocation)) {
            throw new IllegalArgumentException("Access denied: path traversal attempt outside storage directory");
        }

        if (!Files.exists(filePath)) {
            throw new IOException("File not found: " + fileId);
        }

        Map<String, String> fileInfo = new HashMap<>();
        fileInfo.put("path", filePath.toString());
        fileInfo.put("name", filePath.getFileName().toString());
        fileInfo.put("size", String.valueOf(Files.size(filePath)));

        return fileInfo;
    }
}