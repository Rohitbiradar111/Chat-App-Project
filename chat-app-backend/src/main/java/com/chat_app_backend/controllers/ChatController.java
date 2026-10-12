package com.chat_app_backend.controllers;

import com.chat_app_backend.entities.Message;
import com.chat_app_backend.entities.Room;
import com.chat_app_backend.exceptions.ResourceNotFoundException;
import com.chat_app_backend.payload.MessageRequest;
import com.chat_app_backend.repositories.RoomRepository;
import com.chat_app_backend.services.RoomService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import java.time.LocalDateTime;

@Controller
@CrossOrigin("${frontend.url}")
public class ChatController {
    private final RoomRepository roomRepository;
    private final RoomService roomService;

    public ChatController(RoomRepository roomRepository, RoomService roomService) {
        this.roomRepository = roomRepository;
        this.roomService = roomService;
    }

    @MessageMapping("/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId}")
    public Message sendMessage(@DestinationVariable String roomId, @RequestBody MessageRequest request) {
        Room room = roomRepository.findByRoomId(roomId);
        Message message = new Message();
        message.setContent(request.getContent());
        message.setSender(request.getSender());
        message.setTimeStamp(LocalDateTime.now());
        if (room != null) {
            room.getMessages().add(message);
            room.setLastActivityAt(LocalDateTime.now());
            roomRepository.save(room);
            roomService.evictRoom(roomId);
        } else {
            throw new ResourceNotFoundException("Room not found with ID: " + roomId);
        }
        return message;
    }
}
