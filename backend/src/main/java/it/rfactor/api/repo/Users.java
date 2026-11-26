package it.rfactor.api.repo;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import it.rfactor.api.model.User;

public interface Users extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
}
