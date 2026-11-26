package it.rfactor.api.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
public class Risk extends Owned {
    public String title;
    @Column(length = 2000) public String explanation;
    public String severity = "Medium";
    public String exposure;
    @Enumerated(EnumType.STRING) public RiskStatus status = RiskStatus.OPEN;
    @Column(length = 2000) public String resolution;
    @Enumerated(EnumType.STRING) public Source source = Source.AI;
    @ElementCollection(fetch = FetchType.EAGER) public Set<Long> sourceIds = new HashSet<>();
    @ElementCollection(fetch = FetchType.EAGER) @OrderColumn public List<ChainNode> chain = new ArrayList<>();
}
