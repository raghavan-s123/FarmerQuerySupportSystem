package com.krishimitra.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Module: AI Chat with RAG + Multilingual Query Interface.
 * Stores the full multilingual pipeline trail: original text -> detected
 * language -> English translation -> English LLM answer -> translated-back
 * final answer, so the whole flow described in the paper is auditable.
 */
@Entity
@Table(name = "ai_queries")
@Getter
@Setter
@NoArgsConstructor
public class AiQuery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String originalQuestion;

    private String detectedLanguage; // en, ta, te ...

    @Column(columnDefinition = "TEXT")
    private String translatedQuestion;

    @Column(columnDefinition = "TEXT")
    private String answerEnglish;

    @Column(columnDefinition = "TEXT")
    private String finalAnswer;

    @Column(columnDefinition = "TEXT")
    private String sourceDocuments;

    private String inputType = "TEXT"; // TEXT or VOICE

    private LocalDateTime createdAt = LocalDateTime.now();
}
