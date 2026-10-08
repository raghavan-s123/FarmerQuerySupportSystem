package com.krishimitra.service;

import com.krishimitra.entity.ExpertChatMessage;
import com.krishimitra.entity.ExpertQuery;
import com.krishimitra.repository.ExpertChatMessageRepository;
import com.krishimitra.repository.ExpertQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

// Module: Expert Consultation - Ask Expert / Accept Query / Chat / Close Query (plain REST)
@Service
@RequiredArgsConstructor
public class ExpertService {

    private final ExpertQueryRepository expertQueryRepository;
    private final ExpertChatMessageRepository chatMessageRepository;

    public ExpertQuery askExpert(Long farmerId, String question) {
        ExpertQuery query = new ExpertQuery();
        query.setFarmerId(farmerId);
        query.setQuestion(question);
        query.setStatus(ExpertQuery.Status.PENDING);
        return expertQueryRepository.save(query);
    }

    public List<ExpertQuery> getPendingQueries() {
        return expertQueryRepository.findByStatus(ExpertQuery.Status.PENDING);
    }

    public ExpertQuery acceptQuery(Long queryId, Long expertId) {
        ExpertQuery query = expertQueryRepository.findById(queryId)
                .orElseThrow(() -> new RuntimeException("Query not found"));
        query.setExpertId(expertId);
        query.setStatus(ExpertQuery.Status.ACCEPTED);
        return expertQueryRepository.save(query);
    }

    public ExpertChatMessage sendMessage(Long queryId, Long senderId, String senderRole, String message) {
        ExpertChatMessage chat = new ExpertChatMessage();
        chat.setQueryId(queryId);
        chat.setSenderId(senderId);
        chat.setSenderRole(senderRole);
        chat.setMessage(message);
        return chatMessageRepository.save(chat);
    }

    public List<ExpertChatMessage> getChatMessages(Long queryId) {
        return chatMessageRepository.findByQueryIdOrderBySentAtAsc(queryId);
    }

    public ExpertQuery closeQuery(Long queryId) {
        ExpertQuery query = expertQueryRepository.findById(queryId)
                .orElseThrow(() -> new RuntimeException("Query not found"));
        query.setStatus(ExpertQuery.Status.CLOSED);
        return expertQueryRepository.save(query);
    }

    public List<ExpertQuery> getFarmerQueries(Long farmerId) {
        return expertQueryRepository.findByFarmerIdOrderByCreatedAtDesc(farmerId);
    }

    public List<ExpertQuery> getExpertQueries(Long expertId) {
        return expertQueryRepository.findByExpertIdOrderByCreatedAtDesc(expertId);
    }
}
