package com.krishimitra.service;

import com.krishimitra.dto.AuthResponse;
import com.krishimitra.dto.LoginRequest;
import com.krishimitra.dto.RegisterRequest;
import com.krishimitra.entity.User;
import com.krishimitra.repository.UserRepository;
import com.krishimitra.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

// Module: Login Page for Farmers / Login Page for Experts (Authentication + Authorization)
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(User.Role.valueOf(request.getRole().toUpperCase()));
        user.setPreferredLanguage(request.getPreferredLanguage() != null ? request.getPreferredLanguage() : "English");
        user.setExpertDomain(request.getExpertDomain()); // stores expert specialization, per paper's Expert login module

        User saved = userRepository.save(user);

        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole().name(), saved.getId());
        return new AuthResponse(token, saved.getId(), saved.getFullName(), saved.getRole().name(), saved.getPreferredLanguage());
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getRole().name(), user.getPreferredLanguage());
    }
}
