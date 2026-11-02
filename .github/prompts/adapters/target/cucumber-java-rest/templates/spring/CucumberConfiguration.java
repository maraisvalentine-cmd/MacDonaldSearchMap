package __PACKAGE__.shared.cucumber;

import __PACKAGE__.shared.cucumber.rest.CucumberRestClient;
import __PACKAGE__.shared.cucumber.rest.CucumberRestTestContext;
import io.cucumber.java.Before;
import io.cucumber.spring.CucumberContextConfiguration;
import io.restassured.RestAssured;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
@CucumberContextConfiguration
@SpringBootTest(classes = __APP_CLASS__.class, webEnvironment = WebEnvironment.RANDOM_PORT)
public class CucumberConfiguration {

    private static final int SCENARIO_CONTEXT = 0;
    private static final int RESPONSES = 1;
    private static final int DATABASE = 2;

    @LocalServerPort
    private int port;

    @Autowired
    private DatabaseCleaner databaseCleaner;

    @Before(order = SCENARIO_CONTEXT)
    public void resetScenarioContext() {
        CucumberTestContext.reset();
        CucumberRestClient.reset();
        RestAssured.port = port;
    }

    @Before(order = RESPONSES)
    public void resetResponses() {
        CucumberRestTestContext.reset();
    }

    @Before(order = DATABASE)
    public void emptyDatabase() {
        databaseCleaner.emptyEveryTable();
    }
}
