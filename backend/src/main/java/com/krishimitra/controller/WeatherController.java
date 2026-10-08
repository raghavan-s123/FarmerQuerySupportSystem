package com.krishimitra.controller;

import com.krishimitra.entity.WeatherData;
import com.krishimitra.service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weather")
@RequiredArgsConstructor
public class WeatherController {

    private final WeatherService weatherService;

    @GetMapping
    public ResponseEntity<WeatherData> getWeather(@RequestParam String location) {
        return ResponseEntity.ok(weatherService.getWeather(location));
    }
}
