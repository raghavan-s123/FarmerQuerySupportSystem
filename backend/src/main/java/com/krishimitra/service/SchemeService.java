package com.krishimitra.service;

import com.krishimitra.entity.GovernmentScheme;
import com.krishimitra.repository.GovernmentSchemeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SchemeService {

    private final GovernmentSchemeRepository schemeRepository;

    public List<GovernmentScheme> getAllSchemes() {
        return schemeRepository.findAll();
    }

    public GovernmentScheme addScheme(GovernmentScheme scheme) {
        return schemeRepository.save(scheme);
    }
}
