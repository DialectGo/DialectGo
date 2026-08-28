/**
 * PM2 Ecosystem Config — DialectGo Backend
 *
 * Run with: npx pm2 start ecosystem.config.cjs
 *
 * Cluster mode forks one worker per CPU core, which:
 *  - Prevents event-loop starvation from CPU-heavy operations (regex, JSON parsing)
 *  - Enables linear scaling with concurrent users (2-3 users → no degradation)
 *  - Provides zero-downtime restarts on crash
 */
module.exports = {
    apps: [
        {
            name: 'dialectgo-api',
            script: 'app/index.js',
            // 'max' spawns one process per CPU core
            // On a typical 4-core laptop: 4 workers = 4x event loop capacity
            instances: 'max',
            exec_mode: 'cluster',

            // Auto-restart on crash
            autorestart: true,
            watch: false,

            // Node.js ESM support
            node_args: '--experimental-vm-modules',

            env: {
                NODE_ENV: 'development',
                PORT: 5001,
            },
            env_production: {
                NODE_ENV: 'production',
                PORT: 5001,
            },

            // Restart if memory exceeds 500MB (prevents memory leaks from LRU cache overflow)
            max_memory_restart: '500M',

            // Graceful shutdown — give in-flight requests 10s to complete
            kill_timeout: 10000,
            listen_timeout: 5000,

            // Logging
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            merge_logs: true,
        },
    ],
};
