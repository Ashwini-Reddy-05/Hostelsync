package com.hostelsync.service;

import com.hostelsync.model.Role;
import com.hostelsync.model.Room;
import com.hostelsync.model.User;
import com.hostelsync.repository.RoomRepository;
import com.hostelsync.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public RoomService(RoomRepository roomRepository, UserRepository userRepository) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    public List<Room> all() {
        return roomRepository.findAll();
    }

    public Room create(String roomNumber, int capacity) {
        if (roomRepository.existsByRoomNumber(roomNumber)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Room already exists");
        }
        return roomRepository.save(Room.builder().roomNumber(roomNumber).capacity(capacity).occupied(0).build());
    }

    @Transactional
    public Room allocate(Long roomId, Long studentId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        if (student.getRole() != Role.STUDENT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only students can be allocated rooms");
        }
        if (student.getRoom() != null && student.getRoom().getId().equals(roomId)) {
            return room;
        }
        if (room.getAvailable() <= 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Room " + room.getRoomNumber() + " is full");
        }
        Room old = student.getRoom();
        if (old != null) {
            old.setOccupied(Math.max(old.getOccupied() - 1, 0));
            roomRepository.save(old);
        }
        room.setOccupied(room.getOccupied() + 1);
        student.setRoom(room);
        userRepository.save(student);
        return roomRepository.save(room);
    }

    public Map<String, Integer> summary() {
        List<Room> rooms = roomRepository.findAll();
        int capacity = rooms.stream().mapToInt(Room::getCapacity).sum();
        int occupied = rooms.stream().mapToInt(Room::getOccupied).sum();
        return Map.of("totalRooms", rooms.size(), "totalBeds", capacity,
                "occupiedBeds", occupied, "availableBeds", Math.max(capacity - occupied, 0));
    }
}
