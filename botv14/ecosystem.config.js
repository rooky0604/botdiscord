export default {
  apps: [{
    name: 'discord-ticket-bot',
    script: 'src/index.js',
    watch: false,
    env: {
      NODE_ENV: 'production'
    },
    exec_mode: 'fork',
    instances: 1,
    autorestart: true
  }]
}