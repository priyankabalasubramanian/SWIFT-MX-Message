package com.swiftmx.app.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

/**
 * Automatically configures a persistent PostgreSQL DataSource when Render's
 * DATABASE_URL environment variable is present. Converts URL formats
 * (postgres:// or postgresql://) to standard JDBC format.
 */
@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    @Primary
    @ConditionalOnExpression("T(org.springframework.util.StringUtils).hasText('${DATABASE_URL:}')")
    public DataSource renderDatabaseUrlDataSource(
            @Value("${DATABASE_URL}") String databaseUrl) {
        log.info("Configuring persistent DataSource from Render DATABASE_URL environment variable");

        HikariDataSource dataSource = new HikariDataSource();

        try {
            String sanitizedUrl = databaseUrl.trim();
            if (sanitizedUrl.startsWith("jdbc:")) {
                dataSource.setJdbcUrl(sanitizedUrl);
                dataSource.setDriverClassName("org.postgresql.Driver");
            } else {
                // Parse postgres://user:password@host:port/dbname
                String rawWithoutPrefix;
                if (sanitizedUrl.startsWith("postgres://")) {
                    rawWithoutPrefix = sanitizedUrl.substring("postgres://".length());
                } else if (sanitizedUrl.startsWith("postgresql://")) {
                    rawWithoutPrefix = sanitizedUrl.substring("postgresql://".length());
                } else {
                    rawWithoutPrefix = sanitizedUrl;
                }

                URI uri = new URI("http://" + rawWithoutPrefix);

                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath(); // includes leading '/'
                String userInfo = uri.getUserInfo();

                String username = null;
                String password = null;
                if (userInfo != null) {
                    String[] userParts = userInfo.split(":", 2);
                    username = userParts[0];
                    if (userParts.length > 1) {
                        password = userParts[1];
                    }
                }

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                if (uri.getQuery() != null) {
                    jdbcUrl += "?" + uri.getQuery();
                } else {
                    jdbcUrl += "?sslmode=prefer";
                }

                dataSource.setJdbcUrl(jdbcUrl);
                if (username != null) {
                    dataSource.setUsername(username);
                }
                if (password != null) {
                    dataSource.setPassword(password);
                }
                dataSource.setDriverClassName("org.postgresql.Driver");
            }

            dataSource.setMaximumPoolSize(10);
            dataSource.setMinimumIdle(2);
            dataSource.setIdleTimeout(300000);
            dataSource.setConnectionTimeout(20000);
            return dataSource;
        } catch (Exception e) {
            log.error("Failed to parse DATABASE_URL: {}", databaseUrl, e);
            throw new IllegalStateException("Failed to configure database from DATABASE_URL: " + e.getMessage(), e);
        }
    }
}
