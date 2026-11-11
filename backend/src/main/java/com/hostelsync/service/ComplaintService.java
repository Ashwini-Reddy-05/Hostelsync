package com.hostelsync.service;

import com.hostelsync.dto.Dtos.ComplaintStatusRequest;
import com.hostelsync.model.Complaint;
import com.hostelsync.model.ComplaintStatus;
import com.hostelsync.model.Role;
import com.hostelsync.model.User;
import com.hostelsync.repository.ComplaintRepository;
import com.hostelsync.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ComplaintService {

    private final ComplaintRepository repo;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final EmailService emailService;

    public ComplaintService(ComplaintRepository repo, UserRepository userRepository,
                            CloudinaryService cloudinaryService, EmailService emailService) {
        this.repo = repo;
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
        this.emailService = emailService;
    }

    public Complaint create(User student, String category, String description, MultipartFile image) {
        String imageUrl = (image != null && !image.isEmpty()) ? cloudinaryService.uploadImage(image) : null;
        Complaint saved = repo.save(Complaint.builder()
                .student(student)
                .category(category)
                .description(description)
                .imageUrl(imageUrl)
                .status(ComplaintStatus.PENDING)
                .build());

        // Alert technicians about the new complaint
        for (User tech : userRepository.findByRole(Role.TECHNICIAN)) {
            emailService.send(tech.getEmail(), "New complaint: " + category,
                    "Student " + student.getName() + " reported: " + description
                            + (imageUrl != null ? "\nPhoto: " + imageUrl : ""));
        }
        return saved;
    }

    public List<Complaint> mine(User student) {
        return repo.findByStudentOrderByCreatedAtDesc(student);
    }

    public List<Complaint> all(ComplaintStatus status) {
        return status == null ? repo.findAllByOrderByCreatedAtDesc() : repo.findByStatusOrderByCreatedAtDesc(status);
    }

    public Complaint updateStatus(Long id, ComplaintStatusRequest req) {
        Complaint c = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Complaint not found"));
        c.setStatus(req.status());
        c.setTechnicianRemark(req.remark());
        Complaint saved = repo.save(c);
        emailService.send(c.getStudent().getEmail(), "Complaint update: " + saved.getStatus(),
                "Your complaint (" + c.getCategory() + ") is now " + saved.getStatus()
                        + (req.remark() != null && !req.remark().isBlank() ? ".\nTechnician note: " + req.remark() : "."));
        return saved;
    }
}
