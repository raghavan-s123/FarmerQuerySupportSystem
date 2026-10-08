package com.krishimitra.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Every chat message between a Farmer and Expert is persisted here. This is
 * how "previous chat history" survives page refreshes: whenever a chat is
 * opened, the frontend fetches the full history for that query from here.
 */
@Entity
@Table(name = "expert_chat_messages")
@Getter
@Setter
@NoArgsConstructor
public class ExpertChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "query_id", nullable = false)
    private Long queryId;

    @Column(name = "sender_id", nullable = false)
    private Long senderId;

    private String senderRole; // FARMER or EXPERT (handy for chat bubble styling)

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    private LocalDateTime sentAt = LocalDateTime.now();
}
