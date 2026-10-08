package com.krishimitra.service;

import com.krishimitra.entity.Feedback;
import com.krishimitra.entity.User;
import com.krishimitra.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AiQueryRepository aiQueryRepository;
    private final DiseaseResultRepository diseaseResultRepository;
    private final ExpertQueryRepository expertQueryRepository;
    private final FeedbackRepository feedbackRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalFarmers", userRepository.findByRole(User.Role.FARMER).size());
        stats.put("totalExperts", userRepository.findByRole(User.Role.EXPERT).size());
        stats.put("totalAiQueries", aiQueryRepository.count());
        stats.put("totalDiseaseScans", diseaseResultRepository.count());
        stats.put("totalExpertQueries", expertQueryRepository.count());
        return stats;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<User> getAllExperts() {
        return userRepository.findByRole(User.Role.EXPERT);
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public Feedback submitFeedback(Long userId, String message) {
        Feedback feedback = new Feedback();
        feedback.setUserId(userId);
        feedback.setMessage(message);
        return feedbackRepository.save(feedback);
    }

    public List<Feedback> getAllFeedback() {
        return feedbackRepository.findAll();
    }
}
