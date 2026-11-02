package __PACKAGE__.shared.cucumber;

import io.quarkus.arc.Unremovable;
import jakarta.inject.Singleton;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;
import javax.sql.DataSource;

@Singleton
@Unremovable
class DatabaseCleaner {

    private static final String BASE_TABLES =
            "SELECT table_name FROM information_schema.tables"
                    + " WHERE UPPER(table_schema) = UPPER(?) AND table_type = 'BASE TABLE'";

    private static final List<String> MIGRATION_TABLES = List.of("databasechangelog", "databasechangeloglock", "flyway_schema_history");

    private final DataSource dataSource;

    DatabaseCleaner(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    void emptyEveryTable() {
        try (Connection connection = dataSource.getConnection();
                Statement statement = connection.createStatement()) {
            List<String> tables = tablesToEmpty(connection);
            if (isH2(connection)) {
                statement.execute("SET REFERENTIAL_INTEGRITY FALSE");
                for (String table : tables) {
                    statement.execute("TRUNCATE TABLE " + table + " RESTART IDENTITY");
                }
                statement.execute("SET REFERENTIAL_INTEGRITY TRUE");
            } else if (!tables.isEmpty()) {
                statement.execute("TRUNCATE TABLE " + String.join(", ", tables) + " CASCADE");
            }
        } catch (SQLException e) {
            throw new IllegalStateException(e);
        }
    }

    private List<String> tablesToEmpty(Connection connection) throws SQLException {
        List<String> all = new ArrayList<>();
        try (var query = connection.prepareStatement(BASE_TABLES)) {
            query.setString(1, connection.getSchema());
            try (ResultSet result = query.executeQuery()) {
                while (result.next()) {
                    all.add(result.getString(1));
                }
            }
        }
        if (all.isEmpty()) {
            throw new IllegalStateException(
                    "No table found in schema " + connection.getSchema() + ": the database would never be emptied");
        }
        return all.stream()
                .filter(table -> !MIGRATION_TABLES.contains(table.toLowerCase()))
                .map(table -> "\"" + table + "\"")
                .toList();
    }

    private boolean isH2(Connection connection) throws SQLException {
        return "H2".equals(connection.getMetaData().getDatabaseProductName());
    }
}
