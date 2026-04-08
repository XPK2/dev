package com.couple.backend.auth.controller;

import com.couple.backend.auth.dto.LoginRequest;
import com.couple.backend.auth.dto.LoginResponse;
import com.couple.backend.auth.dto.UpdateAvatarRequest;
import com.couple.backend.auth.dto.UserResponse;
import com.couple.backend.auth.service.AuthService;
import com.couple.backend.common.dto.ApiResponse;
import com.couple.backend.common.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ApiResponse.success("Login successful", response);
    }

    @GetMapping("/me")
    public ApiResponse<UserResponse> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        UserResponse response = authService.getCurrentUserById(userDetails.getUserId());
        return ApiResponse.success("Current user retrieved", response);
    }

    @PutMapping("/avatar")
    public ApiResponse<UserResponse> updateAvatar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody UpdateAvatarRequest request) {
        UserResponse response = authService.updateUserAvatar(userDetails.getUserId(), request.getAvatarUrl());
        return ApiResponse.success("Avatar updated successfully", response);
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<UserResponse> getUserById(@PathVariable Long userId) {
        UserResponse response = authService.getCurrentUserById(userId);
        return ApiResponse.success("User retrieved", response);
    }
}
