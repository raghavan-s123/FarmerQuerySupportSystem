package com.krishimitra.controller;

import com.krishimitra.dto.RecommendationRequest;
import com.krishimitra.entity.Recommendation;
import com.krishimitra.service.RecommendationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendation")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @PostMapping("/generate")
    public ResponseEntity<Recommendation> generate(@RequestBody RecommendationRequest request, HttpServletRequest req) {
        Long farmerId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(recommendationService.generateRecommendation(farmerId, request));
    }

    @GetMapping("/history")
    public ResponseEntity<List<Recommendation>> history(HttpServletRequest req) {
        Long farmerId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(recommendationService.getHistory(farmerId));
    }
}
