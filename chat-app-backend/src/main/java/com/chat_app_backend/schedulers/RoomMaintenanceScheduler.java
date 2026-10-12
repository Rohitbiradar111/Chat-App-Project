package com.chat_app_backend.schedulers;

import com.chat_app_backend.entities.Message;
import com.chat_app_backend.entities.Room;
import com.chat_app_backend.repositories.RoomRepository;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class RoomMaintenanceScheduler {

    private final RoomRepository roomRepository;

    @Value("${chat.room.inactivity-days:10}")
    private int inactivityDays;

    @Value("${chat.room.empty-retention-hours:24}")
    private int emptyRetentionHours;

    @Value("${chat.message.retention-days:30}")
    private int messageRetentionDays;

    public RoomMaintenanceScheduler(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Scheduled(cron = "${chat.cleanup.cron:0 0 2 * * ?}")
    public MaintenanceResult executeMaintenance() {
        log.info("Starting Room Maintenance Cron Job: Auto-cleaning inactive rooms and ephemeral messages...");

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime messageCutoff = now.minusDays(messageRetentionDays);
        LocalDateTime roomInactivityCutoff = now.minusDays(inactivityDays);
        LocalDateTime emptyRoomCutoff = now.minusHours(emptyRetentionHours);

        List<Room> allRooms = roomRepository.findAll();
        int deletedRoomsCount = 0;
        int purgedMessagesCount = 0;

        for (Room room : allRooms) {
            List<Message> messages = room.getMessages();
            if (messages == null) {
                messages = new ArrayList<>();
                room.setMessages(messages);
            }

            LocalDateTime lastActivity = room.getLastActivityAt();
            if (lastActivity == null) {
                if (!messages.isEmpty()) {
                    Message lastMsg = messages.get(messages.size() - 1);
                    lastActivity = lastMsg.getTimeStamp() != null ? lastMsg.getTimeStamp() : now;
                } else {
                    lastActivity = room.getCreatedAt() != null ? room.getCreatedAt() : now;
                }
            }

            if (messages.isEmpty()) {
                LocalDateTime roomCreated = room.getCreatedAt() != null ? room.getCreatedAt() : lastActivity;
                if (roomCreated.isBefore(emptyRoomCutoff)) {
                    roomRepository.delete(room);
                    deletedRoomsCount++;
                    log.info("Auto-cleaned empty inactive room: {}", room.getRoomId());
                    continue;
                }
            }

            if (lastActivity.isBefore(roomInactivityCutoff)) {
                roomRepository.delete(room);
                deletedRoomsCount++;
                log.info("Auto-cleaned inactive room (last active: {}): {}", lastActivity, room.getRoomId());
                continue;
            }

            int initialMsgCount = messages.size();
            messages.removeIf(m -> m.getTimeStamp() != null && m.getTimeStamp().isBefore(messageCutoff));
            int removedForThisRoom = initialMsgCount - messages.size();

            if (removedForThisRoom > 0) {
                purgedMessagesCount += removedForThisRoom;
                roomRepository.save(room);
                log.info("Purged {} expired messages from room: {}", removedForThisRoom, room.getRoomId());
            }
        }

        log.info("Room Maintenance Finished: Deleted {} inactive rooms, purged {} expired messages.",
                deletedRoomsCount, purgedMessagesCount);

        return new MaintenanceResult(deletedRoomsCount, purgedMessagesCount, now);
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MaintenanceResult {
        private int deletedRooms;
        private int purgedMessages;
        private LocalDateTime executedAt;
    }
}
