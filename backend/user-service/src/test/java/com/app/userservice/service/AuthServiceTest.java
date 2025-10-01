package com.app.userservice.service;

import com.app.userservice.config.JwtTokenProvider;
import com.app.userservice.dto.AuthResponse;
import com.app.userservice.dto.LoginRequest;
import com.app.userservice.dto.RegisterRequest;
import com.app.userservice.entity.User;
import com.app.userservice.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("Test123!@#");
        registerRequest.setFirstName("Test");
        registerRequest.setLastName("User");
        registerRequest.setRole("STUDENT");

        loginRequest = new LoginRequest();
        loginRequest.setUsernameOrEmail("testuser");
        loginRequest.setPassword("Test123!@#");

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setRole(User.Role.STUDENT);
        testUser.setIsActive(true);
        testUser.setLoginAttempts(0);
    }

    @Test
    void testSuccessfulRegistration() {
        // Given
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtTokenProvider.generateToken(anyString(), anyString(), any(Long.class)))
                .thenReturn("mock.jwt.token");
        when(jwtTokenProvider.generateRefreshToken(anyString())).thenReturn("mock.refresh.token");

        // When
        AuthResponse response = authService.register(registerRequest);

        // Then
        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("mock.refresh.token", response.getRefreshToken());
        assertEquals("testuser", response.getUser().getUsername());
        assertEquals("test@example.com", response.getUser().getEmail());

        verify(userRepository).save(any(User.class));
        verify(jwtTokenProvider).generateToken("testuser", "STUDENT", 1L);
    }

    @Test
    void testSuccessfulLogin() {
        // Given
        when(userRepository.findByUsernameOrEmail(anyString()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
        when(jwtTokenProvider.generateToken(anyString(), anyString(), any(Long.class)))
                .thenReturn("mock.jwt.token");
        when(jwtTokenProvider.generateRefreshToken(anyString())).thenReturn("mock.refresh.token");

        // When
        AuthResponse response = authService.login(loginRequest);

        // Then
        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("mock.refresh.token", response.getRefreshToken());
        assertEquals("testuser", response.getUser().getUsername());

        verify(userRepository).save(testUser);
        verify(jwtTokenProvider).generateToken("testuser", "STUDENT", 1L);
    }

    @Test
    void testLoginWithInvalidCredentials() {
        // Given
        when(userRepository.findByUsernameOrEmail(anyString()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // When & Then
        assertThrows(RuntimeException.class, () -> authService.login(loginRequest));

        verify(userRepository).save(testUser);
        verify(jwtTokenProvider, never()).generateToken(anyString(), anyString(), any(Long.class));
    }

    @Test
    void testRegistrationWithExistingUsername() {
        // Given
        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        // When & Then
        assertThrows(RuntimeException.class, () -> authService.register(registerRequest));

        verify(userRepository, never()).save(any(User.class));
        verify(jwtTokenProvider, never()).generateToken(anyString(), anyString(), any(Long.class));
    }

    @Test
    void testRegistrationWithExistingEmail() {
        // Given
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(true);

        // When & Then
        assertThrows(RuntimeException.class, () -> authService.register(registerRequest));

        verify(userRepository, never()).save(any(User.class));
        verify(jwtTokenProvider, never()).generateToken(anyString(), anyString(), any(Long.class));
    }

    @Test
    void testLoginAttemptsTracking() {
        // Given
        testUser.setLoginAttempts(0);
        when(userRepository.findByUsernameOrEmail(anyString()))
                .thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

        // When
        assertThrows(RuntimeException.class, () -> authService.login(loginRequest));

        // Then
        assertEquals(1, testUser.getLoginAttempts());
        verify(userRepository).save(testUser);
    }
}