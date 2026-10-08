package com.krishimitra.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * One shared "users" table for Farmer, Student, Expert and Admin.
 * `expertDomain` is only used when role == EXPERT, matching the paper's
 * "Login Page for Experts" module ("Details of expert and their domain").
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // BCrypt hash

    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String preferredLanguage = "English"; // English, Tamil, Telugu ...

    private String expertDomain; // e.g. "Soil Science", "Plant Pathology" (EXPERT only)

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Role {
        FARMER, STUDENT, EXPERT, ADMIN
    }
}
