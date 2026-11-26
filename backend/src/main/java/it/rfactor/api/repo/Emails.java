package it.rfactor.api.repo;

import java.util.Collection;
import java.util.List;
import it.rfactor.api.model.Email;

public interface Emails extends OwnedRepo<Email> {
    List<Email> findByUserIdAndIdIn(Long userId, Collection<Long> ids);
    long countByUserId(Long userId);
}
