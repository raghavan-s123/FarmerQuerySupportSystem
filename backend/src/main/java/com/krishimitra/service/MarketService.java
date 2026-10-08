package com.krishimitra.service;

import com.krishimitra.entity.MarketPrice;
import com.krishimitra.repository.MarketPriceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MarketService {

    private final MarketPriceRepository marketPriceRepository;

    public List<MarketPrice> getAllPrices() {
        return marketPriceRepository.findAll();
    }

    public List<MarketPrice> getPriceHistory(String cropName) {
        return marketPriceRepository.findByCropNameIgnoreCaseOrderByRecordedDateDesc(cropName);
    }

    public MarketPrice addPrice(MarketPrice price) {
        return marketPriceRepository.save(price);
    }
}
