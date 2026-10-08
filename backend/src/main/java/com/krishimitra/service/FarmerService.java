package com.krishimitra.service;

import com.krishimitra.entity.FarmDetail;
import com.krishimitra.repository.FarmDetailRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FarmerService {

    private final FarmDetailRepository farmDetailRepository;

    public FarmDetail saveOrUpdateFarmDetail(Long userId, FarmDetail incoming) {
        FarmDetail farmDetail = farmDetailRepository.findByUserId(userId).orElse(new FarmDetail());
        farmDetail.setUserId(userId);
        farmDetail.setFarmName(incoming.getFarmName());
        farmDetail.setCropDetails(incoming.getCropDetails());
        farmDetail.setLocation(incoming.getLocation());
        farmDetail.setPreferredLanguage(incoming.getPreferredLanguage());
        farmDetail.setLandSizeAcres(incoming.getLandSizeAcres());
        farmDetail.setSoilType(incoming.getSoilType());
        return farmDetailRepository.save(farmDetail);
    }

    public FarmDetail getFarmDetail(Long userId) {
        return farmDetailRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Farm profile not found. Please create one first."));
    }
}
