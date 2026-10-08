package com.krishimitra.controller;

import com.krishimitra.entity.FarmDetail;
import com.krishimitra.service.FarmerService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/farmer")
@RequiredArgsConstructor
public class FarmerController {

    private final FarmerService farmerService;

    @PostMapping("/profile")
    public ResponseEntity<FarmDetail> saveProfile(@RequestBody FarmDetail farmDetail, HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(farmerService.saveOrUpdateFarmDetail(userId, farmDetail));
    }

    @GetMapping("/profile")
    public ResponseEntity<FarmDetail> getProfile(HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(farmerService.getFarmDetail(userId));
    }
}
