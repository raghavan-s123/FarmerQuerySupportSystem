package com.krishimitra.service;

import com.krishimitra.entity.DiseaseResult;
import com.krishimitra.repository.DiseaseResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.client.MultipartBodyBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.UUID;

// Module: Crop Disease Detection (pre-trained CNN)
@Service
@RequiredArgsConstructor
public class DiseaseService {

    private final DiseaseResultRepository diseaseResultRepository;

    @Value("${ai.service.base-url}")
    private String aiServiceBaseUrl;

    @Value("${app.upload.dir}")
    private String uploadDir;

   public Map<String, Object> detectDisease(Long farmerId, MultipartFile image) throws IOException {
        Files.createDirectories(Path.of(uploadDir));
        String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
        Path savedPath = Path.of(uploadDir, fileName);
        Files.write(savedPath, image.getBytes());

        WebClient client = WebClient.create(aiServiceBaseUrl);
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", new ByteArrayResource(image.getBytes()) {
            @Override
            public String getFilename() {
                return fileName;
            }
        });

        Map<String, Object> response = client.post()
                .uri("/predict-disease")
                .contentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA)
                .body(org.springframework.web.reactive.function.BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        DiseaseResult result = new DiseaseResult();
        result.setFarmerId(farmerId);
        result.setImagePath(savedPath.toString());

        if (response != null) {
            result.setPredictedDisease((String) response.get("disease"));
            Object conf = response.get("confidence");
            result.setConfidence(conf != null ? Double.valueOf(conf.toString()) : null);
            result.setRecommendation((String) response.get("recommendation"));
        } else {
            result.setPredictedDisease("Unknown");
            result.setRecommendation("AI service unavailable, please try again later.");
        }

        diseaseResultRepository.save(result);

        if (response != null) {
            return response;
        }

        return Map.of(
            "success", false,
            "disease", "Unknown",
            "confidence", 0.0,
            "recommendation", "AI service unavailable, please try again later."
        );
    }

    public List<DiseaseResult> getHistory(Long farmerId) {
        return diseaseResultRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
    }
}
