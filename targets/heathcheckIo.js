const axios = require('axios');
const _ = require('lodash');
const config = require('/src/config');
const logger = require('lib-logger');

const createConnection = (connectionConfig) => {
    return axios.create({
        ...connectionConfig,
        headers: {
            "X-Api-Key": _.get(config, 'healthcheckio.apiKey')
        }
    });
}

const ping = async ({ interval, job, team }) => {
    //checkName should have team, job and interval
    const checkName = `last_run-${team ? team : config.ENV}-${job}-${interval}`;

    try {
        logger.info(`Pinging healthcheck ping api: ${checkName}`, {
            interval, job, team
        })

        //No interval or no job => cannot create/retrieve a check
        if (!interval || !job) {
            throw new Error(`interval OR job name missing ${checkName}`)
        }

        const connection = createConnection(_.get(config, 'healthcheckio.checksApiConfig', {}))
        const pingUrl = await getPingUrl(checkName, job, team);
        const pingResponse = await connection.post(pingUrl, `team: ${team}, job: ${job}, interval: ${interval}`);
        logger.info(`Ping Response: ${pingResponse.data} for check: ${checkName} - ${pingUrl}`);
    } catch (err) {
        delete pingUrlCache[checkName];
        logger.error(`Failed to ping healthcheck ping-api: ${checkName}`, {
            errorMessage: err.message,
            errorStack: err.stack
        })
    }
};

let pingUrlCache = {};
const getPingUrl = async (checkName, job = null, team = null) => {
    try {
        if (pingUrlCache[checkName]) {
            return pingUrlCache[checkName];
        }
        const connection = createConnection(_.get(config, 'healthcheckio.checksApiConfig', {}))
        let notificationChannels = _.get(config, `healthcheckio.alertConfig.notificationsChannel.${team ? team : 'default'}`);
        const checkConfig = {
            "name": checkName,
            "timeout": _.get(config, `healthcheckio.alertConfig.thresholds.${job}.timeOut`) || _.get(config, `healthcheckio.alertConfig.thresholds.default.timeOut`),
            "grace": _.get(config, `healthcheckio.alertConfig.thresholds.${job}.grace`) || _.get(config, `healthcheckio.alertConfig.thresholds.default.grace`),
            "unique": ["name"],
            "channels": notificationChannels
        }
        logger.info(`Debug - create check payload - ${checkName}`, {
            checkConfig
        })
        const response = await connection.post('api/v1/checks/', checkConfig);
        logger.info(`Debug - create check response - ${checkName}`, {
            response
        })
        const pingUrl = _.get(response, 'data.ping_url', '');
        if (!pingUrl) {
            logger.error(`Failed to create/retrieve the check: ${checkName}`)
            throw new Error(`Failed to create/retrieve healthcheck for ${checkName}`)
        }

        //Cache the result
        pingUrlCache[checkName] = pingUrl;
        return pingUrl;
    } catch (err) {
        logger.error(`Failed to create/get ping-api: ${checkName}-${job}`, {
            checkName, job, team: team ? team : '',
            errorMessage: err.message,
            errorStack: err.stack,
            error:err
        });

        throw err;
    }
}


module.exports = { ping }