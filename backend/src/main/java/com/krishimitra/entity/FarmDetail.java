package com.krishimitra.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "farm_details")
@Getter
@Setter
@NoArgsConstructor
public class FarmDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    private String farmName;
    private String cropDetails;
    private String location;
    private String preferredLanguage = "English";
    private Double landSizeAcres;
    private String soilType;
}
