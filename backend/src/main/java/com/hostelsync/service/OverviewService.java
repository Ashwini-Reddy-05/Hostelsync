package com.hostelsync.service;

import com.hostelsync.model.*;
import com.hostelsync.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/** Warden dashboard numbers: student headcount, who is out, rooms, complaints. */
@Service
public class OverviewService {

    private final UserRepository userRepository;
    private final OutPassRepository outPassRepository;
    private final ComplaintRepository complaintRepository;
    private final RoomService roomService;

    public OverviewService(UserRepository userRepository, OutPassRepository outPassRepository,
                           ComplaintRepository complaintRepository, RoomService roomService) {
        this.userRepository = userRepository;
        this.outPassRepository = outPassRepository;
        this.complaintRepository = complaintRepository;
        this.roomService = roomService;
    }

    public Map<String, Object> overview() {
        List<User> students = userRepository.findByRole(Role.STUDENT);
        LocalDateTime now = LocalDateTime.now();

        // Students whose approved out-pass covers the current time are outside the hostel.
        List<OutPass> active = outPassRepository
                .findByStatusAndOutTimeLessThanEqualAndExpectedReturnGreaterThanEqual(OutPassStatus.APPROVED, now, now);
        Map<Long, OutPass> outNow = new LinkedHashMap<>();
        for (OutPass p : active) outNow.putIfAbsent(p.getStudent().getId(), p);

        List<Map<String, Object>> outList = outNow.values().stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("name", p.getStudent().getName());
            m.put("room", p.getStudent().getRoom() != null ? p.getStudent().getRoom().getRoomNumber() : null);
            m.put("destination", p.getDestination());
            m.put("expectedReturn", p.getExpectedReturn());
            return m;
        }).collect(Collectors.toList());

        long allocated = students.stream().filter(s -> s.getRoom() != null).count();

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalStudents", students.size());
        out.put("allocatedStudents", allocated);
        out.put("studentsOut", outNow.size());
        out.put("studentsInHostel", Math.max(students.size() - outNow.size(), 0));
        out.put("studentsOutList", outList);
        out.put("pendingOutPasses", outPassRepository.countByStatus(OutPassStatus.PENDING));
        out.put("complaintsPending", complaintRepository.countByStatus(ComplaintStatus.PENDING));
        out.put("complaintsInProgress", complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS));
        out.put("complaintsResolved", complaintRepository.countByStatus(ComplaintStatus.RESOLVED));
        out.put("rooms", roomService.summary());
        return out;
    }
}
