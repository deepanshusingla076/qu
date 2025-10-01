package com.app.userservice.service;

import com.app.userservice.config.JwtTokenProvider;
import com.app.userservice.dto.UserResponse;
import com.app.userservice.entity.User;
import com.app.userservice.exception.UserNotFoundException;
import com.app.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    
    // Get user by ID and return UserResponse
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        return UserResponse.from(user);
    }
    
    // Get user by username and return UserResponse
    @Transactional(readOnly = true)
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));
        return UserResponse.from(user);
    }
    
    // Get all users with optional filters
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(String role, Boolean active) {
        List<User> users;
        
        if (role != null && active != null) {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            users = userRepository.findByRoleAndIsActiveTrue(userRole);
        } else if (role != null) {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            users = userRepository.findByRole(userRole);
        } else if (active != null && active) {
            users = userRepository.findByIsActiveTrue();
        } else {
            users = userRepository.findAll();
        }
        
        return users.stream()
            .map(UserResponse::from)
            .collect(Collectors.toList());
    }
    
    // Get users by role
    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(User.Role role) {
        List<User> users = userRepository.findByRole(role);
        return users.stream()
            .map(UserResponse::from)
            .collect(Collectors.toList());
    }
    
    // Search users by query
    @Transactional(readOnly = true)
    public List<UserResponse> searchUsers(String query) {
        List<User> users = userRepository.searchUsers(query);
        return users.stream()
            .map(UserResponse::from)
            .collect(Collectors.toList());
    }
    
    // Update user profile
    @Transactional
    public UserResponse updateUser(Long userId, User updatedUser) {
        User existingUser = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        
        if (updatedUser.getFirstName() != null) {
            existingUser.setFirstName(updatedUser.getFirstName());
        }
        if (updatedUser.getLastName() != null) {
            existingUser.setLastName(updatedUser.getLastName());
        }
        if (updatedUser.getEmail() != null) {
            existingUser.setEmail(updatedUser.getEmail());
        }
        if (updatedUser.getAvatarUrl() != null) {
            existingUser.setAvatarUrl(updatedUser.getAvatarUrl());
        }
        
        User savedUser = userRepository.save(existingUser);
        return UserResponse.from(savedUser);
    }
    
    // Activate user account
    @Transactional
    public void activateUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        user.setIsActive(true);
        userRepository.save(user);
    }
    
    // Deactivate user account
    @Transactional
    public void deactivateUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        user.setIsActive(false);
        userRepository.save(user);
    }
    
    // Delete user account
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
        userRepository.delete(user);
    }
    
    // Validate JWT token and get user details
    @Transactional(readOnly = true)
    public UserResponse validateTokenAndGetUser(String token) {
        if (jwtTokenProvider.validateToken(token)) {
            String username = jwtTokenProvider.getUsernameFromToken(token);
            User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));
            return UserResponse.from(user);
        }
        throw new RuntimeException("Invalid token");
    }
}