module.exports = {
    apps: [
      {
        name: 'cc-api',
        script: 'yarn',
        args: 'run start:prod',
        instances: 1,
        autorestart: true,
        watch: false,
        max_memory_restart: '256M',
        env: {
          NODE_ENV: 'production',
        },
      },
    ],
  };
