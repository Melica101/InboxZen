package it.rfactor.api.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
public class Email extends Owned {
    public String sender;
    public String subject;
    @Column(length = 10000) public String body;
    public Instant receivedAt;
    public String priority = "Normal";
}
