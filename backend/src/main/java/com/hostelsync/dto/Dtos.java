package com.hostelsync.dto;

import com.hostelsync.model.ComplaintStatus;
import com.hostelsync.model.MealType;
import com.hostelsync.model.Role;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

public final class Dtos {

    private Dtos() {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record RegisterRequest(@NotBlank String name,
                                  @NotBlank @Email String email,
                                  @NotBlank @Size(min = 6, message = "Password must be at least 6 characters") String password,
                                  String rollNumber,
                                  String phone) {}

    public record AuthResponse(String token, Long id, String name, String email, Role role) {}

    public record OutPassRequest(@NotBlank String reason,
                                 @NotBlank String destination,
                                 @NotNull LocalDateTime outTime,
                                 @NotNull LocalDateTime expectedReturn) {}

    public record DecisionRequest(boolean approved, String remark) {}

    public record ComplaintStatusRequest(@NotNull ComplaintStatus status, String remark) {}

    public record MessRequest(@NotNull LocalDate date,
                              @NotNull MealType mealType,
                              @Min(1) @Max(5) Integer rating,
                              @Size(max = 500) String comment,
                              Boolean attending) {}

    public record RoomRequest(@NotBlank String roomNumber, @Min(1) int capacity) {}

    public record AllocateRequest(@NotNull Long studentId) {}

    public record HeadcountRow(MealType mealType, long count) {}

    public record RatingRow(MealType mealType, double average, long responses) {}
}
