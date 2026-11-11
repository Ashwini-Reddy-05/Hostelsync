package com.hostelsync.controller;

import com.hostelsync.dto.Dtos.DecisionRequest;
import com.hostelsync.dto.Dtos.OutPassRequest;
import com.hostelsync.model.OutPass;
import com.hostelsync.model.OutPassStatus;
import com.hostelsync.service.OutPassService;
import com.hostelsync.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/outpasses")
public class OutPassController {

    private final OutPassService service;
    private final UserService userService;

    public OutPassController(OutPassService service, UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public OutPass apply(@Valid @RequestBody OutPassRequest req, Authentication auth) {
        return service.apply(userService.current(auth), req);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<OutPass> mine(Authentication auth) {
        return service.mine(userService.current(auth));
    }

    @GetMapping
    @PreAuthorize("hasRole('WARDEN')")
    public List<OutPass> all(@RequestParam(required = false) OutPassStatus status) {
        return service.all(status);
    }

    @PutMapping("/{id}/decision")
    @PreAuthorize("hasRole('WARDEN')")
    public OutPass decide(@PathVariable Long id, @RequestBody DecisionRequest req) {
        return service.decide(id, req);
    }
}
