package com.chat_app_backend.controllers;

import com.chat_app_backend.entities.Message;
import com.chat_app_backend.entities.Room;
import com.chat_app_backend.exceptions.RoomAlreadyExistsException;
import com.chat_app_backend.repositories.RoomRepository;
import com.chat_app_backend.schedulers.RoomMaintenanceScheduler;
import com.chat_app_backend.services.AiSummaryService;
import com.chat_app_backend.services.RoomService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin("${frontend.url}")
public class RoomController {

    private final RoomRepository roomRepository;
    private final RoomMaintenanceScheduler roomMaintenanceScheduler;
    private final RoomService roomService;
    private final AiSummaryService aiSummaryService;

    public RoomController(RoomRepository roomRepository,
                          RoomMaintenanceScheduler roomMaintenanceScheduler,
                          RoomService roomService,
                          AiSummaryService aiSummaryService) {
        this.roomRepository = roomRepository;
        this.roomMaintenanceScheduler = roomMaintenanceScheduler;
        this.roomService = roomService;
        this.aiSummaryService = aiSummaryService;
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody String roomId) {
        if (roomId == null || roomId.trim().isEmpty()) {
            throw new IllegalArgumentException("Room ID cannot be empty.");
        }
        String cleanRoomId = roomId.trim();
        log.info("Creating room: {}", cleanRoomId);
        if (roomRepository.findByRoomId(cleanRoomId) != null) {
            throw new RoomAlreadyExistsException("Room already exists with ID: " + cleanRoomId);
        }
        Room room = new Room();
        room.setRoomId(cleanRoomId);
        room.setCreatedAt(LocalDateTime.now());
        room.setLastActivityAt(LocalDateTime.now());
        Room savedRoom = roomRepository.save(room);
        roomService.evictRoom(cleanRoomId);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRoom);
    }

    @PostMapping("/maintenance/cleanup")
    public ResponseEntity<?> triggerMaintenanceNow() {
        RoomMaintenanceScheduler.MaintenanceResult result = roomMaintenanceScheduler.executeMaintenance();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId) {
        log.info("User requested to join room: {}", roomId);
        Room room = roomService.findByRoomId(roomId);
        return ResponseEntity.ok(room);
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessages(@PathVariable String roomId,
                                                     @RequestParam(value = "page", defaultValue = "0", required = false) int page,
                                                     @RequestParam(value = "size", defaultValue = "20", required = false) int size) {
        Room room = roomService.findByRoomId(roomId);
        List<Message> messages = room.getMessages() != null ? room.getMessages() : List.of();
        int start = Math.max(0, messages.size() - (page + 1) * size);
        int end = Math.min(messages.size(), start + size);
        List<Message> paginatedMessages = messages.subList(start, end);
        return ResponseEntity.ok(paginatedMessages);
    }

    @GetMapping("/{roomId}/ai-summary")
    public ResponseEntity<?> getRoomAiSummary(@PathVariable String roomId) {
        log.info("Generating AI summary for room: {}", roomId);
        Room room = roomService.findByRoomId(roomId);
        List<Message> messages = room.getMessages() != null ? room.getMessages() : List.of();
        String summary = aiSummaryService.generateChatSummary(roomId, messages);
        return ResponseEntity.ok(Map.of(
                "roomId", roomId,
                "summary", summary,
                "totalMessages", messages.size()
        ));
    }
}
