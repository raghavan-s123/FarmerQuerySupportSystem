package com.krishimitra.service;

import com.krishimitra.entity.AiQuery;
import com.krishimitra.repository.AiQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.core.io.ByteArrayResource;

import java.util.Map;

/**
 * Module: Voice Query Assistant.
 * Spring Boot forwards the recorded audio to the Python service, which:
 *   1. converts speech to text
 *   2. detects the language / extracts context (BERT-family model)
 *   3. runs the same multilingual RAG pipeline used by text queries
 *   4. converts the answer back to speech in the farmer's language
 * The full turn (transcription + answer) is stored in ai_queries so it also
 * shows up in "previous chat history".
 */
@Service
@RequiredArgsConstructor
public class VoiceService {

    private final AiQueryRepository aiQueryRepository;

    @Value("${ai.service.base-url}")
    private String aiServiceBaseUrl;

    @SuppressWarnings("unchecked")
    public AiQuery processVoiceQuery(Long farmerId, byte[] audioBytes, String fileName, String language) {
        WebClient client = WebClient.create(aiServiceBaseUrl);

        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", new ByteArrayResource(audioBytes) {
            @Override
            public String getFilename() {
                return fileName;
            }
        });
        builder.part("language", language);

        Map<String, Object> response = client.post()
                .uri("/voice-query")
                .contentType(org.springframework.http.MediaType.MULTIPART_FORM_DATA)
                .body(org.springframework.web.reactive.function.BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        AiQuery query = new AiQuery();
        query.setFarmerId(farmerId);
        query.setInputType("VOICE");

        if (response != null) {
            query.setOriginalQuestion((String) response.get("transcribed_text"));
            query.setDetectedLanguage((String) response.get("detected_language"));
            query.setTranslatedQuestion((String) response.get("translated_question"));
            query.setAnswerEnglish((String) response.get("answer_english"));
            query.setFinalAnswer((String) response.get("final_answer"));
        }

        return aiQueryRepository.save(query);
    }
}
