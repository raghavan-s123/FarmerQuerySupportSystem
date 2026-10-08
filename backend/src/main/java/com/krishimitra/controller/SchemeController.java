package com.krishimitra.controller;

import com.krishimitra.entity.GovernmentScheme;
import com.krishimitra.service.SchemeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schemes")
@RequiredArgsConstructor
public class SchemeController {

    private final SchemeService schemeService;

    @GetMapping
    public ResponseEntity<List<GovernmentScheme>> getAll() {
        return ResponseEntity.ok(schemeService.getAllSchemes());
    }

    @PostMapping
    public ResponseEntity<GovernmentScheme> add(@RequestBody GovernmentScheme scheme) {
        return ResponseEntity.ok(schemeService.addScheme(scheme));
    }
}
