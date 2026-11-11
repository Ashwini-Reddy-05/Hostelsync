package com.hostelsync.service;

import com.hostelsync.dto.Dtos.DecisionRequest;
import com.hostelsync.dto.Dtos.OutPassRequest;
import com.hostelsync.model.OutPass;
import com.hostelsync.model.OutPassStatus;
import com.hostelsync.model.User;
import com.hostelsync.repository.OutPassRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class OutPassService {

    private final OutPassRepository repo;
    private final EmailService emailService;

    public OutPassService(OutPassRepository repo, EmailService emailService) {
        this.repo = repo;
        this.emailService = emailService;
    }

    public OutPass apply(User student, OutPassRequest req) {
        if (!req.expectedReturn().isAfter(req.outTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Return time must be after out time");
        }
        OutPass saved = repo.save(OutPass.builder()
                .student(student)
                .reason(req.reason())
                .destination(req.destination())
                .outTime(req.outTime())
                .expectedReturn(req.expectedReturn())
                .status(OutPassStatus.PENDING)
                .build());
        emailService.send(student.getEmail(), "Out-pass request received",
                "Your out-pass request to " + req.destination() + " has been submitted and is awaiting warden approval.");
        return saved;
    }

    public List<OutPass> mine(User student) {
        return repo.findByStudentOrderByCreatedAtDesc(student);
    }

    public List<OutPass> all(OutPassStatus status) {
        return status == null ? repo.findAllByOrderByCreatedAtDesc() : repo.findByStatusOrderByCreatedAtDesc(status);
    }

    public OutPass decide(Long id, DecisionRequest req) {
        OutPass pass = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Out-pass not found"));
        if (pass.getStatus() != OutPassStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This request was already " + pass.getStatus());
        }
        pass.setStatus(req.approved() ? OutPassStatus.APPROVED : OutPassStatus.REJECTED);
        pass.setWardenRemark(req.remark());
        OutPass saved = repo.save(pass);
        emailService.send(pass.getStudent().getEmail(), "Out-pass " + saved.getStatus(),
                "Your out-pass to " + pass.getDestination() + " was " + saved.getStatus()
                        + (req.remark() != null && !req.remark().isBlank() ? ".\nWarden remark: " + req.remark() : "."));
        return saved;
    }
}
