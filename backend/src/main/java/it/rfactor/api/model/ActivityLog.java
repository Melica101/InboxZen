package it.rfactor.api.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class ActivityLog extends Owned {
    @Column(length = 1000) public String text;
    public Instant createdAt = Instant.now();
}
