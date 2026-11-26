package it.rfactor.api.repo;

import java.util.Optional;
import it.rfactor.api.model.AnalysisRun;
import it.rfactor.api.model.Space;

public interface Runs extends OwnedRepo<AnalysisRun> {
    Optional<AnalysisRun> findFirstByUserIdAndSpaceOrderByIdDesc(Long userId, Space space);
}
