package it.rfactor.api.repo;

import it.rfactor.api.model.ActivityLog;
import it.rfactor.api.model.Space;

public interface Logs extends OwnedRepo<ActivityLog> {
    default void log(Long userId, Space space, String text) {
        var l = new ActivityLog();
        l.userId = userId; l.space = space; l.text = text;
        save(l);
    }
}
