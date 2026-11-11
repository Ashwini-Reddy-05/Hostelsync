package com.hostelsync.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "out_passes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class OutPass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "student_id")
    private User student;

    @Column(nullable = false)
    private String reason;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private LocalDateTime outTime;

    @Column(nullable = false)
    private LocalDateTime expectedReturn;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OutPassStatus status;

    private String wardenRemark;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = OutPassStatus.PENDING;
    }
}
