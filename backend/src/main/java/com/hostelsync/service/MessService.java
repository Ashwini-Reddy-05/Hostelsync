package com.hostelsync.service;

import com.hostelsync.dto.Dtos.HeadcountRow;
import com.hostelsync.dto.Dtos.MessRequest;
import com.hostelsync.dto.Dtos.RatingRow;
import com.hostelsync.model.MealType;
import com.hostelsync.model.MessFeedback;
import com.hostelsync.model.User;
import com.hostelsync.repository.MessFeedbackRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MessService {

    private final MessFeedbackRepository repo;

    public MessService(MessFeedbackRepository repo) {
        this.repo = repo;
    }

    /** Creates or updates the student's entry for that date and meal. */
    public MessFeedback submit(User student, MessRequest req) {
        MessFeedback entry = repo.findByStudentAndDateAndMealType(student, req.date(), req.mealType())
                .orElseGet(() -> MessFeedback.builder()
                        .student(student).date(req.date()).mealType(req.mealType()).attending(true).build());
        if (req.attending() != null) entry.setAttending(req.attending());
        if (req.rating() != null) entry.setRating(req.rating());
        if (req.comment() != null) entry.setComment(req.comment());
        return repo.save(entry);
    }

    public List<MessFeedback> mine(User student) {
        return repo.findByStudentOrderByDateDesc(student);
    }

    public List<HeadcountRow> headcount(LocalDate date) {
        List<HeadcountRow> rows = new java.util.ArrayList<>();
        for (MealType meal : MealType.values()) {
            long count = repo.headcountByMeal(date).stream()
                    .filter(r -> r[0] == meal).mapToLong(r -> (Long) r[1]).sum();
            rows.add(new HeadcountRow(meal, count));
        }
        return rows;
    }

    public List<RatingRow> ratings(LocalDate date) {
        return repo.ratingByMeal(date).stream()
                .map(r -> new RatingRow((MealType) r[0], Math.round(((Double) r[1]) * 10.0) / 10.0, (Long) r[2]))
                .toList();
    }

    public List<MessFeedback> feedback(LocalDate date) {
        return repo.findByDateOrderByMealType(date);
    }
}
