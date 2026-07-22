package com.eushop.core.security;

import com.eushop.core.service.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

public class SecurityHardeningTest {

    private FileStorageService fileStorageService;

    @BeforeEach
    public void setUp() throws IOException {
        fileStorageService = new FileStorageService();
    }

    @Test
    public void testPathTraversalInGetFileInfoThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> {
            fileStorageService.getFileInfo("../../../etc/passwd");
        });
    }

    @Test
    public void testInvalidFileExtensionInStoreFileThrowsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "malicious.exe",
                "application/octet-stream",
                "test content".getBytes()
        );

        assertThrows(IllegalArgumentException.class, () -> {
            fileStorageService.storeFile(file, null);
        });
    }

    @Test
    public void testValidFileExtensionInStoreFileSucceeds() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "image.png",
                "image/png",
                "valid content".getBytes()
        );

        String result = fileStorageService.storeFile(file, null);
        assertNotNull(result);
        assertTrue(result.startsWith("/uploads/"));
        assertTrue(result.endsWith(".png"));
    }
}
