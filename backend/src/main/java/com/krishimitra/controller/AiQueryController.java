package com.krishimitra.controller;

import com.krishimitra.dto.AiQueryRequest;
import com.krishimitra.entity.AiQuery;
import com.krishimitra.service.AiQueryService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Module: AI Chat with RAG + Multilingual Query Interface (plain REST, with conversation memory)
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiQueryController {

    private final AiQueryService aiQueryService;

    @PostMapping("/ask")
    public ResponseEntity<AiQuery> ask(@RequestBody AiQueryRequest request, HttpServletRequest req) {
        Long farmerId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(aiQueryService.askQuestion(farmerId, request));
    }

    // "previous chat history" for the AI chatbot
    @GetMapping("/history")
    public ResponseEntity<List<AiQuery>> history(HttpServletRequest req) {
        Long farmerId = (Long) req.getAttribute("userId");
        return ResponseEntity.ok(aiQueryService.getHistory(farmerId));
    }
}
