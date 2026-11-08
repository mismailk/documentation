---
title: Logging
order: 20
---

# Logging

Backray writes its summary and problems with `console`. To use your own logger, pass any object with `info`, `warn` and `error` functions:

```js
backray({ adapter, logger: { info: log.info, warn: log.warn, error: log.error } });
```
