package com.parth.portfolio.portfolio.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Enables Spring @Async processing and registers a dedicated bounded
 * thread pool for fire-and-forget mail delivery.
 *
 * Using a named executor ("mailTaskExecutor") keeps mail threads
 * isolated from any other async work the application may add later.
 *
 * CallerRunsPolicy is the rejection strategy: if the bounded queue
 * fills up (extremely unlikely for a single-admin portfolio), the
 * sending thread runs the task inline rather than silently discarding
 * the email.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "mailTaskExecutor")
    public Executor mailTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        /*
         * 2 core threads are more than sufficient for a single-admin
         * portfolio application; the pool keeps these alive indefinitely.
         */
        executor.setCorePoolSize(2);

        /*
         * Allow brief bursts (e.g. multiple reset requests in quick
         * succession during testing) without blocking the request thread.
         */
        executor.setMaxPoolSize(5);

        /*
         * Bounded queue: prevents unbounded memory growth if mail is slow.
         * 50 queued tasks is far beyond realistic usage for this app.
         */
        executor.setQueueCapacity(50);

        executor.setThreadNamePrefix("mail-");

        /*
         * If the queue is full, the calling thread sends the email inline.
         * This guarantees delivery over throughput, which is the correct
         * priority for a security-sensitive password-reset email.
         */
        executor.setRejectedExecutionHandler(
                new ThreadPoolExecutor.CallerRunsPolicy());

        executor.initialize();
        return executor;
    }
}