package com.krishimitra.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "disease_results")
@Getter
@Setter
@NoArgsConstructor
public class DiseaseResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    private String imagePath;
    private String predictedDisease;
    private Double confidence;

    @Column(columnDefinition = "TEXT")
    private String recommendation;

    private LocalDateTime createdAt = LocalDateTime.now();
}
