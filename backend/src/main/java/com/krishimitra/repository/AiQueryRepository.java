package com.krishimitra.repository;

import com.krishimitra.entity.AiQuery;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AiQueryRepository extends JpaRepository<AiQuery, Long> {
    List<AiQuery> findByFarmerIdOrderByCreatedAtDesc(Long farmerId);
}
