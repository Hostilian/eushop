package com.eushop.core.controller;

import com.eushop.core.dto.ApiResponse;
import com.eushop.core.service.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileStorageService fileStorageService;

    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * Upload a file
     * @param file The file to upload
     * @param conversationId The conversation ID (optional)
     * @return API response with file URL
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "conversationId", required = false) String conversationId) {

        try {
            String fileUrl = fileStorageService.storeFile(file, conversationId);

            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            response.put("name", file.getOriginalFilename());
            response.put("type", file.getContentType());
            response.put("size", String.valueOf(file.getSize()));

            return ResponseEntity.ok(ApiResponse.success(response, "File uploaded successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("File upload failed: " + e.getMessage()));
        }
    }

    /**
     * Get file information
     * @param fileId The file ID
     * @return API response with file information
     */
    @GetMapping("/{fileId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> getFileInfo(@PathVariable String fileId) {
        try {
            Map<String, String> fileInfo = fileStorageService.getFileInfo(fileId);
            return ResponseEntity.ok(ApiResponse.success(fileInfo, "File information retrieved"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("File not found: " + e.getMessage()));
        }
    }
}