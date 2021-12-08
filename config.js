const { env } = process;
module.exports = {
    ENV: env.NODE_ENV || 'dev',
    healthcheckio: {
        checksApiConfig: {
            "baseURL": "https://healthchecks.io/",
            "timeout": 6000
        },
        pingKey: env.HEALTHCHECKIO_PING_KEY || "***",
        apiKey: env.HEALTHCHECKIO_API_KEY || "***",
        alertConfig: {
            "notificationsChannel": {
                default: env.HEALTHCHECKIO_INTEGRATIONS_DEFAULT || "healthcheck-io-staging",
                datalabs: env.HEALTHCHECKIO_INTEGRATIONS_DATALABS || "healthcheck-io-staging",
            },
            thresholds: {
                default: {
                    timeOut: 86400, // 24 hours
                    grace: 10800 // 3 hours
                },
                test_job: {
                    timeOut: 60*5, // 5 minutes - minimum 60 (one minute), maximum: 2592000 (30 days).
                    grace: 60 // 1 minutes - Minimum: 60 (one minute), maximum: 2592000 (30 days)
                }
            }
        }
    }
}