package com.hostelsync.controller;

import com.hostelsync.dto.Dtos.AllocateRequest;
import com.hostelsync.dto.Dtos.RoomRequest;
import com.hostelsync.model.Room;
import com.hostelsync.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@PreAuthorize("hasRole('WARDEN')")
public class RoomController {

    private final RoomService service;

    public RoomController(RoomService service) {
        this.service = service;
    }

    @GetMapping
    public List<Room> all() {
        return service.all();
    }

    @GetMapping("/summary")
    public Map<String, Integer> summary() {
        return service.summary();
    }

    @PostMapping
    public Room create(@Valid @RequestBody RoomRequest req) {
        return service.create(req.roomNumber().trim(), req.capacity());
    }

    @PostMapping("/{id}/allocate")
    public Room allocate(@PathVariable Long id, @Valid @RequestBody AllocateRequest req) {
        return service.allocate(id, req.studentId());
    }
}
