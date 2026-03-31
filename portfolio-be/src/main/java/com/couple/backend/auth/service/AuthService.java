package com.couple.backend.auth.service;

import com.couple.backend.auth.dto.LoginRequest;
import com.couple.backend.auth.dto.LoginResponse;
import com.couple.backend.auth.entity.User;
import com.couple.backend.auth.repository.UserRepository;
import com.couple.backend.common.constant.UserConstant;
import com.couple.backend.common.exception.AppException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public LoginResponse login(LoginRequest request) {
        // Validate the code
        if (!isValidCode(request.getCode())) {
            throw new AppException("INVALID_CODE", "Invalid login code", 401);
        }

        // Find or create user by code
        User user = userRepository.findByCode(request.getCode())
            .orElseThrow(() -> new AppException("USER_NOT_FOUND", "User not found", 404));

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(user.getId(), user.getName());

        return new LoginResponse(token, user.getName(), user.getId());
    }

    private boolean isValidCode(String code) {
        return code.equals(UserConstant.USER_1_CODE) || code.equals(UserConstant.USER_2_CODE);
    }
}
