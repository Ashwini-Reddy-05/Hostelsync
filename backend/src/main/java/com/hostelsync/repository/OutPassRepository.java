package com.hostelsync.repository;

import com.hostelsync.model.OutPass;
import com.hostelsync.model.OutPassStatus;
import com.hostelsync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OutPassRepository extends JpaRepository<OutPass, Long> {
    List<OutPass> findByStudentOrderByCreatedAtDesc(User student);
    List<OutPass> findByStatusOrderByCreatedAtDesc(OutPassStatus status);
    List<OutPass> findAllByOrderByCreatedAtDesc();
}
