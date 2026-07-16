package com.eushop.core.controller;

import com.eushop.core.dto.ApiResponse;
import com.eushop.core.dto.UserDTO;
import com.eushop.core.entity.User;
import com.eushop.core.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class UserControllerTest {

    @Mock
    private UserService userService;

    @InjectMocks
    private UserController userController;

    private User testUser;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testUser = new User();
        testUser.setId("user_1");
        testUser.setEmail("test@eushop.eu");
        testUser.setName("Test User");
    }

    @Test
    void deleteAccount_SameUser_ReturnsOk() {
        doNothing().when(userService).anonymiseUser("user_1");

        ResponseEntity<ApiResponse<Void>> response = userController.deleteAccount("user_1", "user_1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Account successfully anonymised (GDPR erasure completed)", response.getBody().getMessage());
        verify(userService, times(1)).anonymiseUser("user_1");
    }

    @Test
    void deleteAccount_DifferentUser_ReturnsForbidden() {
        ResponseEntity<ApiResponse<Void>> response = userController.deleteAccount("user_1", "user_2");

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Cannot delete other user's account", response.getBody().getError());
        verify(userService, never()).anonymiseUser(anyString());
    }

    @Test
    void exportAccount_SameUser_ReturnsData() {
        Map<String, Object> mockData = new HashMap<>();
        mockData.put("userProfile", testUser);
        mockData.put("orders", new HashMap<>());
        when(userService.exportUserData("user_1")).thenReturn(mockData);

        ResponseEntity<ApiResponse<Map<String, Object>>> response = userController.exportAccount("user_1", "user_1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("User data exported successfully (GDPR portability)", response.getBody().getMessage());
        assertEquals(mockData, response.getBody().getData());
        verify(userService, times(1)).exportUserData("user_1");
    }

    @Test
    void exportAccount_DifferentUser_ReturnsForbidden() {
        ResponseEntity<ApiResponse<Map<String, Object>>> response = userController.exportAccount("user_1", "user_2");

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("Cannot export other user's data", response.getBody().getError());
        verify(userService, never()).exportUserData(anyString());
    }
}