# 📖 Admin User Manual: Product Creation & Management Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Accessing Product Management](#accessing-product-management)
3. [Creating a New Product](#creating-a-new-product)
4. [Product Information Fields](#product-information-fields)
5. [Media Upload](#media-upload)
6. [Product Categories & Components](#product-categories--components)
7. [Specifications Management](#specifications-management)
8. [Variants & Pricing](#variants--pricing)
9. [Stock Management](#stock-management)
10. [Saving & Publishing Products](#saving--publishing-products)
11. [Editing Existing Products](#editing-existing-products)
12. [Best Practices](#best-practices)
13. [Troubleshooting](#troubleshooting)
14. [FAQs](#faqs)

---

## Introduction

Welcome to the Product Creation & Management guide for Egie-Ecommerce Admin Panel! This comprehensive manual will guide you through creating, managing, and publishing products in your e-commerce store.

### Who Can Create Products?

**Authorized Roles:**
- ✅ **Admin** - Full product management access
- ✅ **Manager** - Create and edit products
- ✅ **Employee** - Limited product updates
- ❌ **Customer** - No access

### What You'll Learn

- Creating new products from scratch
- Uploading product images
- Managing product variants (sizes, colors, etc.)
- Setting prices and stock levels
- Adding detailed specifications
- Categorizing products
- Publishing products to the store

---

## Accessing Product Management

### Step 1: Navigate to Products Section

**From Dashboard:**
1. Sign in to admin panel
2. Look for **"Products"** or **"Product Management"** in sidebar
3. Click to open Product Management page

**Product Management Overview:**
- **Inventory Tab** - View all products
- **Stocks Tab** - Monitor stock levels
- **Bundles Tab** - Create product bundles
- Search functionality
- Filter options
- Download reports

### Step 2: Access Product Creation

**Two Ways to Create:**

**Method A: From Product Management:**
1. Click **"Add Product"** button (green button, top-right)
2. Redirects to Product Creation page

**Method B: Direct Navigation:**
1. Use menu navigation
2. Select "Products" → "Create New Product"

---

## Creating a New Product

### Product Creation Interface Layout

When you open the product creation page, you'll see:

**Left Section:**
- **Media Upload Panel** (sticky sidebar)
  - Product image thumbnails
  - Upload button
  - Image management

**Main Center Section:**
- **Product Information** - Basic details
- **Components/Categories** - Product classification
- **Specifications** - Technical details
- **Variants** - Different versions/options
- **Pricing** - Cost information
- **Stock** - Inventory levels

**Top Section:**
- Back button (← return to products)
- Save button (💾 save product)
- Page title: "PRODUCT CREATION"

---

## Product Information Fields

### Basic Information Section

#### 1. **Product Name** (Required) ⚠️

**Field Details:**
- **What it is**: The display name customers see
- **Character limit**: No strict limit, but keep concise
- **Best practices**: 
  - Clear and descriptive
  - Include brand and model
  - Avoid ALL CAPS

**Examples:**
- ✅ Good: "ASUS ROG Strix GeForce RTX 4090 OC"
- ✅ Good: "Corsair Vengeance RGB Pro 32GB DDR4"
- ❌ Bad: "graphics card"
- ❌ Bad: "BEST GAMING MOUSE EVER!!!"

**How to Fill:**
1. Click in "Product Name" field
2. Type the product name
3. ⚠️ Red asterisk (*) indicates required field

#### 2. **Description**

**Field Details:**
- **What it is**: Detailed product description
- **Type**: Multi-line text area
- **Format**: Plain text or structured
- **Purpose**: Helps customers understand the product

**What to Include:**
- Product features and benefits
- Technical highlights
- Use cases
- What's included in the box
- Warranty information
- Compatibility notes

**Example Description:**
```
Experience ultimate gaming performance with the ASUS ROG Strix 
GeForce RTX 4090. This flagship GPU features:

• 24GB GDDR6X Memory
• Axial-tech Fan Design for 23% more airflow
• 2.75-slot Design for better cooling
• Aura Sync RGB Lighting
• 8K HDR Gaming Ready
• Ray Tracing Support

Perfect for 4K/8K gaming, content creation, and AI workloads.

Package Includes:
- Graphics Card
- Support Bracket
- User Manual
- 3-Year Warranty
```

**How to Fill:**
1. Click in "Description" field
2. Type or paste product description
3. Use line breaks for readability
4. Optional but highly recommended

#### 3. **Brand** (Recommended)

**Field Details:**
- **Type**: Dropdown selection
- **Purpose**: Helps customers filter by brand
- **Database-driven**: Brands are pre-configured

**How to Select:**
1. Click "Brand" dropdown
2. Scroll or type to search
3. Select appropriate brand
4. If brand doesn't exist: Click **"+ Create New Brand"**

**Creating New Brand:**
1. Select "+ Create New Brand" from dropdown
2. Dialog opens with fields:
   - **Brand Name** (required)
   - **Description** (optional)
   - **Website URL** (optional)
3. Click "Create Brand"
4. New brand automatically selected

**Example Brands:**
- ASUS
- Corsair
- NVIDIA
- AMD
- Intel
- Logitech
- Razer

#### 4. **Warranty**

**Field Details:**
- **Type**: Text field
- **Purpose**: Warranty period information
- **Format**: Flexible

**Common Formats:**
- "1 Year"
- "2 Years Manufacturer Warranty"
- "3 Years Limited Warranty"
- "Lifetime Warranty"
- "6 Months Store Warranty"

**How to Fill:**
1. Click "Warranty" field
2. Type warranty period
3. Be specific about warranty type

#### 5. **Compatibility Tags**

**Field Details:**
- **Type**: Multi-select autocomplete
- **Purpose**: Help customers find compatible products
- **Searchable**: Customers can filter by tags

**Suggested Tags:**
- **Motherboard**: Intel LGA1700, AMD AM5, ATX, Micro-ATX
- **RAM**: DDR5, DDR4, DDR3
- **Storage**: M.2 NVMe, SATA, PCIe 4.0
- **Power**: 24-pin ATX, 8-pin EPS, 6-pin PCIe
- **Cooling**: 120mm Fan, 140mm Fan, AIO Compatible
- **GPU**: Dual Slot, Triple Slot

**How to Add Tags:**
1. Click "Compatibility Tags" field
2. Start typing tag name
3. Select from suggestions or create new
4. Add multiple tags as needed
5. Tags appear as chips (removable)
6. Click X on chip to remove tag

**Example Usage:**
For an RTX 4090 Graphics Card:
- Tags: "PCIe 4.0", "8-pin PCIe", "Triple Slot", "ATX Compatible"

---

## Media Upload

### Uploading Product Images

**Image Upload Panel** (Left sidebar, sticky position)

#### Image Requirements

**Technical Specifications:**
- **Format**: JPG, PNG, WEBP
- **Size**: Maximum 5MB per image
- **Dimensions**: Minimum 800x800px recommended
- **Aspect Ratio**: Square (1:1) preferred
- **Quality**: High resolution for zoom functionality

**Image Guidelines:**
- ✅ Clear, well-lit photos
- ✅ White or neutral background
- ✅ Multiple angles
- ✅ Show all important features
- ✅ Close-ups of details
- ❌ Avoid blurry images
- ❌ No watermarks from other sites
- ❌ No misleading images

#### How to Upload Images

**Step 1: Select Images**
1. Click **"Upload Image"** box (dashed border)
2. File browser opens
3. Select one or multiple images
4. Or drag and drop images onto the box

**Step 2: Review Uploaded Images**
- Images appear as thumbnails in 3-column grid
- First image is the main product image
- Thumbnails show in order uploaded

**Step 3: Manage Images**

**Rearrange Order:**
- Drag and drop thumbnails to reorder
- First image is primary display image

**Remove Images:**
1. Hover over image thumbnail
2. Click **X icon** (top-right corner)
3. Image removed immediately
4. No confirmation required

**Upload Limits:**
- Minimum: 1 image required
- Maximum: No strict limit, but 5-10 recommended
- First image: Most important (main display)

#### Image Order Best Practices

**Recommended Image Sequence:**
1. **Main Product Photo** - Full product view
2. **Angle 2** - Different perspective
3. **Close-ups** - Important features
4. **Packaging** - What customer receives
5. **Lifestyle/In-use** - Product in action
6. **Specifications Label** - Model numbers
7. **Accessories** - Included items

---

## Product Categories & Components

### Understanding Categories

**What are Categories?**
- Categories classify your product type
- Examples: GPU, CPU, RAM, Motherboard, etc.
- Each category has specific specification fields
- Products can belong to multiple categories

### Selecting Components/Categories

**Component Slider Section:**

#### Step 1: View Available Categories
- Scroll through category slider
- Categories display as cards with icons
- Each card shows category name

#### Step 2: Select Categories

**To Add Category:**
1. Click on category card
2. Card highlights when selected
3. Can select multiple categories
4. Selected categories move to "Selected Components"

**Selected Categories Appear Below:**
- Shows all selected categories
- Each has "Remove" option
- Specification fields appear for each

#### Step 3: Add Custom Category (if needed)

**If category doesn't exist:**
1. Click **"Add New Component"** button
2. Dialog opens with fields:
   - **Component Name** (required)
   - **Description** (optional)
   - **Upload Icon** (optional)
3. Fill information
4. Click "Add Component"
5. New category available for selection

### Common Product Categories

**PC Hardware Categories:**
- **GPU (Graphics Card)** - Video cards
- **CPU (Processor)** - Processors
- **Motherboard** - System boards
- **RAM (Memory)** - Memory modules
- **Storage** - SSDs, HDDs
- **Power Supply** - PSUs
- **Case** - PC chassis
- **Cooling** - Fans, coolers, AIOs
- **Peripherals** - Keyboard, Mouse, Headset
- **Monitor** - Displays

---

## Specifications Management

### Understanding Specifications

**What are Specifications?**
- Technical details specific to each category
- Dynamic fields based on selected categories
- Different categories have different spec fields
- Required for complete product information

### Specification Fields by Category

#### GPU (Graphics Card) Specifications

**Common Fields:**
- **Chipset** - GPU model (e.g., RTX 4090, RX 7900 XTX)
- **Memory Size** - VRAM amount (e.g., 24GB, 16GB)
- **Memory Type** - Memory technology (GDDR6X, GDDR6)
- **Core Clock** - Base clock speed (MHz)
- **Boost Clock** - Maximum clock speed (MHz)
- **CUDA Cores** - Processing cores (NVIDIA)
- **Stream Processors** - Processing units (AMD)
- **Bus Interface** - Connection type (PCIe 4.0 x16)
- **Power Connectors** - Required cables (2x 8-pin)
- **TDP** - Power consumption (450W)
- **Recommended PSU** - Minimum power supply (850W)
- **Display Outputs** - Port types and count
- **Length** - Card dimensions (mm)
- **Cooling Type** - Cooling solution

#### CPU (Processor) Specifications

**Common Fields:**
- **Series** - Product line (Core i9, Ryzen 9)
- **Model** - Specific model number (13900K, 7950X)
- **Socket** - Motherboard compatibility (LGA1700, AM5)
- **Cores** - Physical core count (16, 24)
- **Threads** - Thread count (24, 32)
- **Base Clock** - Default frequency (GHz)
- **Boost Clock** - Maximum frequency (GHz)
- **Cache** - Cache memory (L2, L3)
- **TDP** - Thermal design power (125W)
- **Integrated Graphics** - Built-in GPU (Yes/No)
- **Memory Support** - Supported RAM types (DDR5, DDR4)
- **Max Memory** - Maximum RAM capacity
- **PCIe Version** - PCIe generation (4.0, 5.0)

#### Motherboard Specifications

**Common Fields:**
- **Chipset** - Board chipset (Z790, X670E)
- **Socket Type** - CPU compatibility (LGA1700, AM5)
- **Form Factor** - Board size (ATX, Micro-ATX, Mini-ITX)
- **Memory Type** - RAM support (DDR5, DDR4)
- **Memory Slots** - Number of DIMM slots (4, 2)
- **Max Memory** - Maximum RAM capacity (128GB)
- **PCIe Slots** - Expansion slots count
- **M.2 Slots** - NVMe storage slots (4x M.2)
- **SATA Ports** - SATA connectors (6x SATA)
- **USB Ports** - USB connectivity details
- **Network** - LAN/WiFi specifications
- **Audio** - Sound chipset
- **RGB Support** - Lighting features

#### RAM (Memory) Specifications

**Common Fields:**
- **Type** - Memory generation (DDR5, DDR4)
- **Capacity** - Total memory (32GB, 16GB)
- **Configuration** - Module setup (2x16GB, 4x8GB)
- **Speed** - Frequency (6000MHz, 3600MHz)
- **CAS Latency** - Timing (CL36, CL18)
- **Voltage** - Operating voltage (1.35V)
- **RGB Lighting** - Lighting feature (Yes/No)
- **Heat Spreader** - Cooling design
- **Profile Support** - XMP, EXPO profiles

### How to Fill Specifications

**Step-by-Step Process:**

#### Step 1: Specifications Appear Based on Categories
- After selecting categories, spec fields appear
- Each category shows its specific fields
- Fields organized by category section

#### Step 2: Fill Required Fields
- Look for **red asterisks (*)** - these are required
- Click in each field
- Enter accurate information

#### Step 3: Use Proper Formats

**Number Fields:**
- Enter numbers only (no units in number fields)
- Use decimal point if needed (3.5, 2.8)

**Text Fields:**
- Enter clear, concise values
- Use proper capitalization
- Be consistent with formatting

**Dropdown Fields:**
- Select from predefined options
- If value not available, select closest match
- Contact admin to add new options

#### Step 4: Verify Accuracy
- Double-check all values
- Reference product manual or manufacturer specs
- Accuracy is critical for customer trust

### Specification Entry Tips

**Best Practices:**
- ✅ Get specs from official sources
- ✅ Use manufacturer specifications
- ✅ Be precise with numbers
- ✅ Include units where appropriate
- ✅ Complete ALL required fields
- ❌ Don't guess specifications
- ❌ Don't leave required fields empty
- ❌ Don't use "Unknown" unless truly unknown

---

## Variants & Pricing

### Understanding Product Variants

**What are Variants?**
- Different versions of the same product
- Examples: sizes, colors, configurations
- Each variant has its own:
  - Name/label
  - Price
  - Stock quantity
- Optional: Products without variants use base pricing

### When to Use Variants

**Use Variants For:**
- ✅ Different colors (Black, White, RGB)
- ✅ Different sizes (M.2 2280, 2242)
- ✅ Different capacities (1TB, 2TB, 4TB)
- ✅ Different configurations (6-core, 8-core)
- ✅ Bundle options (With Mouse, Without Mouse)

**Don't Use Variants For:**
- ❌ Completely different products
- ❌ Different brands
- ❌ Different model numbers (create separate products)

### Creating Variants

#### Step 1: Access Variant Section
- Scroll to "Variation" section
- See "Add Variant" button

#### Step 2: Add First Variant

**Click "Add Variant" Button:**
- New variant form appears
- Shows "Variant 1 Name" field
- Price field (₱)
- Stock counter

#### Step 3: Fill Variant Details

**Variant Name:**
- Enter distinguishing feature
- Examples:
  - "Black Edition"
  - "2TB"
  - "RGB Version"
  - "Without Cooler"

**Variant Price:**
1. Click "Price" field
2. Enter numeric value
3. Currency symbol (₱) pre-filled
4. Example: 15999.99

**Variant Stock:**
1. Use **minus (-)** button to decrease
2. Use **plus (+)** button to increase
3. Or type directly in number field
4. Minimum: 0 (out of stock)
5. Unit displayed: "pcs."

#### Step 4: Add More Variants

**To Add Additional Variants:**
1. Click "Add Variant" button again
2. Repeat filling process
3. Can add unlimited variants
4. Each variant numbered sequentially

#### Step 5: Remove Variants

**To Delete Variant:**
1. Click **X icon** next to variant name
2. Variant removed immediately
3. No confirmation required
4. Be careful - can't undo easily

### Variant Management Example

**Example: Storage Product with Multiple Capacities**

```
Product: Samsung 980 PRO M.2 NVMe SSD

Variant 1:
- Name: "500GB"
- Price: ₱5,999
- Stock: 25 pcs

Variant 2:
- Name: "1TB"
- Price: ₱10,999
- Stock: 40 pcs

Variant 3:
- Name: "2TB"
- Price: ₱19,999
- Stock: 15 pcs
```

### Base Pricing (Without Variants)

**If No Variants:**
- Use "Official Price" field in main form
- Stock managed in main stock section
- Simpler for single-option products

**Official Price Field:**
- Located in pricing section
- Enter base product price
- Used if no variants defined

**Initial Price Field:**
- Original/compare-at price
- Shows as strikethrough if higher
- Creates "discount" display
- Optional field

---

## Stock Management

### Stock Tracking

**Two Methods:**

#### Method 1: Variant-Level Stock
- Used when product has variants
- Each variant tracks its own stock
- Stock field within each variant

#### Method 2: Product-Level Stock
- Used for products without variants
- Single stock count for entire product
- Stock counter in main form

### Stock Counter Interface

**Counter Controls:**
- **Minus Button (-)** - Decrease by 1
- **Number Field** - Type exact quantity
- **Plus Button (+)** - Increase by 1
- **Unit Display** - Shows "pcs."

**Stock Input:**
1. Click minus/plus buttons
2. Or click in number field and type
3. Enter whole numbers only
4. Minimum: 0 (can set to zero)
5. Maximum: No limit (practical limits apply)

### Stock Status

**What Customers See:**
- **In Stock** - Quantity > 10
- **Low Stock** - Quantity 1-10
- **Out of Stock** - Quantity = 0

**Stock Best Practices:**
- ✅ Keep stock counts accurate
- ✅ Update after receiving shipments
- ✅ Monitor low stock products
- ✅ Set reorder points
- ❌ Don't oversell (accurate counts critical)

### Initial Stock Entry

**When Creating Product:**
1. Estimate initial stock
2. Can adjust after creation
3. Stock deducts automatically with orders
4. Monitor stock in "Stocks" tab

---

## Saving & Publishing Products

### Save Options

**Two Main Actions:**

#### 1. Save as Draft (Development)
- Product saved but not published
- Not visible to customers
- Can continue editing
- Good for incomplete products

#### 2. Publish Product (Go Live)
- Product immediately visible in store
- Customers can purchase
- Appears in search and categories
- Can edit after publishing

### Validation Before Saving

**System Checks:**

**Required Fields:**
- ✅ Product Name
- ✅ At least 1 image
- ✅ At least 1 category selected
- ✅ All specification fields completed
- ✅ Price set (base or variants)
- ✅ Stock quantity set

**If Validation Fails:**
- Red error message appears at top
- Identifies missing required fields
- Example: "Please complete all specification fields for GPU"
- Scroll to fix missing information
- Try saving again

### Save Process

#### Step 1: Review Product
- Scroll through entire form
- Verify all information correct
- Check image order
- Confirm pricing and stock

#### Step 2: Click Save Button
- Green **"Save"** button (💾 icon)
- Located at top-right of page
- Button text: "SAVE" or "Save Product"

#### Step 3: Wait for Processing
- System validates all fields
- Uploads images to storage
- Creates database records
- Shows loading indicator
- Don't close browser or refresh

**Processing Time:**
- Typically 3-10 seconds
- Depends on image count and size
- Slower with many large images

#### Step 4: Success Confirmation
- Green success message appears
- Confirms product saved
- Shows product ID (if new)
- Can continue editing or return to list

**Success Message Examples:**
- "Product saved successfully! It will now appear in the e-commerce app."
- "Product updated successfully!"

### After Saving

**Product is Now:**
- ✅ Saved in database
- ✅ Visible in admin product list
- ✅ Available in store (if published)
- ✅ Searchable by customers
- ✅ Appears in category pages
- ✅ Ready for purchase

**Admin Activity Log:**
- Action logged automatically
- Records who created/edited product
- Tracks what changes were made
- Timestamp recorded
- Viewable in Admin Logs section

---

## Editing Existing Products

### Accessing Product Editor

**Two Methods:**

#### Method 1: From Product List
1. Navigate to Product Management
2. Find product in inventory list
3. Click on product row
4. Or click **Edit icon** (pencil)
5. Opens in edit mode

#### Method 2: From Product View
1. Open product details view
2. Click **"Edit Product"** button
3. Opens product editor

### Edit Mode Differences

**Pre-Filled Data:**
- All fields populate with existing data
- Images load from database
- Variants show current values
- Specifications display saved values

**Page Title Changes:**
- Shows "EDIT PRODUCT" or "PRODUCT EDIT"
- Indicates edit mode active

**Save Button Behavior:**
- Updates existing product
- Doesn't create duplicate
- Shows "Update" instead of "Create"

### Making Changes

**You Can Edit:**
- ✅ Product name and description
- ✅ Brand selection
- ✅ Images (add, remove, reorder)
- ✅ Categories/components
- ✅ Specifications
- ✅ Variants (add, modify, remove)
- ✅ Pricing
- ✅ Stock quantities
- ✅ Compatibility tags

**What's Tracked:**
- All changes logged
- Shows what fields changed
- Records old vs new values
- Visible in admin logs

### Update Process

#### Step 1: Make Desired Changes
- Edit any fields needed
- Add/remove images
- Update specifications
- Adjust pricing or stock

#### Step 2: Review Changes
- Verify all edits correct
- Check no unintended changes
- Ensure data accuracy

#### Step 3: Save Updates
1. Click **"Save"** button
2. System validates changes
3. Updates database
4. Shows success message

**Update Validation:**
- Same validation as new products
- Must complete required fields
- Checks data integrity
- Prevents invalid updates

#### Step 4: Verify Changes
- Product updates immediately
- Check storefront to confirm
- Verify changes display correctly
- Test product page functionality

### Change Tracking

**Detailed Logging:**
The system tracks changes including:
- **Name changes** - Old vs new name
- **Price updates** - Price differences
- **Stock changes** - Quantity adjustments
- **Variant modifications** - Added, removed, edited variants
- **Category changes** - Added/removed categories
- **Specification updates** - Changed spec fields
- **Image changes** - Added/removed images

**Example Log Entry:**
```
Action: Product Update
Product: ASUS ROG Strix RTX 4090
Changes: price (₱95,999 → ₱89,999), stock (10 → 25)
Modified by: Admin Name
Date: 2026-01-08 14:30
```

---

## Best Practices

### Product Creation Best Practices

#### 1. **Accurate Information**
- ✅ Use official specifications
- ✅ Verify all data before saving
- ✅ Cross-reference manufacturer sites
- ✅ Include warranty details
- ❌ Don't guess or estimate specs
- ❌ Don't copy inaccurate descriptions

#### 2. **High-Quality Images**
- ✅ Use professional product photos
- ✅ Minimum 800x800px resolution
- ✅ Well-lit, clear images
- ✅ Multiple angles (5-7 images ideal)
- ✅ Show important features
- ❌ Don't use blurry photos
- ❌ Don't use competitor watermarked images
- ❌ Don't use stock photos if you have actual product photos

#### 3. **Descriptive Naming**
- ✅ Include brand, model, and key features
- ✅ Use consistent naming format
- ✅ Make searchable and clear
- **Format**: [Brand] [Series] [Model] [Key Feature]
- **Example**: "Corsair Vengeance RGB Pro 32GB DDR4 3600MHz"
- ❌ Don't use vague names ("Gaming RAM")
- ❌ Don't use ALL CAPS unnecessarily

#### 4. **Complete Specifications**
- ✅ Fill ALL specification fields
- ✅ Be precise with technical details
- ✅ Use proper units (GB, MHz, W)
- ✅ Include compatibility information
- ❌ Don't leave required fields empty
- ❌ Don't use "N/A" unless truly not applicable

#### 5. **Competitive Pricing**
- ✅ Research market prices
- ✅ Set competitive yet profitable prices
- ✅ Use variants for different price points
- ✅ Update prices when costs change
- ❌ Don't price too high (hurts sales)
- ❌ Don't price too low (hurts margin)

#### 6. **Accurate Stock Levels**
- ✅ Count physical inventory
- ✅ Update stock after shipments
- ✅ Monitor stock regularly
- ✅ Set up low stock alerts
- ❌ Don't oversell (accurate counts critical)
- ❌ Don't forget to update after sales

#### 7. **SEO Optimization**
- ✅ Use keywords in product name
- ✅ Write detailed descriptions
- ✅ Include model numbers
- ✅ Add compatibility tags
- ✅ Use proper categorization
- ❌ Don't keyword stuff
- ❌ Don't use misleading titles

### Workflow Recommendations

#### New Product Checklist

**Before Creating:**
- [ ] Gather all product information
- [ ] Have manufacturer specifications
- [ ] Prepare product photos
- [ ] Determine pricing strategy
- [ ] Count available stock
- [ ] Know warranty terms

**During Creation:**
- [ ] Fill product name and description
- [ ] Select correct brand
- [ ] Upload all product images
- [ ] Select appropriate categories
- [ ] Complete all specifications
- [ ] Set pricing (base or variants)
- [ ] Enter accurate stock count
- [ ] Add compatibility tags
- [ ] Review all information

**After Creation:**
- [ ] Verify product appears in storefront
- [ ] Test product page functionality
- [ ] Check images display correctly
- [ ] Confirm price shows properly
- [ ] Test add to cart function
- [ ] Review mobile display
- [ ] Share with team for review

#### Bulk Product Entry

**For Multiple Products:**
1. **Prepare Data First**
   - Create spreadsheet with all info
   - Organize images by product
   - Standardize naming conventions
   - Verify specifications

2. **Create in Batches**
   - Group similar products
   - Use copy-paste for repeated info
   - Create one, then duplicate pattern
   - Take breaks to avoid errors

3. **Quality Check**
   - Review each product after creation
   - Spot-check several products
   - Verify consistency
   - Test random selections

---

## Troubleshooting

### Common Issues and Solutions

#### ❌ "Please complete all required fields"

**Problem:** Missing required information

**Solutions:**
1. Look for fields with red asterisks (*)
2. Check product name is filled
3. Ensure at least 1 image uploaded
4. Verify category selected
5. Complete all specification fields
6. Set price and stock
7. Scroll through entire form to find missing fields

#### ❌ "Please complete all specification fields for [Category]"

**Problem:** Specifications incomplete for selected category

**Solutions:**
1. Locate the category specification section
2. Find empty fields marked with *
3. Fill all required specification values
4. Reference product manual for accurate specs
5. If you don't have info, remove category or research specs

#### ❌ "Failed to upload image"

**Problem:** Image upload error

**Possible Causes:**
- File size too large (>5MB)
- Unsupported file format
- Network connection issue
- Browser compatibility

**Solutions:**
1. **Compress Images:**
   - Use image compression tool
   - Reduce file size below 5MB
   - Maintain quality

2. **Check Format:**
   - Use JPG, PNG, or WEBP only
   - Convert other formats

3. **Network:**
   - Check internet connection
   - Try again after few seconds
   - Use stable connection

4. **Browser:**
   - Clear browser cache
   - Try different browser
   - Update browser to latest version

#### ❌ "Brand not found" or "Cannot load brands"

**Problem:** Brand dropdown not working

**Solutions:**
1. Refresh the page
2. Wait for brands to load (may take few seconds)
3. Check internet connection
4. Create new brand if needed:
   - Select "+ Create New Brand"
   - Fill brand name
   - Save and retry

#### ❌ "Cannot save product" or "Save failed"

**Problem:** Product won't save

**Possible Causes:**
- Validation errors
- Network timeout
- Server error
- Session expired

**Solutions:**
1. **Check Validation:**
   - Read error message carefully
   - Fix all required fields
   - Retry saving

2. **Network Issues:**
   - Check connection
   - Wait and retry
   - Try from different network

3. **Session Expired:**
   - Refresh page
   - Sign in again
   - Data may be lost (use browser back button to retrieve)

4. **Contact Support:**
   - If persistent, contact admin
   - Provide error message
   - Describe what you were doing

#### ❌ "Image order wrong" or "Wrong main image"

**Problem:** Images displaying in wrong order

**Solutions:**
1. Images display in upload order
2. To rearrange:
   - Delete images
   - Re-upload in correct order
3. Or wait for drag-and-drop feature (if available)
4. Remember: First image is main product image

#### ❌ "Variants not saving" or "Stock not updating"

**Problem:** Variant data not persisting

**Solutions:**
1. Ensure all variant fields filled:
   - Variant name required
   - Price must be number
   - Stock must be number
2. Check for validation errors
3. Try removing and re-adding variant
4. Refresh page and retry

#### ❌ "Product not appearing in store"

**Problem:** Product saved but not visible to customers

**Possible Causes:**
- Product status is "draft"
- Product not published
- Cache not cleared
- Category not visible

**Solutions:**
1. Check product status in admin panel
2. Ensure "published" or "active" status
3. Verify category is active
4. Clear browser cache
5. Check storefront after few minutes
6. Try viewing in incognito/private window

---

## FAQs

### General Questions

**Q: How long does it take to create a product?**
- A: 5-15 minutes for standard products
- Complex products with many variants: 20-30 minutes
- Bulk entry: Plan 10-15 minutes per product
- Includes image upload and specification entry

**Q: Can I save product as draft and publish later?**
- A: Yes, save button creates product
- Product status controls visibility
- Can edit and publish when ready
- Draft products not visible to customers

**Q: How many images should I upload?**
- A: Minimum 1 image required
- Recommended: 5-7 images
- Include multiple angles and details
- More images = better conversion

**Q: What happens if I leave page without saving?**
- A: All entered data will be lost
- No auto-save functionality
- Always click Save before leaving
- Use browser back button to retrieve data if accidentally left

**Q: Can I duplicate an existing product?**
- A: Not directly through UI currently
- Manual method:
  - View existing product
  - Copy information
  - Create new product
  - Paste information
  - Update unique fields (name, SKU, images)

### Variants & Pricing

**Q: When should I use variants vs separate products?**
- A: Use variants for:
  - Same product, different options
  - Small variations (color, size)
  - Same core specifications
- A: Create separate products for:
  - Different models
  - Different brands
  - Significantly different specs

**Q: Can I change variant prices after creation?**
- A: Yes, edit product anytime
- Navigate to product
- Click Edit
- Update variant prices
- Save changes

**Q: Do variants share the same product page?**
- A: Yes, all variants on one product page
- Customers select variant from dropdown
- Price and stock update per variant
- All share same description and images

**Q: Can I have products without variants?**
- A: Yes, use base pricing model
- Single price, single stock count
- Simpler for products with no options

### Specifications

**Q: What if specification field doesn't apply to my product?**
- A: Leave optional fields empty
- Fill only relevant fields
- Required fields must be completed
- Contact admin to modify category specifications

**Q: Can I add custom specification fields?**
- A: Not directly in product creation
- Contact administrator
- Admin can add fields in Category Management
- New fields available after category update

**Q: Specifications are different for my product. What should I do?**
- A: Select most appropriate category
- Fill closest matching fields
- Add additional details in description
- Request custom category from administrator

### Images & Media

**Q: Can I use images from manufacturer website?**
- A: Check image copyright/usage rights
- Better to use own photos
- Official press kit images usually okay
- Give credit if required

**Q: What if I don't have product photos yet?**
- A: Use manufacturer stock photos temporarily
- Replace with actual photos when available
- Mark product as "pre-order" if not in stock
- Consider using placeholder indicating "actual product may vary"

**Q: Can I edit images after publishing?**
- A: Yes, edit product
- Add or remove images
- Reorder by deleting and re-uploading
- Changes reflect immediately

**Q: Do images affect page load speed?**
- A: Large images can slow loading
- System optimizes automatically
- Keep images under 5MB
- Use proper compression

### Stock & Inventory

**Q: Does stock decrease automatically with orders?**
- A: Yes, automatic stock deduction
- Happens when order is created
- Stock restored if order cancelled
- Monitor stock in Stocks tab

**Q: What happens when product goes out of stock?**
- A: Product shows "Out of Stock"
- Add to cart button disabled
- Product still visible
- Customers can wishlist
- Re-enable when stock added

**Q: Can I set low stock alerts?**
- A: Check admin panel settings
- May have notification preferences
- Can set custom thresholds
- Receive alerts via email/dashboard

**Q: How do I handle pre-orders?**
- A: Create product with 0 stock
- Add "Pre-Order" in product name
- Explain in description
- Set expected availability date
- Enable purchases despite 0 stock (check settings)

### Categories & Organization

**Q: Can a product belong to multiple categories?**
- A: Yes, select multiple components/categories
- Product appears in all selected categories
- Useful for versatile products
- Examples: RGB keyboard (Peripherals + Gaming)

**Q: How do I create a new category?**
- A: Use "Add New Component" in product creation
- Or navigate to Category Management
- Admin access usually required
- Define category specifications

**Q: Categories not showing correctly?**
- A: Refresh category data
- Check category is active
- Verify permissions
- Contact administrator

### Technical Issues

**Q: Page is loading slowly. What can I do?**
- A: Check internet speed
- Close unnecessary browser tabs
- Clear browser cache
- Try different browser
- Compress images before upload

**Q: Changes not saving?**
- A: Check for error messages
- Verify all required fields complete
- Try saving again
- Check internet connection
- Sign out and sign back in

**Q: Can I access this on mobile?**
- A: Admin panel optimized for desktop
- Mobile access possible but limited
- Recommend desktop/laptop for product creation
- Mobile good for quick edits/reviews

---

## Quick Reference

### Product Creation Checklist

#### ✅ Information Gathering
- [ ] Product name and model
- [ ] Brand information
- [ ] Product description
- [ ] Manufacturer specifications
- [ ] Warranty terms
- [ ] Pricing information
- [ ] Stock count

#### ✅ Media Preparation
- [ ] High-quality product photos
- [ ] Multiple angles (5-7 images)
- [ ] Images compressed (<5MB each)
- [ ] Proper format (JPG/PNG)
- [ ] Images organized and ready

#### ✅ Product Entry
- [ ] Navigate to Product Creation
- [ ] Fill product name (required)
- [ ] Add description
- [ ] Select brand
- [ ] Upload images (minimum 1)
- [ ] Select categories/components
- [ ] Complete all specifications
- [ ] Add variants (if applicable)
- [ ] Set pricing
- [ ] Enter stock quantities
- [ ] Add compatibility tags
- [ ] Review all information
- [ ] Click Save

#### ✅ Post-Creation
- [ ] Verify product saved successfully
- [ ] Check product in storefront
- [ ] Test product page functionality
- [ ] Verify images display correctly
- [ ] Confirm pricing shows properly
- [ ] Test add to cart
- [ ] Review on mobile device

### Required Fields Summary

**Minimum Required:**
- ✅ Product Name
- ✅ At least 1 Image
- ✅ At least 1 Category
- ✅ All category specifications
- ✅ Price (base or variant)
- ✅ Stock quantity

**Highly Recommended:**
- ✅ Brand
- ✅ Description
- ✅ Warranty
- ✅ Multiple images (5-7)
- ✅ Compatibility tags
- ✅ Detailed specifications

---

## Support & Resources

### Getting Help

**For Questions:**
- Check this manual first
- Contact system administrator
- Review video tutorials (if available)
- Join admin team chat/forum

**For Technical Issues:**
- Document error messages
- Screenshot the problem
- Note what you were doing
- Contact IT support

**For Training:**
- Request one-on-one training
- Shadow experienced admin
- Practice in test environment
- Review created products together

### Additional Resources

- Category Management Guide
- Brand Management Guide
- Stock Management Guide
- Image Optimization Guide
- SEO Best Practices
- Admin Logs Documentation

---

**Version:** 1.0  
**Last Updated:** January 8, 2026  
**System:** Egie-Ecommerce Admin Panel

**Happy Product Creating!** 🛒📦✨
