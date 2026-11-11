package com.hostelsync.repository;

import com.hostelsync.model.MealType;
import com.hostelsync.model.MessFeedback;
import com.hostelsync.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MessFeedbackRepository extends JpaRepository<MessFeedback, Long> {

    Optional<MessFeedback> findByStudentAndDateAndMealType(User student, LocalDate date, MealType mealType);

    List<MessFeedback> findByStudentOrderByDateDesc(User student);

    List<MessFeedback> findByDateOrderByMealType(LocalDate date);

    /** [mealType, headcount] for students who said they will attend. */
    @Query("select m.mealType, count(m) from MessFeedback m " +
           "where m.date = :date and m.attending = true group by m.mealType")
    List<Object[]> headcountByMeal(@Param("date") LocalDate date);

    /** [mealType, average rating, number of ratings]. */
    @Query("select m.mealType, avg(m.rating), count(m.rating) from MessFeedback m " +
           "where m.date = :date and m.rating is not null group by m.mealType")
    List<Object[]> ratingByMeal(@Param("date") LocalDate date);
}
