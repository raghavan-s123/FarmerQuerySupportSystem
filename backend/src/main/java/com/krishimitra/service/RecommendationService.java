package com.krishimitra.service;

import com.krishimitra.dto.RecommendationRequest;
import com.krishimitra.entity.Recommendation;
import com.krishimitra.repository.RecommendationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;

    public Recommendation generateRecommendation(Long farmerId, RecommendationRequest request) {
        Recommendation rec = new Recommendation();
        rec.setFarmerId(farmerId);

        if (request.getRainfall() != null && request.getRainfall() > 10) {
            rec.setIrrigationAdvice("Good rainfall recorded. Skip irrigation for the next 2-3 days.");
        } else if (request.getHumidity() != null && request.getHumidity() < 40) {
            rec.setIrrigationAdvice("Low humidity detected. Irrigate the field early morning or evening.");
        } else {
            rec.setIrrigationAdvice("Maintain regular irrigation schedule for " + request.getCropName() + ".");
        }

        if ("Sandy".equalsIgnoreCase(request.getSoilType())) {
            rec.setFertilizerAdvice("Sandy soil drains fast. Apply fertilizer in smaller, frequent doses.");
        } else if ("Clay".equalsIgnoreCase(request.getSoilType())) {
            rec.setFertilizerAdvice("Clay soil retains nutrients well. Apply standard NPK dose as per crop stage.");
        } else {
            rec.setFertilizerAdvice("Apply balanced NPK fertilizer based on soil test results.");
        }

        if (request.getLastDiseaseDetected() != null && !request.getLastDiseaseDetected().isBlank()
                && !request.getLastDiseaseDetected().equalsIgnoreCase("Healthy")) {
            rec.setHarvestAdvice("Disease detected (" + request.getLastDiseaseDetected()
                    + "). Treat the crop before harvesting to avoid yield/quality loss.");
        } else {
            rec.setHarvestAdvice("Crop looks healthy. Harvest at the recommended maturity stage for best yield.");
        }

        return recommendationRepository.save(rec);
    }

    public List<Recommendation> getHistory(Long farmerId) {
        return recommendationRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
    }
}
