package com.krishimitra.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RecommendationRequest {
    private String cropName;
    private String soilType;
    private Double temperature;
    private Double humidity;
    private Double rainfall;
    private String lastDiseaseDetected;
}
