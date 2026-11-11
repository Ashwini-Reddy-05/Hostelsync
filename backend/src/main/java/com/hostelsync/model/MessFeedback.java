package com.hostelsync.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/** One row per student / date / meal: stores attendance intent (for headcount) and optional feedback. */
@Entity
@Table(name = "mess_feedback",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "date", "mealType"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MessFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "student_id")
    private User student;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MealType mealType;

    /** 1 - 5, optional */
    private Integer rating;

    @Column(length = 500)
    private String comment;

    /** Will the student eat this meal? Used by wardens to estimate headcount. */
    @Column(nullable = false)
    private boolean attending;
}
