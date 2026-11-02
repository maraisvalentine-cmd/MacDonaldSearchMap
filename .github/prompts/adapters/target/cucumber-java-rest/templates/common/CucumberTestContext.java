package __PACKAGE__.shared.cucumber;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

public final class CucumberTestContext {

    private static final Map<String, Object> VALUES = new HashMap<>();

    private CucumberTestContext() {}

    public static Optional<String> getString(String key) {
        return Optional.ofNullable(VALUES.get(key)).map(Object::toString);
    }

    public static Optional<Integer> getInteger(String key) {
        return get(key, Integer.class);
    }

    public static Optional<Long> getLong(String key) {
        return get(key, Long.class);
    }

    public static Optional<Boolean> getBoolean(String key) {
        return get(key, Boolean.class);
    }

    public static <T> Optional<T> get(String key, Class<T> requiredClass) {
        return Optional.ofNullable(VALUES.get(key)).filter(requiredClass::isInstance).map(requiredClass::cast);
    }

    public static void set(String key, Object value) {
        VALUES.put(key, value);
    }

    public static void reset() {
        VALUES.clear();
    }
}
