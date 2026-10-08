package com.krishimitra.service;

import com.krishimitra.entity.WeatherData;
import com.krishimitra.repository.WeatherDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class WeatherService {

    private final WeatherDataRepository weatherDataRepository;

    @Value("${weather.api.key}")
    private String apiKey;

    @Value("${weather.api.base-url}")
    private String baseUrl;

    @SuppressWarnings("unchecked")
    public WeatherData getWeather(String location) {
        WebClient client = WebClient.create();

        Map<String, Object> response = client.get()
                .uri(baseUrl + "?q=" + location + "&appid=" + apiKey + "&units=metric")
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        WeatherData weatherData = new WeatherData();
        weatherData.setLocation(location);

        if (response != null && response.containsKey("main")) {
            Map<String, Object> main = (Map<String, Object>) response.get("main");
            weatherData.setTemperature(Double.valueOf(main.get("temp").toString()));
            weatherData.setHumidity(Double.valueOf(main.get("humidity").toString()));

            double rain = 0.0;
            if (response.containsKey("rain")) {
                Map<String, Object> rainMap = (Map<String, Object>) response.get("rain");
                Object oneHour = rainMap.get("1h");
                if (oneHour != null) rain = Double.parseDouble(oneHour.toString());
            }
            weatherData.setRainfall(rain);
        } else {
            weatherData.setTemperature(28.0);
            weatherData.setHumidity(65.0);
            weatherData.setRainfall(2.0);
        }

        return weatherDataRepository.save(weatherData);
    }
}
