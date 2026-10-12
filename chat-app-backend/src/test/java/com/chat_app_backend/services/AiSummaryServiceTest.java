package com.chat_app_backend.services;

import com.chat_app_backend.entities.Message;
import org.junit.jupiter.api.Test;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class AiSummaryServiceTest {

    @Test
    void testGenerateChatSummary_EmptyMessages() {
        AiSummaryService service = new AiSummaryService();
        String summary = service.generateChatSummary("room1", new ArrayList<>());

        assertNotNull(summary);
        assertTrue(summary.contains("No messages"));
    }

    @Test
    void testGenerateChatSummary_NoApiKey() {
        AiSummaryService service = new AiSummaryService();

        Message m1 = new Message("Alice", "Hello team!", LocalDateTime.now());
        List<Message> messages = List.of(m1);

        String summary = service.generateChatSummary("test-room", messages);

        assertNotNull(summary);
        assertTrue(summary.contains("GEMINI_API_KEY"));
    }
}
