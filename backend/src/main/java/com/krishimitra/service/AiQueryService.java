package com.krishimitra.service;

import com.krishimitra.dto.AiQueryRequest;
import com.krishimitra.entity.AiQuery;
import com.krishimitra.repository.AiQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Module: AI Chat with RAG + Multilingual Query Interface (plain REST).
 * Flow:
 *   Farmer types/speaks in Tamil/Telugu/English
 *     -> Spring Boot forwards to the Python AI service, along with the
 *        farmer's recent conversation turns (for memory/context)
 *     -> AI service detects language (BERT-family model), translates to
 *        English if needed, retrieves context via FAISS (RAG), asks Groq
 *        Llama for an answer (using the conversation history as context),
 *        translates the answer back
 *     -> Spring Boot stores the full trail and returns the final answer.
 */
@Service
@RequiredArgsConstructor
public class AiQueryService {

    private final AiQueryRepository aiQueryRepository;

    @Value("${ai.service.base-url}")
    private String aiServiceBaseUrl;

    // How many previous Q&A turns to send back as conversation memory/context.
    private static final int MAX_HISTORY_TURNS = 6;

    @SuppressWarnings("unchecked")
    public AiQuery askQuestion(Long farmerId, AiQueryRequest request) {
        WebClient client = WebClient.create(aiServiceBaseUrl);

        List<Map<String, String>> history = buildConversationHistory(farmerId);

        Map<String, Object> response = client.post()
                .uri("/ask")
                .bodyValue(Map.of(
                        "question", request.getQuestion(),
                        "language", request.getLanguage(),
                        "history", history
                ))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        AiQuery query = new AiQuery();
        query.setFarmerId(farmerId);
        query.setOriginalQuestion(request.getQuestion());

        if (response != null) {
            query.setDetectedLanguage((String) response.get("detected_language"));
            query.setTranslatedQuestion((String) response.get("translated_question"));
            query.setAnswerEnglish((String) response.get("answer_english"));
            query.setFinalAnswer((String) response.get("final_answer"));
            Object sources = response.get("sources");
            query.setSourceDocuments(sources != null ? sources.toString() : "");
        } else {
            query.setFinalAnswer("Sorry, the AI service is currently unavailable. Please try again later.");
        }

        return aiQueryRepository.save(query);
    }

    public List<AiQuery> getHistory(Long farmerId) {
        return aiQueryRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
    }

    /**
     * Builds the last few Q&A turns (in English) to send to the AI service
     * as conversation memory, so it can resolve follow-up questions like
     * "how much water does it need?" instead of treating every message as
     * a brand new, unrelated question.
     */
    private List<Map<String, String>> buildConversationHistory(Long farmerId) {
        List<AiQuery> recent = aiQueryRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);

        return recent.stream()
                .limit(MAX_HISTORY_TURNS)
                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt())) // oldest -> newest
                .map(q -> Map.of(
                        "question", q.getTranslatedQuestion() != null ? q.getTranslatedQuestion() : q.getOriginalQuestion(),
                        "answer", q.getAnswerEnglish() != null ? q.getAnswerEnglish() : (q.getFinalAnswer() != null ? q.getFinalAnswer() : "")
                ))
                .collect(Collectors.toList());
    }
}
