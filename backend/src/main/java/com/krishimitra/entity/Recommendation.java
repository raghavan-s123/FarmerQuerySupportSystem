package com.krishimitra.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "recommendations")
@Getter
@Setter
@NoArgsConstructor
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "farmer_id", nullable = false)
    private Long farmerId;

    @Column(columnDefinition = "TEXT")
    private String irrigationAdvice;

    @Column(columnDefinition = "TEXT")
    private String fertilizerAdvice;

    @Column(columnDefinition = "TEXT")
    private String harvestAdvice;

    private LocalDateTime createdAt = LocalDateTime.now();
}
