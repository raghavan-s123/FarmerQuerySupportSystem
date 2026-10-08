package com.krishimitra.repository;

import com.krishimitra.entity.ExpertQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpertQueryRepository extends JpaRepository<ExpertQuery, Long> {
    List<ExpertQuery> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
    List<ExpertQuery> findByStatus(ExpertQuery.Status status);
    List<ExpertQuery> findByExpertIdOrderByCreatedAtDesc(Long expertId);
}
