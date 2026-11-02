package __PACKAGE__.shared.cucumber.rest;

import io.restassured.path.json.JsonPath;
import io.restassured.response.Response;
import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

public final class CucumberRestTestContext {

    private static final Pattern RESOURCE_NAME = Pattern.compile("[A-Za-z0-9_-]+");

    private static final List<RestExchange> HISTORY = new ArrayList<>();

    private CucumberRestTestContext() {}

    static void addExchange(FrozenRequest request, Response response) {
        HISTORY.add(new RestExchange(request, response));
    }

    public static List<Response> history() {
        return HISTORY.stream().map(RestExchange::response).toList();
    }

    public static String getUri() {
        return lastExchange("read the last URI").request().uri();
    }

    public static Optional<Response> getResponse() {
        return HISTORY.isEmpty() ? Optional.empty() : Optional.of(HISTORY.getLast().response());
    }

    // Rejoue la dernière requête figée et empile la nouvelle réponse.
    public static void retry() {
        FrozenRequest request = lastExchange("retry").request();
        addExchange(request, request.replay());
    }

    // Élément de la réponse la plus récente non vide dont l'URI contient le segment `resource`.
    public static <T> Optional<T> getElement(String resource, String jsonPath) {
        if (resource == null || !RESOURCE_NAME.matcher(resource).matches()) {
            throw new AssertionError("Invalid resource name '" + resource + "': expected letters, digits, '-' or '_'");
        }

        return HISTORY.reversed().stream()
                .filter(exchange -> concerns(exchange, resource))
                .map(RestExchange::response)
                .filter(response -> !response.asString().isBlank())
                .findFirst()
                .map(response -> JsonPath.from(response.asString()).<T>get(jsonPath));
    }

    public static int getStatus() {
        return lastResponse().statusCode();
    }

    public static String getResponseHeader(String name) {
        return lastResponse().header(name);
    }

    public static String getBody() {
        return lastResponse().asString();
    }

    public static <T> T getElement(String jsonPath) {
        return body().get(jsonPath);
    }

    public static String getText(String jsonPath) {
        return body().getString(jsonPath);
    }

    public static int countEntries(String jsonPath) {
        Object element = getElement(jsonPath);

        if (element == null) {
            return 0;
        }

        return element instanceof List<?> entries ? entries.size() : 1;
    }

    public static void reset() {
        HISTORY.clear();
    }

    private static JsonPath body() {
        return JsonPath.from(getBody());
    }

    private static boolean concerns(RestExchange exchange, String resource) {
        return List.of(URI.create(exchange.request().uri()).getPath().split("/")).contains(resource);
    }

    private static Response lastResponse() {
        return lastExchange("read the last response").response();
    }

    private static RestExchange lastExchange(String action) {
        if (HISTORY.isEmpty()) {
            throw new AssertionError("Can't " + action + ": no response recorded in this scenario");
        }

        return HISTORY.getLast();
    }
}
