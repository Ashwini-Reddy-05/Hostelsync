package com.hostelsync.service;

import com.hostelsync.dto.Dtos.AuthResponse;
import com.hostelsync.dto.Dtos.LoginRequest;
import com.hostelsync.dto.Dtos.RegisterRequest;
import com.hostelsync.model.Role;
import com.hostelsync.model.User;
import com.hostelsync.repository.UserRepository;
import com.hostelsync.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtUtil jwtUtil, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    /** Public self-registration is for students only. Wardens/technicians are seeded or added by admins. */
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }
        User user = userRepository.save(User.builder()
                .name(req.name().trim())
                .email(email)
                .password(passwordEncoder.encode(req.password()))
                .role(Role.STUDENT)
                .rollNumber(req.rollNumber())
                .phone(req.phone())
                .build());
        emailService.send(email, "Welcome to HostelSync",
                "Hi " + user.getName() + ",\n\nYour HostelSync student account has been created.");
        return toResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        String email = req.email().trim().toLowerCase();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, req.password()));
        User user = userRepository.findByEmail(email).orElseThrow();
        return toResponse(user);
    }

    private AuthResponse toResponse(User u) {
        return new AuthResponse(jwtUtil.generateToken(u.getEmail(), u.getRole().name()),
                u.getId(), u.getName(), u.getEmail(), u.getRole());
    }
}
