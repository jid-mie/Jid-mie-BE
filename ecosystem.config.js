module.exports = {
    apps : [{
        name   : "jidmie-api",
        script : "./server.js",
        instances : "max",
        exec_mode : "cluster",
        env_production: {
            NODE_ENV: "production"
        }
    }]
}