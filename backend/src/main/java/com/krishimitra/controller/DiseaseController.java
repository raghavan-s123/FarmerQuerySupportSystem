package com.krishimitra.controller;

import com.krishimitra.entity.DiseaseResult;
import com.krishimitra.service.DiseaseService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/disease")
@RequiredArgsConstructor
public class DiseaseController {

    private final DiseaseService diseaseService;

    @PostMapping(value = "/detect", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, Object>> detect(
        @RequestParam("file") MultipartFile file,
        HttpServletRequest req) throws IOException {

        Long farmerId = (Long) req.getAttribute("userId");

        return ResponseEntity.ok(
            diseaseService.detectDisease(farmerId, file)
        );
    }

    @GetMapping("/history")
    public ResponseEntity<List<DiseaseResult>> history(HttpServletRequest req) {
        Long farmerId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(diseaseService.getHistory(farmerId));
    }
}
