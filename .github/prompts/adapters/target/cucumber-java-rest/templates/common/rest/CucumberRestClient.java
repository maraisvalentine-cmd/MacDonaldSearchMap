package __PACKAGE__.shared.cucumber.rest;

import __PACKAGE__.shared.cucumber.CucumberTestContext; // @auth
import io.restassured.RestAssured;
import io.restassured.builder.MultiPartSpecBuilder;
import io.restassured.filter.Filter;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public final class CucumberRestClient {

    private static final List<Filter> REQUEST_INTERCEPTORS = new ArrayList<>();

    // @auth-begin
    private static final String TOKEN = "token";

    // Le jeton est posé en en-tête : l'historique garde la requête telle qu'elle est partie, `retry` la rejoue à l'identique.
    private static final Filter TOKEN_INTERCEPTOR = (request, response, context) -> {
        CucumberTestContext.getString(TOKEN).ifPresent(token -> request.header("Authorization", "Bearer " + token));
        return context.next(request, response);
    };
    // @auth-end

    private static final Filter RECORDING_INTERCEPTOR = (request, response, context) -> {
        FrozenRequest frozen = FrozenRequest.of(request);
        var answer = context.next(request, response);
        CucumberRestTestContext.addExchange(frozen, answer);
        return answer;
    };

    private CucumberRestClient() {}

    // @auth-begin
    public static void authenticate(String token) {
        CucumberTestContext.set(TOKEN, token);
    }
    // @auth-end

    public static void reset() {
        REQUEST_INTERCEPTORS.clear();
    }

    // Filtre appliqué aux requêtes suivantes du scénario (en-tête, trace), après le jeton ; retiré par `reset()`.
    public static void addRequestInterceptor(Filter interceptor) {
        REQUEST_INTERCEPTORS.add(interceptor);
    }

    public static void get(String uri) {
        get(uri, Map.of());
    }

    public static void get(String uri, Map<String, ?> queryParameters) {
        request().queryParams(queryParameters).get(uri);
    }

    // `jsonBody` peut être une `String` : elle part telle quelle (corps malformé, champ que la table ne sait pas écrire).
    public static void post(String uri, Object jsonBody) {
        request().contentType(ContentType.JSON).body(jsonBody).post(uri);
    }

    public static void postMultipart(String uri, List<MultipartPart> parts) {
        RequestSpecification request = request().contentType(ContentType.MULTIPART);
        parts.forEach(part -> request.multiPart(new MultiPartSpecBuilder(part.content())
                .controlName(part.controlName())
                .fileName(part.fileName())
                .mimeType(part.mimeType())
                .build()));
        request.post(uri);
    }

    public static void post(String uri) {
        request().post(uri);
    }

    public static void put(String uri, Object jsonBody) {
        request().contentType(ContentType.JSON).body(jsonBody).put(uri);
    }

    public static void patch(String uri, Object jsonBody) {
        request().contentType(ContentType.JSON).body(jsonBody).patch(uri);
    }

    public static void delete(String uri) {
        request().delete(uri);
    }

    private static RequestSpecification request() {
        List<Filter> filters = new ArrayList<>();
        filters.add(TOKEN_INTERCEPTOR); // @auth
        filters.addAll(REQUEST_INTERCEPTORS);
        filters.add(RECORDING_INTERCEPTOR);

        return RestAssured.given().filters(filters);
    }
}
