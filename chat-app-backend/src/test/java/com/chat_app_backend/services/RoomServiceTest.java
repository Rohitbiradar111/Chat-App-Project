package com.chat_app_backend.services;

import com.chat_app_backend.entities.Room;
import com.chat_app_backend.exceptions.ResourceNotFoundException;
import com.chat_app_backend.repositories.RoomRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private RoomService roomService;

    @Test
    void testFindByRoomId_Success() {
        Room mockRoom = new Room();
        mockRoom.setRoomId("room1");
        when(roomRepository.findByRoomId("room1")).thenReturn(mockRoom);

        Room result = roomService.findByRoomId("room1");

        assertNotNull(result);
        assertEquals("room1", result.getRoomId());
    }

    @Test
    void testFindByRoomId_NotFound_ThrowsException() {
        when(roomRepository.findByRoomId("missing")).thenReturn(null);

        assertThrows(ResourceNotFoundException.class, () -> {
            roomService.findByRoomId("missing");
        });
    }

    @Test
    void testEvictRoom_Success() {
        assertDoesNotThrow(() -> {
            roomService.evictRoom("room1");
        });
    }
}
