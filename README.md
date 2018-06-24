# stackdriver-pushgateway

The Stackdriver Pushgateway exists to allow jobs to expose their metrics to Stackdriver.
It is compatible with the [prometheus gateway](https://github.com/prometheus/pushgateway#command-line):

```
echo "some_metric 3.14" | curl --data-binary @- http://stackgateway.domain.com/metrics/label1/value1/label2/value2
```

> only pushing metrics is really compatible to prometheus (not deleting etc)

## Installation

We provide a bare Dockerfile to run the pushgateway, but it essentially simply does
and `npm install` and run the `index.js`, so feel free to run this however you prefer :)

The environment variables needed by the pushgateway are:

* `PROJECT_ID`: name of the GCP project you want to send metrics to
* `HTTP_PORT`: port the server is going to listen on (default is `8080`)
* `GOOGLE_APPLICATION_CREDENTIALS`: path to your Google application credentials (default `/credentials/credentials.json`)

...start the app and have fun monitoring on StackDriver!
