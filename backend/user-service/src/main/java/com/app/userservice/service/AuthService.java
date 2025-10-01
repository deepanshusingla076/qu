package com.app.userservice.service;

import com.app.userservice.config.JwtTokenProvider;
import com.app.userservice.dto.*;
import com.app.userservice.entity.User;
import com.app.userservice.exception.AuthenticationFailedException;
import com.app.userservice.exception.EmailAlreadyExistsException;
import com.app.userservice.exception.UsernameAlreadyExistsException;
import com.app.userservice.exception.UserNotFoundException;
import com.app.userservice.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private static final int MAX_LOGIN_ATTEMPTS = 5;
    private static final int LOCKOUT_DURATION_MINUTES = 30;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public AuthResponse login(LoginRequest request) {
        logger.info("Login attempt for user: {}", request.getUsernameOrEmail());

        User user = userRepository.findByUsernameOrEmail(request.getUsernameOrEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found with username or email: " + request.getUsernameOrEmail()));

        // Check if user is active
        if (!user.getIsActive()) {
            throw new AuthenticationFailedException("Account is deactivated");
        }

        // Check if account is locked
        if (user.isAccountLocked()) {
            throw new AuthenticationFailedException("Account is temporarily locked due to too many failed login attempts");
        }

        // Check if user can attempt login
        if (!user.canAttemptLogin()) {
            throw new AuthenticationFailedException("Too many failed login attempts. Please try again later.");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            handleFailedLogin(user);
            throw new AuthenticationFailedException("Invalid credentials");
        }

        // Successful login - reset login attempts and update login timestamp
        handleSuccessfulLogin(user);

        // Generate tokens
        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole().name(), user.getId());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUsername());
        
        UserResponse userResponse = UserResponse.from(user);
        
        logger.info("User {} logged in successfully", user.getUsername());
        
        return new AuthResponse(token, refreshToken, jwtTokenProvider.getExpirationMs(), userResponse);
    }

    public AuthResponse register(RegisterRequest request) {
        logger.info("Registration attempt for username: {}", request.getUsername());

        // Check if username already exists
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UsernameAlreadyExistsException("Username is already taken");
        }

        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email is already registered");
        }

        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(User.Role.valueOf(request.getRole()));
        user.setIsActive(true);
        user.setIsVerified(false); // Email verification required

        user = userRepository.save(user);

        // Generate tokens
        String token = jwtTokenProvider.generateToken(user.getUsername(), user.getRole().name(), user.getId());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUsername());
        
        UserResponse userResponse = UserResponse.from(user);
        
        logger.info("User {} registered successfully", user.getUsername());
        
        return new AuthResponse(token, refreshToken, jwtTokenProvider.getExpirationMs(), userResponse);
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new AuthenticationFailedException("Invalid refresh token");
        }

        String username = jwtTokenProvider.getUsernameFromToken(refreshToken);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + username));

        if (!user.getIsActive()) {
            throw new AuthenticationFailedException("Account is deactivated");
        }

        // Generate new tokens
        String newToken = jwtTokenProvider.generateToken(user.getUsername(), user.getRole().name(), user.getId());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getUsername());
        
        UserResponse userResponse = UserResponse.from(user);
        
        return new AuthResponse(newToken, newRefreshToken, jwtTokenProvider.getExpirationMs(), userResponse);
    }

    private void handleFailedLogin(User user) {
        int attempts = user.getLoginAttempts() == null ? 0 : user.getLoginAttempts();
        attempts++;
        user.setLoginAttempts(attempts);

        if (attempts >= MAX_LOGIN_ATTEMPTS) {
            user.setLockedUntil(LocalDateTime.now().plusMinutes(LOCKOUT_DURATION_MINUTES));
            logger.warn("User {} account locked due to too many failed login attempts", user.getUsername());
        }

        userRepository.save(user);
    }

    private void handleSuccessfulLogin(User user) {
        user.setLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }
}