package it.rfactor.api.model;

import jakarta.persistence.*;
import java.time.Instant;

/** Latest AI summary per user+space. */
@Entity
public class AnalysisRun extends Owned {
    @Column(length = 2000) public String summary;
    public String mode;
    public Instant createdAt = Instant.now();
}
