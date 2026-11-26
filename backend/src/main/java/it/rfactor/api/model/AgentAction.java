package it.rfactor.api.model;

import jakarta.persistence.*;
import java.time.Instant;

/** A draft (or decided) agent proposal. Nothing is ever actually sent. */
@Entity
public class AgentAction extends Owned {
    @Enumerated(EnumType.STRING) public ActionType type;
    @Enumerated(EnumType.STRING) public ActionStatus status = ActionStatus.DRAFT;
    public Long riskId;          // ESCALATION
    public Long eventId;         // RESCHEDULE
    public Instant newStart;
    public Instant newEnd;
    public String recipients;
    public String subject;
    @Column(length = 5000) public String body;
    public Instant createdAt = Instant.now();
    public Instant decidedAt;
}
