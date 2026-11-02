package __PACKAGE__.shared.cucumber;

import __PACKAGE__.shared.cucumber.rest.CucumberRestClient;
import __PACKAGE__.shared.cucumber.rest.CucumberRestTestContext;
import io.cucumber.java.Before;
import io.quarkus.arc.Unremovable;
import jakarta.inject.Singleton;

@Singleton
@Unremovable
public class CucumberConfiguration {

    private static final int SCENARIO_CONTEXT = 0;
    private static final int RESPONSES = 1;
    private static final int DATABASE = 2;

    private final DatabaseCleaner databaseCleaner;

    CucumberConfiguration(DatabaseCleaner databaseCleaner) {
        this.databaseCleaner = databaseCleaner;
    }

    @Before(order = SCENARIO_CONTEXT)
    public void resetScenarioContext() {
        CucumberTestContext.reset();
        CucumberRestClient.reset();
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
