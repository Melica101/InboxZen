package it.rfactor.api.model;

public enum Space {
    WORK, PERSONAL;

    /** Filter helper: null means both spaces. */
    public static java.util.Set<Space> scope(Space s) {
        return s == null ? java.util.EnumSet.allOf(Space.class) : java.util.EnumSet.of(s);
    }
}
