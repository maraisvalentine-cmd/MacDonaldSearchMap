package __PACKAGE__.shared.cucumber;

import __PACKAGE__.shared.cucumber.rest.CucumberRestClient;
import io.cucumber.java.en.Given;

public class AuthenticationSteps {

    @Given("I am logged in as admin")
    public void iAmLoggedInAsAdmin() {
        CucumberRestClient.authenticate(TestTokens.admin());
    }
}
