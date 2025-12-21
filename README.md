# Rack Research

A research project for documenting server rack cases, their specifications, and availability.

## Project Structure

```
rack-research/
├── README.md
├── initial-question.md
├── resources/                    # Saved web pages and extracted data
│   └── {domain}/                 # Organized by source domain
│       ├── {product-name}.html   # Raw HTML scrape
│       └── {product-name}.md     # Extracted specifications
└── templates/
    └── case-template.md          # Template for documenting cases
```

## Resources Folder

The `resources/` folder contains research materials organized by domain:

- **HTML files**: Direct downloads/scrapes of product pages for archival
- **Markdown files**: Extracted and structured specification data

### Example Structure

```
resources/
├── silverstonetek.com/
│   ├── rm43-320-rs.html
│   └── rm43-320-rs.md
├── inter-tech.de/
│   ├── 4u-4129-l.html
│   └── 4u-4129-l.md
└── supermicro.com/
    ├── cse-846.html
    └── cse-846.md
```

## Data Fields

Each case is documented with the following specifications (when available):

| Field | Description | Example |
|-------|-------------|---------|
| **Price** | Cost with currency | £150 GBP, $200 USD |
| **Shipping** | Shipping costs/options | £15 UK, Free EU |
| **Dimensions** | Width × Height × Depth | 450mm × 177mm × 500mm |
| **Rack Units** | Height in U | 4U |
| **Form Factors** | Supported motherboards | ATX, Micro-ATX, Mini-ITX |
| **CPU Cooler** | Max cooler height | 155mm |
| **PSU Support** | Power supply type | ATX, SFX, Redundant |
| **GPU Clearance** | Max length/height | 350mm length, 150mm height |
| **Fans** | Included/supported fans | 2× 120mm front, 1× 80mm rear |
| **Dust Filters** | Filter availability | Yes - front intake |
| **Storage** | Drive bays | 8× 3.5", 2× 2.5" |
| **Front I/O** | Front panel ports | 2× USB 3.0, 1× USB-C |
| **Rack Rails** | Included rails | Yes / Optional / No |
| **Warranty** | Warranty period | 2 years |

## Tools & Methods

This project uses browser-based tools to research and scrape product pages:

- **Playwright MCP**: For automated browsing and page scraping
- **Web fetch**: For downloading page content
- **Manual research**: Supplemented by direct browser research

## Usage

1. Find a server case to research
2. Use browser tools to navigate to the product page
3. Save the HTML to `resources/{domain}/{product-name}.html`
4. Extract specifications to `resources/{domain}/{product-name}.md` using the template
