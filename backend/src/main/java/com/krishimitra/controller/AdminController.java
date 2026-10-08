package com.krishimitra.controller;

import com.krishimitra.entity.Feedback;
import com.krishimitra.entity.User;
import com.krishimitra.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> allUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/experts")
    public ResponseEntity<List<User>> allExperts() {
        return ResponseEntity.ok(adminService.getAllExperts());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/feedback")
    public ResponseEntity<List<Feedback>> allFeedback() {
        return ResponseEntity.ok(adminService.getAllFeedback());
    }

    @PostMapping("/feedback")
    public ResponseEntity<Feedback> submitFeedback(@RequestBody Map<String, String> body, HttpServletRequest req) {
        Long userId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(adminService.submitFeedback(userId, body.get("message")));
    }
}
