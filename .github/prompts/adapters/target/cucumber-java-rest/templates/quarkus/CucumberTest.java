package __PACKAGE__.shared.cucumber;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

import io.cucumber.core.backend.ObjectFactory;
import io.cucumber.core.eventbus.EventBus;
import io.cucumber.core.feature.FeatureParser;
import io.cucumber.core.feature.FeatureWithLines;
import io.cucumber.core.feature.GluePath;
import io.cucumber.core.filter.Filters;
import io.cucumber.core.gherkin.Feature;
import io.cucumber.core.gherkin.Pickle;
import io.cucumber.core.options.CucumberProperties;
import io.cucumber.core.options.CucumberPropertiesParser;
import io.cucumber.core.options.RuntimeOptions;
import io.cucumber.core.options.RuntimeOptionsBuilder;
import io.cucumber.core.plugin.PluginFactory;
import io.cucumber.core.plugin.Plugins;
import io.cucumber.core.runtime.BackendServiceLoader;
import io.cucumber.core.runtime.CucumberExecutionContext;
import io.cucumber.core.runtime.ExitStatus;
import io.cucumber.core.runtime.FeaturePathFeatureSupplier;
import io.cucumber.core.runtime.ObjectFactorySupplier;
import io.cucumber.core.runtime.SingletonRunnerSupplier;
import io.cucumber.core.runtime.TimeServiceEventBus;
import io.cucumber.plugin.event.Result;
import io.cucumber.plugin.event.Status;
import io.cucumber.plugin.event.TestCaseFinished;
import io.quarkus.arc.Arc;
import io.quarkus.test.junit.QuarkusTest;
import java.time.Clock;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import java.util.function.Supplier;
import java.util.stream.Stream;
import org.junit.jupiter.api.DynamicTest;
import org.junit.jupiter.api.TestFactory;

@QuarkusTest
class CucumberTest {

    private static final String FEATURES = "classpath:features";
    private static final String GLUE = "__PACKAGE__";
    private static final String NAME_SEPARATOR = " > ";
    // Rapport lu par la boucle de feedback ; ajouté aux plugins éventuels de `cucumber.plugin`.
    private static final List<String> PLUGINS = List.of("pretty", "summary", "json:target/cucumber-reports/cucumber.json");

    @TestFactory
    Stream<DynamicTest> scenarios() {
        Supplier<ClassLoader> classLoader = () -> Thread.currentThread().getContextClassLoader();
        RuntimeOptions options = options();
        EventBus bus = new TimeServiceEventBus(Clock.systemUTC(), UUID::randomUUID);
        List<Feature> features =
                new FeaturePathFeatureSupplier(classLoader, options, new FeatureParser(bus::generateId)).get();
        Filters filters = new Filters(options);
        List<Scenario> scenarios = features.stream()
                .flatMap(feature -> feature.getPickles().stream()
                        .filter(filters)
                        .map(pickle -> new Scenario(feature, pickle)))
                .toList();

        assertFalse(scenarios.isEmpty(), "No Cucumber scenario was discovered");

        AtomicReference<Result> lastResult = new AtomicReference<>();
        bus.registerHandlerFor(TestCaseFinished.class, event -> lastResult.set(event.getResult()));
        CucumberExecutionContext context = context(options, bus, classLoader);
        context.startTestRun();
        context.runBeforeAllHooks();
        features.forEach(context::beforeFeature);

        return scenarios.stream()
                .map(scenario -> DynamicTest.dynamicTest(
                        scenario.name(), () -> run(context, scenario.pickle(), lastResult)))
                .onClose(() -> {
                    context.runAfterAllHooks();
                    context.finishTestRun();
                });
    }

    private static RuntimeOptions options() {
        RuntimeOptionsBuilder defaults = new RuntimeOptionsBuilder()
                .addFeature(FeatureWithLines.parse(FEATURES))
                .addGlue(GluePath.parse(GLUE));
        PLUGINS.forEach(defaults::addPluginName);

        return new CucumberPropertiesParser().parse(CucumberProperties.create()).build(defaults.build());
    }

    private static CucumberExecutionContext context(
            RuntimeOptions options, EventBus bus, Supplier<ClassLoader> classLoader) {
        ObjectFactory objectFactory = new ArcObjectFactory();
        ObjectFactorySupplier objectFactorySupplier = () -> objectFactory;
        ExitStatus exitStatus = new ExitStatus(options);
        Plugins plugins = new Plugins(new PluginFactory(), options);
        plugins.addPlugin(exitStatus);
        plugins.setEventBusOnEventListenerPlugins(bus);

        return new CucumberExecutionContext(
                bus,
                exitStatus,
                new SingletonRunnerSupplier(
                        options, bus, new BackendServiceLoader(classLoader, objectFactorySupplier), objectFactorySupplier));
    }

    private static void run(CucumberExecutionContext context, Pickle pickle, AtomicReference<Result> lastResult)
            throws Throwable {
        lastResult.set(null);
        context.runTestCase(runner -> runner.runPickle(pickle));

        Result result = lastResult.get();
        if (result.getError() != null) {
            throw result.getError();
        }
        assertEquals(Status.PASSED, result.getStatus());
    }

    private record Scenario(Feature feature, Pickle pickle) {

        String name() {
            return feature.getName().orElse(feature.getUri().toString()) + NAME_SEPARATOR + pickle.getName();
        }
    }

    private static final class ArcObjectFactory implements ObjectFactory {

        @Override
        public boolean addClass(Class<?> glueClass) {
            return true;
        }

        @Override
        public void start() {}

        @Override
        public void stop() {}

        @Override
        public <T> T getInstance(Class<T> glueClass) {
            return Arc.container().instance(glueClass).get();
        }
    }
}
