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
        // Normalize file name
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";

        if (originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        // Generate unique file name
        String fileName = UUID.randomUUID().toString() + fileExtension;

        // Create subdirectory for conversation if provided
        Path targetLocation = this.fileStorageLocation.resolve(fileName);
        if (conversationId != null && !conversationId.isEmpty()) {
            Path conversationDir = this.fileStorageLocation.resolve(conversationId);
            Files.createDirectories(conversationDir);
            targetLocation = conversationDir.resolve(fileName);
        }

        // Copy file to target location
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // Return relative path for URL construction
        return "/uploads/" + (conversationId != null ? conversationId + "/" : "") + fileName;
    }

    /**
     * Get file information
     * @param fileId The file ID (path)
     * @return Map with file information
     * @throws IOException If file not found
     */
    public Map<String, String> getFileInfo(String fileId) throws IOException {
        Path filePath = this.fileStorageLocation.resolve(fileId).normalize();

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