package repository;

import Entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import javax.management.Notification;
import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByUser(Profile user);
    List<Notification> findByUserAndIsReadFalse(Profile user);
}