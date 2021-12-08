const newrelic = require("newrelic-plus");
const express = require("express");
require("express-async-errors");
const expressUtils = require("expressjs-utils");
const bodyParser = require('body-parser');
const monitoring = require('@google-cloud/monitoring');
const a2o = require('array-into-object');
const client = new monitoring.MetricServiceClient();
const app = express();
const healthcheckioClient = require('./targets/heathcheckIo');
const logger = require('lib-logger');


const config = {
  projectId: process.env.PROJECT_ID,
  httpPort: process.env.HTTP_PORT || 8080,
};

app.post('/metrics*', bodyParser.raw({ type: "*/*" }), async (req, res) => {
  let labels = a2o(req.params[0].split('/').filter(Boolean))
  let metrics = a2o(req.body.toString().split("\n").join(" ").split(" ").filter(Boolean))
  let writes = []

  if (metrics && metrics['last_run'] && labels && labels['interval'] == 'daily') {

    //Push to healthcheck.io
    healthcheckioClient.ping(labels);
  }

  for (let metric in metrics) {
    let dataPoint = {
      interval: {
        endTime: {
          seconds: Date.now() / 1000,
        },
      },
      value: {
        doubleValue: metrics[metric],
      },
    };

    let timeSeriesData = {
      metric: {
        type: `custom.googleapis.com/${metric}`,
        labels,
      },
      resource: {
        type: "global",
        labels: {
          project_id: config.projectId,
        },
      },
      points: [dataPoint],
    };

    let request = {
      name: client.projectPath(config.projectId),
      timeSeries: [timeSeriesData],
    };

    writes.push(client.createTimeSeries(request).then(_ => logger.info(`Pushed ${metric} ${metrics[metric]} ${JSON.stringify(labels)} -- you rockin' baby!`, { metric, labels })))
  }

  Promise.all(writes).catch(err => {
    logger.error(err.message, {
      errorMessage: err.message,
      errorStack: err.stack
    })
  })

  res.json({ labels, metrics })
})


expressUtils.hc(app);
expressUtils.errorHandler(app);

app.listen(config.httpPort, () => {
  console.log("StackDriver gateway since 2018...");
  console.log("healthcheck gateway since 2021...");
});
