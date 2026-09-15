module.exports = {
  apps: [
    {
      name: "codemaker-web",
      script: "node_modules/.bin/next",
      args: "start",
      cwd: "/root/codemaker",
      env: {
        NODE_ENV: "production",
        PORT: "3014",
      },
    },
  ],
};
