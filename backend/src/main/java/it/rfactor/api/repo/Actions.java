package it.rfactor.api.repo;

import java.util.Optional;

import it.rfactor.api.model.ActionStatus;
import it.rfactor.api.model.AgentAction;

public interface Actions extends OwnedRepo<AgentAction> {
    Optional<AgentAction> findFirstByUserIdAndRiskIdAndStatus(Long userId, Long riskId, ActionStatus status);
    Optional<AgentAction> findFirstByUserIdAndEventIdAndStatus(Long userId, Long eventId, ActionStatus status);
}
