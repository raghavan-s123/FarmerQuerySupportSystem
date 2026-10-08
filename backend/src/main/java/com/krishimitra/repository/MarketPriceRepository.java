package com.krishimitra.repository;

import com.krishimitra.entity.MarketPrice;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MarketPriceRepository extends JpaRepository<MarketPrice, Long> {
    List<MarketPrice> findByCropNameIgnoreCaseOrderByRecordedDateDesc(String cropName);
}
