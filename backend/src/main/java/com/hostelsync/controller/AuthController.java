package com.hostelsync.controller;

import com.hostelsync.dto.Dtos.AuthResponse;
import com.hostelsync.dto.Dtos.LoginRequest;
import com.hostelsync.dto.Dtos.RegisterRequest;
import com.hostelsync.model.User;
import com.hostelsync.service.AuthService;
import com.hostelsync.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    /** Open http://localhost:8080/api/auth/health in a browser to check the backend is up. */
    @GetMapping("/auth/health")
    public java.util.Map<String, String> health() {
        return java.util.Map.of("status", "ok");
    }

    @PostMapping("/auth/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/auth/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/users/me")
    public User me(Authentication auth) {
        return userService.current(auth);
    }

    @GetMapping("/users/students")
    @PreAuthorize("hasRole('WARDEN')")
    public List<User> students() {
        return userService.students();
    }
}
