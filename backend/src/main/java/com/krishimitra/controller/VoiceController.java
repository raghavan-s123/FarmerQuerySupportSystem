package com.krishimitra.controller;

import com.krishimitra.entity.AiQuery;
import com.krishimitra.service.VoiceService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

// Module: Voice Query Assistant
@RestController
@RequestMapping("/api/voice")
@RequiredArgsConstructor
public class VoiceController {

    private final VoiceService voiceService;

    @PostMapping(value = "/query", consumes = "multipart/form-data")
    public ResponseEntity<AiQuery> voiceQuery(@RequestParam("file") MultipartFile file,
                                               @RequestParam(value = "language", defaultValue = "auto") String language,
                                               HttpServletRequest req) throws IOException {
        Long farmerId = (Long) req.getAttribute("userId");
        AiQuery result = voiceService.processVoiceQuery(farmerId, file.getBytes(), file.getOriginalFilename(), language);
        return ResponseEntity.ok(result);
    }
}
