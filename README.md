# Senate Finance Publisher

The [Senate Finance Committee](https://www.finance.senate.gov/chairmans-news) publishes a lot of content: press releases,
remarks, commentary, and letters! To stay abreast of their new content, I built
a lightweight web scraper to report back whether any new content has been added.
This scraper should be idempotent: it relies on a local cache of the last run's
content, so if the current content is the same, no output will be reported and
the cache will be unchanged.
