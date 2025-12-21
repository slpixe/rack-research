This codebase is for performing research about different server-rack sizes, and available server cases available.

We will be using browser(s) to read/research from web-pages.
We should look at having a resources(or references) folder.
Maybe something like `./resources/{domain}/{product-name}[.html, .md(markdown)].

the html can be a direct download/scrape of the document/web-page.
The markdown can just be the important and relevant information picked out.
For example:
- price & currency (e.g. GBP, PLN, USD)
- shipping prices
- width/height/depth
- whether it supports m-atx, whether it supports ATX (so different form-factors it supports)
- units big (e.g. 3u, 4u).
- max-height of CPU cooler if available
- support for PSU (e.g. ATX)
- fans and position (front/back). e.g. 1x 80mm front, 2x 120mm back
- dust filter support?
- max height and length for GPU
- storage capacity (e.g. 3 3.5inch drives)
- IO (e.g. 1x usb-3, 2x usb-a 3.0)
- whether it comes with rack rails
- warranty ?

This project might either use the web-search MCP ability, or playwright-mcp, or maybe another mcp-service or web-scraper ability to fetch the pages and information.