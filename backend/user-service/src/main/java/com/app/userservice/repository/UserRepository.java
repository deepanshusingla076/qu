package com.app.userservice.repository;

import com.app.userservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Find user by username for authentication
    Optional<User> findByUsername(String username);
    
    // Find user by email for authentication
    Optional<User> findByEmail(String email);
    
    // Find user by username or email for login
    @Query("SELECT u FROM User u WHERE u.username = :usernameOrEmail OR u.email = :usernameOrEmail")
    Optional<User> findByUsernameOrEmail(@Param("usernameOrEmail") String usernameOrEmail);
    
    // Check if username exists for validation
    Boolean existsByUsername(String username);
    
    // Check if email exists for validation
    Boolean existsByEmail(String email);
    
    // Find all active users
    List<User> findByIsActiveTrue();
    
    // Find users by role
    List<User> findByRole(User.Role role);
    
    // Find active users by role
    List<User> findByRoleAndIsActiveTrue(User.Role role);
    
    // Find users created within a date range
    List<User> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Find users who have never logged in
    List<User> findByLastLoginAtIsNull();
    
    // Find locked accounts
    @Query("SELECT u FROM User u WHERE u.lockedUntil IS NOT NULL AND u.lockedUntil > :now")
    List<User> findLockedAccounts(@Param("now") LocalDateTime now);
    
    // Find unverified users
    List<User> findByIsVerifiedFalse();
    
    // Search users by name or username
    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<User> searchUsers(@Param("query") String query);
}