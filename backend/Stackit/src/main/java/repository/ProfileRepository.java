package repository;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<Profile, UUID> {

    Optional<Profile> findByEmail(String email);
    Optional<Profile> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
}