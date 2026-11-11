package com.hostelsync.controller;

import com.hostelsync.dto.Dtos.HeadcountRow;
import com.hostelsync.dto.Dtos.MessRequest;
import com.hostelsync.dto.Dtos.RatingRow;
import com.hostelsync.model.MessFeedback;
import com.hostelsync.service.MessService;
import com.hostelsync.service.UserService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mess")
public class MessController {

    private final MessService service;
    private final UserService userService;

    public MessController(MessService service, UserService userService) {
        this.service = service;
        this.userService = userService;
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public MessFeedback submit(@Valid @RequestBody MessRequest req, Authentication auth) {
        return service.submit(userService.current(auth), req);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public List<MessFeedback> mine(Authentication auth) {
        return service.mine(userService.current(auth));
    }

    /** Headcount + ratings + individual feedback for a date (defaults to today). */
    @GetMapping("/report")
    @PreAuthorize("hasRole('WARDEN')")
    public Map<String, Object> report(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate d = date != null ? date : LocalDate.now();
        List<HeadcountRow> headcount = service.headcount(d);
        List<RatingRow> ratings = service.ratings(d);
        return Map.of("date", d, "headcount", headcount, "ratings", ratings, "feedback", service.feedback(d));
    }
}
