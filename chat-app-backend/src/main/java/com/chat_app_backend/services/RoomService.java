package com.chat_app_backend.services;

import com.chat_app_backend.entities.Room;
import com.chat_app_backend.exceptions.ResourceNotFoundException;
import com.chat_app_backend.repositories.RoomRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Cacheable(value = "rooms", key = "#roomId")
    public Room findByRoomId(String roomId) {
        log.info("Redis Cache MISS: Fetching room '{}' from MongoDB", roomId);
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            throw new ResourceNotFoundException("Room not found with ID: " + roomId);
        }
        return room;
    }

    @CacheEvict(value = "rooms", key = "#roomId")
    public void evictRoom(String roomId) {
        log.info("Redis Cache EVICT: Cleared cache for room '{}'", roomId);
    }
}
