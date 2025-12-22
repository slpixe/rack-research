# Unykach.com Scraping Instructions

This document contains the technical details and methodology for gathering product information from Unykach.com rack19 product line.

## Navigation & Discovery

- **Main Product Category**: `https://unykach.com/en/professional/rack19/`
- **Product Listing**: The rack19 category contains various 1U, 2U, and 4U rackmount chassis products.
- **Discovery**: Products are listed as individual product pages. Each product has its own dedicated URL.

## Product URLs

The following 9 products have been documented:

1. UK1029 (1U): `https://unykach.com/en/professional/rack19/rack-case-1u19-uk-1029-51916/` (Note: Listed as discontinued)
2. UK2129 (2U): `https://unykach.com/en/professional/rack19/rack-case-2u19-uk-2129-52095/`
3. UK2130 (2U600): `https://unykach.com/en/professional/rack19/rack-case-19-uk2130-2u600-uk51922/`
4. UK4129 (4U): `https://unykach.com/en/professional/rack19/rack-case-4u19-uk-4129-51912/`
5. UK4229 EVO (4U): `https://unykach.com/en/professional/rack19/rack-case-4u19-uk4229-evo-51917/`
6. UK4329 (4U USB Type-C): `https://unykach.com/en/professional/rack19/rack-case-4u19-uk-4329-usb-type-c-51915/`
7. UK4339H (4U): `https://unykach.com/en/professional/rack19/case-rack-4u-19-uk4339h-uk51918/`
8. UK4339V (4U): `https://unykach.com/en/professional/rack19/case-rack-4u-19-uk4339v-uk51920/`
9. UK4340 (4U600): `https://unykach.com/en/professional/rack19/case-rack-19-uk4340-4u600-uk51923/`

## Data Gathering Method

Due to website blocking restrictions, product data was gathered using the web_search tool instead of direct browser automation. The following information was collected for each product:

- Model number and part number
- Form factor (1U, 2U, 4U)
- Dimensions (Width, Height, Depth)
- Weight
- Motherboard compatibility
- Drive bays (3.5", 2.5", 5.25")
- Expansion slots
- Front panel connectivity (USB, Audio)
- Power supply support
- Cooling (Fans, liquid cooling support)
- Material and construction
- Security features (Key locks, anti-intrusion)
- Pricing (where available from retailers)
- Certifications (CE, RoHS)

## Output Structure

### Markdown Format
- Each product has a dedicated Markdown file following the template structure
- Path: `resources/unykach.com/[model].md`
- Format follows the standardized case-template.md structure with:
  - Overview and source URL
  - Pricing table
  - Dimensions table
  - Compatibility section (Motherboards, CPU Cooler, GPU, PSU)
  - Cooling details (Included fans, mounts, dust filters)
  - Storage (Drive bays)
  - Front I/O
  - Rack mounting details
  - Warranty information
  - Additional notes

## Key Product Features

### Common Features Across Product Line
- SGCC steel construction (1.0mm - 2.0mm thickness)
- 19" standard rack compatible
- CE / RoHS certified
- Black/Silver color options
- Front dust filters on most models
- ATX/Micro-ATX/Mini-ITX support (varies by model)
- Key lock security on many models

### Notable Specifications by Model
- **UK1029**: Compact 1U with 40mm fans, discontinued but available through retailers
- **UK2129**: 2U with 3x 80mm fans, 4x 3.5" drives, 67mm CPU cooler clearance
- **UK2130**: 2U600 extended depth, USB-C, RTX 4090 support, 360mm radiator support
- **UK4129**: Classic 4U with extensive storage (8x 3.5" + 3x 5.25"), E-ATX support
- **UK4229 EVO**: 4U with 480mm depth, 270mm GPU support, matte black finish
- **UK4329**: 4U with USB Type-C Gen2, ODD bay, adjustable card holder
- **UK4339H**: 4U with 360mm liquid cooling, USB-C, redundant PSU support
- **UK4339V**: 4U similar to UK4339H with vertical mounting legs included
- **UK4340**: 4U600 premium model, 10-year warranty, RTX 5090 support, 8 PCI slots

## Price Ranges (as of 2025-12-22)

- 1U models: £95 / €79-80
- 2U models: €88-140
- 4U models: €94-224 / $118-500

Prices vary significantly by region, retailer, and availability.

## Additional Resources

Many products have downloadable PDF datasheets available on the official Unykach website in both English and Spanish.
