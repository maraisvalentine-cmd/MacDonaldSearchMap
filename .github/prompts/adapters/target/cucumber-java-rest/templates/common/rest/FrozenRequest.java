package __PACKAGE__.shared.cucumber.rest;

import io.restassured.RestAssured;
import io.restassured.builder.MultiPartSpecBuilder;
import io.restassured.http.Headers;
import io.restassured.response.Response;
import io.restassured.specification.MultiPartSpecification;
import io.restassured.specification.QueryableRequestSpecification;
import io.restassured.specification.RequestSpecification;
import java.util.List;

// La requête telle qu'elle est partie (jeton et langue compris) : `retry` la rejoue à l'identique.
record FrozenRequest(String method, String uri, Headers headers, Object body, List<MultiPartSpecification> multiParts) {

    static FrozenRequest of(QueryableRequestSpecification request) {
        return new FrozenRequest(
                request.getMethod(),
                request.getURI(),
                request.getHeaders(),
                request.getBody(),
                List.copyOf(request.getMultiPartParams()));
    }

    Response replay() {
        RequestSpecification replayed = RestAssured.given().headers(headers);
        if (body != null) {
            replayed.body(body);
        }
        multiParts.forEach(part -> replayed.multiPart(rebuilt(part)));

        return replayed.request(method, uri);
    }

    private static MultiPartSpecification rebuilt(MultiPartSpecification part) {
        return new MultiPartSpecBuilder(part.getContent())
                .controlName(part.getControlName())
                .fileName(part.getFileName())
                .mimeType(part.getMimeType())
                .build();
    }
}
