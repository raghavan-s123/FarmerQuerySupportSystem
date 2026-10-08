package com.krishimitra.repository;

import com.krishimitra.entity.ExpertChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExpertChatMessageRepository extends JpaRepository<ExpertChatMessage, Long> {
    // Used to load the full chat history for a query when the chat is opened
    List<ExpertChatMessage> findByQueryIdOrderBySentAtAsc(Long queryId);
}
