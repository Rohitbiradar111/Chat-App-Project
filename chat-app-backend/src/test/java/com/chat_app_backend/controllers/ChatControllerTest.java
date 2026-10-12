package com.chat_app_backend.controllers;

import com.chat_app_backend.entities.Message;
import com.chat_app_backend.entities.Room;
import com.chat_app_backend.exceptions.ResourceNotFoundException;
import com.chat_app_backend.payload.MessageRequest;
import com.chat_app_backend.repositories.RoomRepository;
import com.chat_app_backend.services.RoomService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.ArrayList;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomService roomService;

    @InjectMocks
    private ChatController chatController;

    @Test
    void testSendMessage_Success() {
        Room mockRoom = new Room();
        mockRoom.setRoomId("room1");
        mockRoom.setMessages(new ArrayList<>());

        when(roomRepository.findByRoomId("room1")).thenReturn(mockRoom);

        MessageRequest request = new MessageRequest("Hello", "Alice", "room1");

        Message result = chatController.sendMessage("room1", request);

        assertNotNull(result);
        assertEquals("Hello", result.getContent());
        assertEquals("Alice", result.getSender());
        verify(roomRepository, times(1)).save(mockRoom);
        verify(roomService, times(1)).evictRoom("room1");
    }

    @Test
    void testSendMessage_RoomNotFound_ThrowsException() {
        when(roomRepository.findByRoomId("nonexistent")).thenReturn(null);

        MessageRequest request = new MessageRequest("Hello", "Alice", "nonexistent");
        assertThrows(ResourceNotFoundException.class, () -> {
            chatController.sendMessage("nonexistent", request);
        });
        verify(roomRepository, never()).save(any());
        verify(roomService, never()).evictRoom(anyString());
    }
}
