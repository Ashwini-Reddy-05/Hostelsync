package com.hostelsync.repository;

import com.hostelsync.model.Complaint;
import com.hostelsync.model.ComplaintStatus;
import com.hostelsync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByStudentOrderByCreatedAtDesc(User student);
    List<Complaint> findByStatusOrderByCreatedAtDesc(ComplaintStatus status);
    List<Complaint> findAllByOrderByCreatedAtDesc();
}
