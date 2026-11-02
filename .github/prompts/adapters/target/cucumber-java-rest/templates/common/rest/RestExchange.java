package __PACKAGE__.shared.cucumber.rest;

import io.restassured.response.Response;

record RestExchange(FrozenRequest request, Response response) {}
