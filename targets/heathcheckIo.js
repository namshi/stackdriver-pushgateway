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
    const checkName = `last_run-${team ? team : 'live'}-${job}-${interval}`;

    try {
        logger.info(`Pinging healthcheck ping api: ${checkName}`, {
            interval, job, team
        })

        //No interval or no job => cannot create/retrieve a check
        if (!interval || !job) {
            throw new Error(`interval OR job name missing ${checkName}`)
        }

        const connection = createConnection(_.get(config, 'healthcheckio.checksApiConfig', {}))
        const pingUrl = await getPingUrl(checkName);

        const pingResponse = await connection.post(pingUrl, `team: ${team}, job: ${job}, interval: ${interval}`);
        logger.info(`Ping Response: ${pingResponse.data} for check: ${checkName}`);
    } catch (err) {
        logger.error(`Failed to ping healthcheck ping-api: ${checkName}`, {
            errorMessage: err.message,
            errorStack: err.stack
        })
    }
};

let pingUrlCache = {};
const getPingUrl = async (checkName) => {
    if(pingUrlCache[checkName]){
        return pingUrlCache[checkName];
    }
    const connection = createConnection(_.get(config, 'healthcheckio.checksApiConfig', {}))

    const checkConfig = {
        "name": checkName,
        "timeout": _.get(config, `healthcheckio.alertConfig.${checkName}.timeOut`) || 86400, // default 24 hours
        "grace": _.get(config, `healthcheckio.alertConfig.${checkName}.timeOut`) || 3600, // default 3 hours
        "unique": ["name"]
    }
    const response = await connection.post('api/v1/checks/', checkConfig);
    const pingUrl = _.get(response, 'data.ping_url', '');
    if (!pingUrl) {
        logger.error(`Failed to create/retrieve the check: ${checkName}`)
        throw new Error(`Failed to ping healthcheck for ${checkName}`)
    }

    //Cache the result
    pingUrlCache[checkName] = pingUrl;
    return pingUrl;
}


module.exports = { ping }