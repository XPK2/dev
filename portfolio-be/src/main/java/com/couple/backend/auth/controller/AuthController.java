package com.couple.backend.auth.controller;

import com.couple.backend.auth.dto.LoginRequest;
import com.couple.backend.auth.dto.LoginResponse;
import com.couple.backend.auth.service.AuthService;
import com.couple.backend.common.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Autowired;
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
}
