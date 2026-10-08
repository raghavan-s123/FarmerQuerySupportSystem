package com.krishimitra.repository;

import com.krishimitra.entity.FarmDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FarmDetailRepository extends JpaRepository<FarmDetail, Long> {
    Optional<FarmDetail> findByUserId(Long userId);
}
