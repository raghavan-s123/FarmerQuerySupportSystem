package com.krishimitra.controller;

import com.krishimitra.entity.MarketPrice;
import com.krishimitra.service.MarketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/market")
@RequiredArgsConstructor
public class MarketController {

    private final MarketService marketService;

    @GetMapping("/prices")
    public ResponseEntity<List<MarketPrice>> getAllPrices() {
        return ResponseEntity.ok(marketService.getAllPrices());
    }

    @GetMapping("/history")
    public ResponseEntity<List<MarketPrice>> getHistory(@RequestParam String crop) {
        return ResponseEntity.ok(marketService.getPriceHistory(crop));
    }

    @PostMapping("/prices")
    public ResponseEntity<MarketPrice> addPrice(@RequestBody MarketPrice price) {
        return ResponseEntity.ok(marketService.addPrice(price));
    }
}
