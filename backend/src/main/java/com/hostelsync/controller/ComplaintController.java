package com.hostelsync.controller;

import com.hostelsync.dto.Dtos.ComplaintStatusRequest;
import com.hostelsync.model.Complaint;
import com.hostelsync.model.ComplaintStatus;
import com.hostelsync.service.ComplaintService;
import com.hostelsync.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {

    private final ComplaintService service;
    private final UserService userService;

    public ComplaintController(ComplaintService service, UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public Complaint create(@RequestParam String category,
                            @RequestParam String description,
                            @RequestParam(required = false) MultipartFile image,
                            Authentication auth) {
        if (category.isBlank() || description.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category and description are required");
        }
        return service.create(userService.current(auth), category, description, image);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<Complaint> mine(Authentication auth) {
        return service.mine(userService.current(auth));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('WARDEN','TECHNICIAN')")
    public List<Complaint> all(@RequestParam(required = false) ComplaintStatus status) {
        return service.all(status);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public Complaint updateStatus(@PathVariable Long id, @Valid @RequestBody ComplaintStatusRequest req) {
        return service.updateStatus(id, req);
    }
}
