package com.krishimitra.controller;

import com.krishimitra.dto.ChatMessageRequest;
import com.krishimitra.entity.ExpertChatMessage;
import com.krishimitra.entity.ExpertQuery;
import com.krishimitra.service.ExpertService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// Module: Expert Consultation - Ask Expert / Accept / Chat / Close (plain REST)
@RestController
@RequestMapping("/api/expert")
@RequiredArgsConstructor
public class ExpertController {

    private final ExpertService expertService;

    @PostMapping("/ask")
    public ResponseEntity<ExpertQuery> askExpert(@RequestBody Map<String, String> body, HttpServletRequest req) {
        Long farmerId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(expertService.askExpert(farmerId, body.get("question")));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ExpertQuery>> pending() {
        return ResponseEntity.ok(expertService.getPendingQueries());
    }

    @PostMapping("/{queryId}/accept")
    public ResponseEntity<ExpertQuery> accept(@PathVariable Long queryId, HttpServletRequest req) {
        Long expertId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(expertService.acceptQuery(queryId, expertId));
    }

    @PostMapping("/{queryId}/message")
    public ResponseEntity<ExpertChatMessage> sendMessage(@PathVariable Long queryId,
                                                            @RequestBody ChatMessageRequest request,
                                                            HttpServletRequest req) {
        Long senderId = (Long) req.getAttribute("userId");

        // JwtAuthFilter puts the role on the authentication as "ROLE_FARMER" /
        // "ROLE_EXPERT" - strip the "ROLE_" prefix to get a plain role string.
        String senderRole = SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().findFirst().map(GrantedAuthority::getAuthority)
                .map(a -> a.replace("ROLE_", ""))
                .orElse("UNKNOWN");

        return ResponseEntity.ok(expertService.sendMessage(queryId, senderId, senderRole, request.getMessage()));
    }

    @GetMapping("/{queryId}/messages")
    public ResponseEntity<List<ExpertChatMessage>> getMessages(@PathVariable Long queryId) {
        return ResponseEntity.ok(expertService.getChatMessages(queryId));
    }

    @PostMapping("/{queryId}/close")
    public ResponseEntity<ExpertQuery> close(@PathVariable Long queryId) {
        return ResponseEntity.ok(expertService.closeQuery(queryId));
    }

    @GetMapping("/my-queries")
    public ResponseEntity<List<ExpertQuery>> myQueries(HttpServletRequest req) {
        Long farmerId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(expertService.getFarmerQueries(farmerId));
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<ExpertQuery>> assigned(HttpServletRequest req) {
        Long expertId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(expertService.getExpertQueries(expertId));
    }
}
