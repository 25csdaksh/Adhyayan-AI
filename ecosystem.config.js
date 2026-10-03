/**
 * StudyLM Production PM2 Ecosystem Configuration
 * Supports clustering, automatic restarts, memory caps, and zero-downtime reloads.
 */
module.exports = {
  apps: [
    {
      name: 'studylm-backend',
      script: './src/server.js',
      cwd: './backend',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 5000,
      listen_timeout: 10000,
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
    },
  ],
};
