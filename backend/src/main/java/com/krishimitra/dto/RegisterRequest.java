package com.krishimitra.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
    @NotBlank
    private String fullName;

    @NotBlank @Email
    private String email;

    @NotBlank
    private String password;

    private String phone;

    @NotBlank
    private String role; // FARMER, STUDENT, EXPERT, ADMIN

    private String preferredLanguage = "English"; // English, Tamil, Telugu
    private String expertDomain; // only used when role == EXPERT
}
