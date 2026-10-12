package com.chat_app_backend.services;

import com.chat_app_backend.entities.Message;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AiSummaryService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestClient restClient = RestClient.create();

    public String generateChatSummary(String roomId, List<Message> messages) {
        if (messages == null || messages.isEmpty()) {
            return "No messages in this chat to summarize.";
        }
        if (apiKey == null || apiKey.isBlank()) {
            return "Please configure GEMINI_API_KEY";
        }

        String transcript = messages.stream()
                .map(m -> m.getSender() + ": " + m.getContent())
                .collect(Collectors.joining("\n"));

        String prompt = "You are a professional chat summarization assistant. Analyze the chat transcript from room '" + roomId + "' and output the summary in this EXACT format. Do not add any introductory text like 'Sure, here is the summary:' at the very beginning.\n\n"
                + "Key Topics in this chat -\n"
                + "- [Topic Name]: [1-sentence brief explanation]\n\n"
                + "Decisions to be taken -\n"
                + "- [List decisions or write 'None.']\n\n"
                + "Action Items -\n"
                + "- [List action items with assignees if mentioned, or write 'None.']\n\n"
                + "Strict Rules:\n"
                + "1. Ignore casual greetings, small talk, and chit-chat.\n"
                + "2. Rely ONLY on the facts directly stated in the transcript below. Do not assume or make things up.\n"
                + "3. Always use a single dash (-) for bullet points.\n\n"
                + "Transcript:\n" + transcript;

        List<String> models = List.of("gemini-3.5-flash-lite", "gemini-flash-latest");

        for (String model : models) {
            try {
                return callGemini(model, prompt);
            } catch (Exception e) {
                log.warn("Gemini model '{}' request failed: {}. Trying fallback model...", model, e.getMessage());
            }
        }

        return "Could not generate AI summary at this moment. Please click 'Regenerate' in a few seconds.";
    }

    private String callGemini(String model, String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey.trim();

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        Map<?, ?> response = restClient.post()
                .uri(url)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(Map.class);

        List<?> candidates = (List<?>) response.get("candidates");
        Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
        Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
        List<?> parts = (List<?>) content.get("parts");
        Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);

        return (String) firstPart.get("text");
    }
}
