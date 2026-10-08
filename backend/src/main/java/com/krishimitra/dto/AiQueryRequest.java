package com.krishimitra.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiQueryRequest {
    @NotBlank
    private String question;

    // Farmer's preferred reply language: English, Tamil, Telugu.
    // If omitted, the AI service auto-detects the language of the question itself.
    private String language = "auto";
}
