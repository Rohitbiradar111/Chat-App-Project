package com.chat_app_backend.controllers;

import com.chat_app_backend.entities.Room;
import com.chat_app_backend.exceptions.ResourceNotFoundException;
import com.chat_app_backend.exceptions.RoomAlreadyExistsException;
import com.chat_app_backend.repositories.RoomRepository;
import com.chat_app_backend.schedulers.RoomMaintenanceScheduler;
import com.chat_app_backend.services.AiSummaryService;
import com.chat_app_backend.services.RoomService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoomControllerTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomMaintenanceScheduler roomMaintenanceScheduler;

    @Mock
    private RoomService roomService;

    @Mock
    private AiSummaryService aiSummaryService;

    @InjectMocks
    private RoomController roomController;

    @Test
    void testCreateRoom_Success() {
        when(roomRepository.findByRoomId("room1")).thenReturn(null);
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response = roomController.createRoom("room1");

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void testCreateRoom_AlreadyExists_ThrowsException() {
        when(roomRepository.findByRoomId("room1")).thenReturn(new Room());

        assertThrows(RoomAlreadyExistsException.class, () -> {
            roomController.createRoom("room1");
        });
    }

    @Test
    void testJoinRoom_Success() {
        Room mockRoom = new Room();
        mockRoom.setRoomId("room1");
        when(roomService.findByRoomId("room1")).thenReturn(mockRoom);
        ResponseEntity<?> response = roomController.joinRoom("room1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockRoom, response.getBody());
    }

    @Test
    void testJoinRoom_NotFound_ThrowsException() {
        when(roomService.findByRoomId("unknown")).thenThrow(new ResourceNotFoundException("Room not found with ID: unknown"));

        assertThrows(ResourceNotFoundException.class, () -> {
            roomController.joinRoom("unknown");
        });
    }

    @Test
    void testGetRoomAiSummary_Success() {
        Room mockRoom = new Room();
        mockRoom.setRoomId("room1");
        mockRoom.setMessages(new java.util.ArrayList<>());
        when(roomService.findByRoomId("room1")).thenReturn(mockRoom);
        when(aiSummaryService.generateChatSummary("room1", mockRoom.getMessages()))
                .thenReturn("Test AI Summary");

        ResponseEntity<?> response = roomController.getRoomAiSummary("room1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void testGetMessages_Success() {
        Room mockRoom = new Room();
        mockRoom.setRoomId("room1");
        mockRoom.setMessages(new java.util.ArrayList<>());
        when(roomService.findByRoomId("room1")).thenReturn(mockRoom);
        ResponseEntity<java.util.List<com.chat_app_backend.entities.Message>> response =
                roomController.getMessages("room1", 0, 20);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void testTriggerMaintenanceNow_Success() {
        RoomMaintenanceScheduler.MaintenanceResult mockResult =
                new RoomMaintenanceScheduler.MaintenanceResult(1, 2, java.time.LocalDateTime.now());
        when(roomMaintenanceScheduler.executeMaintenance()).thenReturn(mockResult);
        ResponseEntity<?> response = roomController.triggerMaintenanceNow();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(mockResult, response.getBody());
    }
}
