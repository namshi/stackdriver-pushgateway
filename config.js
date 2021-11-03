const { env } = process;
module.exports = {
    healthcheckio: {
        checksApiConfig: {
            "baseURL": "https://healthchecks.io/",
            "timeout": 6000
        },
        pingKey: env.HEALTHCHECKIO_PING_KEY || "OPWp6oNbGzz4ecBrRMBSIw",
        apiKey: env.HEALTHCHECKIO_API_KEY || "wH6yqnGPVu7CCJg3TaxDXvfj1zEC-v4y",
        alertConfig: {
            cron_not_running_daily_my_test_job: {
                timeOut: 86400, // 24 hours
                grace: 10800 // 3 hours
            }
        }
    }
}