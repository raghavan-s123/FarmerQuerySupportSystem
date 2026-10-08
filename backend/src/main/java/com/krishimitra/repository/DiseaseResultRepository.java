package com.krishimitra.repository;

import com.krishimitra.entity.DiseaseResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DiseaseResultRepository extends JpaRepository<DiseaseResult, Long> {
    List<DiseaseResult> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
}
