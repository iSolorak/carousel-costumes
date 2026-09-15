module.exports = {
  apps: [
    {
      name: "sakis",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3026",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
