package it.rfactor.api.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Entity
public class Commitment extends Owned {
    public String title;
    public String owner;
    public String due;          // free text ("Nov 27", "Today")
    public String status = "Upcoming";
    public boolean done;
    @Enumerated(EnumType.STRING) public Source source = Source.MANUAL;
    @ElementCollection(fetch = FetchType.EAGER) public Set<Long> sourceIds = new HashSet<>();
}
