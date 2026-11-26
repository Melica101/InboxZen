package it.rfactor.api.repo;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.NoRepositoryBean;
import it.rfactor.api.model.Owned;
import it.rfactor.api.model.Space;

/** Base for per-user rows: every lookup is scoped by userId so other users' ids surface as 404. */
@NoRepositoryBean
public interface OwnedRepo<T extends Owned> extends JpaRepository<T, Long> {
    Optional<T> findByIdAndUserId(Long id, Long userId);
    List<T> findByUserIdAndSpaceIn(Long userId, Collection<Space> spaces, Sort sort);
    void deleteByUserId(Long userId);
}
