# stackdriver-pushgateway

The Stackdriver Pushgateway exists to allow jobs to expose their metrics to Stackdriver.
It is compatible with the [prometheus gateway](https://github.com/prometheus/pushgateway#command-line):

```
echo "some_metric 3.14" | curl --data-binary @- http://stackgateway.domain.com/metrics/label1/value1/label2/value2
```

*only pushing metrics is really compatible to prometheus (not deleting etc)
