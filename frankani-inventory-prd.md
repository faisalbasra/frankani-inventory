# Car Parts Inventory Management System - Final PRD

## Executive Summary
Build a simple, visually accessible Norwegian inventory management web application for a 60+ year old car parts business owner. The system should replace his current Excel-based workflow with an intuitive Next.js interface optimized for his age group and limited computer experience, including automated Polcar compatibility integration.

## User Profile
- **Age**: 60+ years old
- **Business**: Car parts dealer (sole operator)
- **Technical Level**: Basic clicking and typing
- **Device**: Desktop computer
- **Language**: Norwegian
- **Current System**: Excel spreadsheet with 942 inventory items
- **Visual Needs**: Large text, high contrast, clean but not ugly design

## Core Requirements

### 1. Data Structure
Based on current Excel file "Frankani Lager.xlsx":
- **Model** (Car model like "Audi 80 B2")
- **Category** (Karosseri, Suspension, etc.)
- **Deler** (Part name in Norwegian)
- **lagerplass** (Storage location code)
- **antall** (Quantity in stock)
- **lagerkode** (Inventory code)
- **utpris m/mva** (Price with VAT)
- **evt bestilltid** (Delivery time)
- **leverandør** (Supplier)
- **delenummer - OEM** (OEM part number)
- **leverandør på lager** (Supplier in stock)
- **OEM#** (Alternative OEM number)
- **Link** (Web link)
- **Webshop - Done** (Web shop status)

### 2. Primary User Tasks (in priority order)
1. **Quick stock check** when customer calls asking for parts/prices
2. **Add new stock** when deliveries arrive
3. **Reduce stock** after selling parts
4. **Find parts** by various search criteria
5. **Check low stock** items needing reorder
6. **Check car compatibility** for customer inquiries

### 3. Search & Browse Functionality
**Search Priority (most to least used):**
1. OEM Part Number (exact match)
2. Compatible car model (e.g., "Audi 80 B2")
3. Supplier name
4. Car model + category combination
5. Part name (Norwegian)
6. Storage location

**Search Features:**
- Single prominent search box on main screen
- Auto-suggestions as user types
- Search across multiple fields simultaneously including compatibility
- **"Find parts for my car"** - dedicated car-based search
- Clear "no results" messaging with suggestion to check compatibility

### 4. Main Dashboard Layout
**Top Section:**
- Large, prominent search bar
- Current date/time display

**Quick Access Cards (5 main sections):**
1. **Søk Deler** (Search Parts) - Main search interface
2. **Lav Beholdning** (Low Stock) - Items below threshold of 2
3. **Bilmodeller** (Car Models) - Browse by vehicle
4. **Kompatibilitet** (Compatibility) - Parts needing compatibility check
5. **Siste Aktivitet** (Recent Activity) - Last 10 updated items

### 5. Visual Design Requirements
- **Typography**: Minimum 16px body text, 24px+ for headings
- **Contrast**: Dark text on light backgrounds, clear visual hierarchy
- **Colors**: Professional but modern palette (blues, grays, whites)
- **Spacing**: Generous padding and margins for easy clicking
- **Buttons**: Large clickable areas (minimum 44px height)
- **Modern Aesthetic**: Clean, professional, not outdated looking

### 6. Part Detail View
When viewing/editing a part:

**Display Layout:**
- Part name and OEM number prominently at top
- Current quantity with large, clear numbers
- Price clearly visible
- **Compatible vehicles list** with visual indicators
- Storage location and supplier info
- Low stock indicator if applicable

**Quick Actions (Large Buttons):**
- **+1** (add one item)
- **-1** (remove one item)
- **Sjekk Polcar** (Check Polcar compatibility)
- **Endre** (Edit details)
- **Tilbake** (Back to search)

**Compatibility Section:**
- List of compatible car models with years
- Icons showing source: ✅ (auto), ✏️ (manual), ⏳ (checking)
- "Legg til bil" (Add car) button for manual entries
- Confidence indicators for automated matches

**Edit Mode:**
- Simple form with current values pre-filled
- Large input fields
- **Lagre** (Save) and **Avbryt** (Cancel) buttons

### 7. Low Stock Management
- **Threshold**: Items with quantity ≤ 2 are flagged
- **Visual Indicators**: Red highlighting or warning icons
- **Low Stock Page**: Dedicated view showing all items needing reorder
- **Sorting**: By urgency (lowest quantities first)

### 8. Technical Specifications

**Frontend Framework:**
- Next.js 15 (App Router) with TypeScript
- Tailwind CSS for styling
- Responsive design (desktop-first)

**Database & Backend:**
- Turso (libSQL) with Drizzle ORM ^0.31.x
- Next.js API routes for server-side operations
- Development: Local SQLite with Drizzle

**Deployment:**
- Vercel hosting with Turso database
- Progressive Web App (PWA) capabilities
- Environment variables for database connection

### 9. Data Import Requirements
- Import all 942 existing inventory items from Excel
- Preserve all current data fields
- Handle Norwegian text encoding properly
- Validate data during import (clean up inconsistencies)

### 10. User Interface Flow

**Main Dashboard → Search → Results → Part Detail → Update → Confirmation**

**Detailed User Flows:**

**Flow 1: Quick Stock Check (Customer Inquiry)**
1. User opens app → sees search box prominently
2. Types OEM number or part name
3. Gets instant results with price and quantity
4. Can immediately see availability and quote price

**Flow 2: Update Stock After Sale**
1. Search for sold part
2. Open part detail
3. Click "-1" button (or custom amount)
4. Confirm update
5. See updated quantity immediately

**Flow 3: Add New Stock Delivery**
1. Search for delivered part
2. Open part detail  
3. Click "+1" button (or custom amount)
4. Confirm update
5. Return to dashboard or search next item

**Flow 4: Check Low Stock Items**
1. Click "Lav Beholdning" card on dashboard
2. See all items ≤ 2 quantity
3. Review which items need reordering
4. Optionally update quantities directly from this view

**Flow 5: Check/Add Car Compatibility**
1. Open part detail view
2. See current compatible cars (if any)
3. Click "Sjekk Polcar" button
4. System searches Polcar automatically
5. Results appear with confidence indicators
6. Can manually add/edit compatibility entries
7. Save changes with source tracking

**Flow 6: Find Parts for Specific Car**
1. Use "Find parts for my car" search
2. Enter car make/model/year
3. See all compatible parts from inventory
4. Filter by category if needed
5. Quick access to stock levels and prices

### 11. Norwegian Interface Text

**Main Navigation:**
- Søk Deler (Search Parts)
- Lav Beholdning (Low Stock) 
- Bilmodeller (Car Models)
- Kompatibilitet (Compatibility)
- Siste Aktivitet (Recent Activity)

**Actions:**
- Legg til (Add)
- Fjern (Remove)
- Endre (Edit)
- Lagre (Save)
- Avbryt (Cancel)
- Tilbake (Back)

**Labels:**
- Antall (Quantity)
- Pris (Price)
- Leverandør (Supplier)
- Lagerplass (Storage Location)
- OEM Nummer (OEM Number)
- Kategori (Category)
- Kompatible Biler (Compatible Cars)
- Sjekk Polcar (Check Polcar)
- Legg til bil (Add car)
- Automatisk funnet (Auto found)
- Manuelt lagt til (Manually added)
- Finn deler til min bil (Find parts for my car)

### 12. Error Handling & User Feedback
- Clear error messages in Norwegian
- Confirmation dialogs for important actions
- Loading states for search operations
- Success messages after updates
- "Undo" functionality for accidental changes

### 13. Performance Requirements
- Search results appear within 500ms
- Page loads within 2 seconds
- Smooth interactions on older computers
- Minimal data usage

### 14. Car Compatibility Integration (Polcar Automation)

**Complete Database Schema:**

```sql
-- Main inventory table (from Excel data)
inventory_items (
  id PRIMARY KEY AUTO_INCREMENT,
  model VARCHAR(100),                    -- Car model like "Audi 80 B2"
  category VARCHAR(100),                 -- Karosseri, Suspension, etc.
  deler VARCHAR(200),                    -- Part name in Norwegian
  lagerplass VARCHAR(50),                -- Storage location code
  antall INTEGER,                        -- Quantity in stock
  lagerkode VARCHAR(100),                -- Inventory code
  utpris_m_mva VARCHAR(50),             -- Price with VAT
  evt_bestilltid VARCHAR(100),          -- Delivery time
  leverandor VARCHAR(100),               -- Supplier
  delenummer_oem VARCHAR(100),          -- OEM part number
  leverandor_pa_lager VARCHAR(200),     -- Supplier in stock
  oem_alt VARCHAR(100),                 -- Alternative OEM number
  link TEXT,                            -- Web link
  webshop_done VARCHAR(50),             -- Web shop status
  
  -- New compatibility tracking fields
  last_compatibility_check TIMESTAMP,
  compatibility_status ENUM('not_checked', 'checking', 'found', 'not_found', 'error') DEFAULT 'not_checked',
  manual_compatibility_override BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_oem (delenummer_oem),
  INDEX idx_model (model),
  INDEX idx_category (category),
  INDEX idx_supplier (leverandor),
  INDEX idx_quantity (antall),
  INDEX idx_compatibility_status (compatibility_status)
);

-- Lookup tables for standardization
part_categories (
  id PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,     -- Karosseri, Understell, Motor, etc.
  name_norwegian VARCHAR(100),           -- Norwegian display name
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

suppliers (
  id PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) UNIQUE NOT NULL,     -- blic/Rhibo, AP/Polcar, etc.
  contact_email VARCHAR(200),
  contact_phone VARCHAR(50),
  website_url TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Car make/model hierarchy
car_makes (
  id PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) UNIQUE NOT NULL,      -- Audi, BMW, Mercedes, etc.
  logo_url TEXT,
  country VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

car_models (
  id PRIMARY KEY AUTO_INCREMENT,
  make_id INTEGER,
  name VARCHAR(100) NOT NULL,            -- 80, A4, 3 Series, etc.
  series VARCHAR(50),                    -- B2, B3, E30, etc.
  full_name VARCHAR(150),                -- "80 B2", "A4 B8", "3 Series E30"
  year_from INTEGER,                     -- 1985
  year_to INTEGER,                       -- 1991
  body_types JSON,                       -- ["Sedan", "Wagon", "Coupe"]
  engine_types JSON,                     -- ["1.8L", "2.0L", "2.2L"]
  fuel_types JSON,                       -- ["Petrol", "Diesel"]
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (make_id) REFERENCES car_makes(id),
  INDEX idx_make_model (make_id, name),
  INDEX idx_year_range (year_from, year_to)
);

-- Compatible vehicles for each part (detailed compatibility)
compatible_vehicles (
  id PRIMARY KEY AUTO_INCREMENT,
  inventory_item_id INTEGER,
  make_id INTEGER,                       -- Reference to car_makes
  model_id INTEGER,                      -- Reference to car_models
  year_from INTEGER,                     -- Specific year range for this part
  year_to INTEGER,
  engine_code VARCHAR(50),               -- Specific engine if applicable
  body_type VARCHAR(50),                 -- Specific body type if applicable
  fuel_type VARCHAR(30),                 -- Specific fuel type if applicable
  trim_level VARCHAR(50),                -- Sport, Base, Premium, etc.
  source ENUM('polcar_auto', 'manual_entry', 'oem_lookup') DEFAULT 'manual_entry',
  confidence_score INTEGER CHECK (confidence_score >= 1 AND confidence_score <= 10),
  notes TEXT,                            -- Manual notes about compatibility
  verified BOOLEAN DEFAULT FALSE,        -- Has this been verified by user?
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
  FOREIGN KEY (make_id) REFERENCES car_makes(id),
  FOREIGN KEY (model_id) REFERENCES car_models(id),
  INDEX idx_car_compatibility (make_id, model_id),
  INDEX idx_year_range (year_from, year_to),
  INDEX idx_source (source),
  INDEX idx_verified (verified)
);

-- Polcar scraping history for debugging and audit
polcar_lookup_history (
  id PRIMARY KEY AUTO_INCREMENT,
  inventory_item_id INTEGER,
  oem_number VARCHAR(100),               -- What we searched for
  search_url TEXT,                       -- Full Polcar URL used
  polcar_response_html TEXT,             -- Raw HTML response
  extracted_vehicles JSON,               -- Structured data extracted
  lookup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processing_time_ms INTEGER,            -- How long the lookup took
  success BOOLEAN DEFAULT FALSE,
  error_message TEXT,                    -- Error details if failed
  user_agent VARCHAR(200),               -- Browser user agent used
  
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE SET NULL,
  INDEX idx_oem_lookup (oem_number),
  INDEX idx_lookup_date (lookup_date),
  INDEX idx_success (success)
);

-- User activity log for tracking changes
activity_log (
  id PRIMARY KEY AUTO_INCREMENT,
  inventory_item_id INTEGER,
  action_type ENUM('quantity_change', 'price_update', 'compatibility_add', 'compatibility_edit', 'manual_entry', 'polcar_lookup', 'category_change', 'supplier_change'),
  old_value TEXT,                        -- Previous value (JSON)
  new_value TEXT,                        -- New value (JSON)
  change_amount INTEGER,                 -- For quantity changes (+1, -1, etc.)
  user_note TEXT,                        -- Optional user note
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE,
  INDEX idx_timestamp (timestamp),
  INDEX idx_action_type (action_type)
);

-- System settings and configuration
system_settings (
  id PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE,
  setting_value TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Default data insertion
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('low_stock_threshold', '2', 'Quantity threshold for low stock alerts'),
('polcar_delay_seconds', '3', 'Delay between Polcar requests to respect their servers'),
('auto_compatibility_check', 'true', 'Enable automatic compatibility checking'),
('max_polcar_retries', '3', 'Maximum retry attempts for failed Polcar lookups');

-- Seed common Norwegian car part categories
INSERT INTO part_categories (name, name_norwegian, sort_order) VALUES
('Karosseri', 'Karosseri', 1),
('Understell', 'Understell', 2),
('Suspension', 'Fjæring', 3),
('Motor', 'Motor', 4),
('Bremser', 'Bremser', 5),
('Elektro', 'Elektro', 6),
('Interiør', 'Interiør', 7),
('Eksospotter', 'Eksospotter', 8);

-- Seed common car makes found in Norwegian market
INSERT INTO car_makes (name, country) VALUES
('Audi', 'Germany'),
('BMW', 'Germany'),
('Mercedes-Benz', 'Germany'),
('Volkswagen', 'Germany'),
('Volvo', 'Sweden'),
('Peugeot', 'France'),
('Renault', 'France'),
('Ford', 'USA'),
('Toyota', 'Japan'),
('Nissan', 'Japan');
```

**Polcar Integration Features:**

1. **Automated Compatibility Lookup**
   - Background job that processes parts without compatibility data
   - Searches catalog.polcar.com using OEM numbers
   - Respects 2-3 second delays between requests
   - Parses HTML to extract compatible vehicle information

2. **Manual Compatibility Management**
   - "Check Polcar" button for immediate lookup
   - Manual override for incorrect automated results
   - Add custom compatibility entries
   - Confidence scoring system (1-10)

3. **User Interface Enhancements**
   - "Compatible Cars" section in part detail view
   - Visual indicators: ✅ automated, ✏️ manual, ⏳ checking
   - Filter parts by car compatibility
   - "Find parts for my car" search feature

4. **Background Processing**
   - Simple rate limiting for processing compatibility checks
   - Retry logic for failed lookups
   - Rate limiting to respect Polcar's servers
   - Logging for troubleshooting

**Technical Implementation:**
- Next.js API routes for web scraping
- Simple rate limiting (track last request time)
- Error handling and retry logic
- Respect robots.txt guidelines

### 15. Lookup Values & Data Management Strategy

**1. Part Categories Management:**
- **Pre-populated categories** from existing Excel data analysis
- **Admin interface** for adding/editing categories with Norwegian names
- **Auto-suggestion** when adding new parts (learns from existing data)
- **Dropdown selection** with search functionality in forms
- **Migration strategy**: Extract unique categories from Excel during import

**2. Supplier Management:**
- **Supplier master table** with contact information
- **Auto-creation** of suppliers during Excel import if not exists
- **Standardization suggestions** (e.g., "blic/Rhibo" vs "Blic" vs "Rhibo")
- **Supplier search** with auto-complete in part forms
- **Supplier performance tracking** (delivery times, reliability)

**3. Car Make/Model Hierarchy:**
- **Hierarchical structure**: Make → Model → Series/Generation
- **Year ranges** per model generation
- **Engine/trim variants** stored as JSON arrays for flexibility
- **Auto-complete search** for adding compatibility
- **Popular Norwegian market makes** pre-populated
- **Polcar integration** automatically populates missing makes/models

**4. Data Population Strategy:**

**Phase 1 - Excel Import:**
```javascript
// During Excel import, automatically create:
- Extract unique categories → populate part_categories
- Extract unique suppliers → populate suppliers  
- Extract car models → create car_makes + car_models
- Standardize "Audi 80 B2" → Make: "Audi", Model: "80", Series: "B2"
```

**Phase 2 - Polcar Integration:**
```javascript
// When Polcar returns compatibility data:
- Auto-create missing car makes/models
- Populate engine types, body types, year ranges
- Build comprehensive car database over time
```

**Phase 3 - User Enhancement:**
```javascript
// User can:
- Edit/merge duplicate suppliers
- Add missing car models manually
- Create custom part categories
- Verify/correct Polcar auto-data
```

**5. User Interface for Lookup Management:**

**Settings Page with sections:**
- **Kategorier** (Categories) - Add/edit/reorder part categories
- **Leverandører** (Suppliers) - Manage supplier contacts and info
- **Bilmerker** (Car Makes) - Add car makes and models
- **Datavalidering** (Data Validation) - Fix duplicates and inconsistencies

**Smart Auto-Complete Features:**
- Type "Audi" → suggests "Audi 80 B2", "Audi A4", etc.
- Type "Kaross" → suggests "Karosseri" category
- Type "blic" → suggests "blic/Rhibo" supplier

**6. Data Quality Management:**
- **Duplicate detection** for suppliers (fuzzy matching)
- **Standardization suggestions** for car models
- **Data validation rules** (year ranges, required fields)
- **Bulk edit functionality** for fixing data inconsistencies

### 16. Future Considerations (Phase 3)
- Backup/export functionality
- Basic reporting (monthly sales, etc.)
- Order management integration
- TecDoc API integration for verification
- Mobile app version

## Success Metrics
- User can find any part within 10 seconds
- Stock updates completed in under 5 clicks
- Zero training needed beyond 10-minute walkthrough
- Reduced manual Excel maintenance time by 80%
- User confidence and satisfaction with digital system

---

## Development Prompt for Claude Code

```
Create a Norwegian car parts inventory management system optimized for a 60+ year old user with automated Polcar compatibility integration.

CORE REQUIREMENTS:
- Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Turso (libSQL) + Drizzle ORM ^0.31.x
- Large text (16px+ body, 24px+ headings), high contrast design
- Modern, clean aesthetic (not ugly/outdated)
- Norwegian language interface
- Import data from uploaded Excel file (942 items)
- Desktop-first responsive design
- Polcar web scraping for car compatibility automation

VERIFIED COMPATIBLE DEPENDENCIES:
```json
{
  "next": "15.x",
  "react": "^18.3.x",
  "typescript": "^5.x",
  "drizzle-orm": "^0.31.x",
  "drizzle-kit": "^0.22.x",
  "@libsql/client": "^0.6.x",
  "tailwindcss": "^3.x",
  "@types/node": "^20.x"
}
```

COMPLETE DATABASE SCHEMA:
```sql
-- Main inventory (from Excel + compatibility tracking)
inventory_items (
  id, model, category, deler, lagerplass, antall, lagerkode, 
  utpris_m_mva, evt_bestilltid, leverandor, delenummer_oem, 
  leverandor_pa_lager, oem_alt, link, webshop_done,
  last_compatibility_check, compatibility_status, manual_compatibility_override,
  created_at, updated_at
);

-- Lookup tables for data standardization
part_categories (
  id, name, name_norwegian, description, sort_order, is_active, created_at
);

suppliers (
  id, name, contact_email, contact_phone, website_url, notes, is_active, created_at
);

-- Car hierarchy for compatibility
car_makes (
  id, name, logo_url, country, is_active, created_at
);

car_models (
  id, make_id, name, series, full_name, year_from, year_to,
  body_types, engine_types, fuel_types, is_active, created_at
);

-- Car compatibility data
compatible_vehicles (
  id, inventory_item_id, make_id, model_id, year_from, year_to,
  engine_code, body_type, fuel_type, trim_level, source, confidence_score, notes, verified,
  created_at, updated_at
);

-- Polcar scraping audit trail
polcar_lookup_history (
  id, inventory_item_id, oem_number, search_url, polcar_response_html,
  extracted_vehicles, lookup_date, processing_time_ms, success, error_message
);

-- User activity tracking
activity_log (
  id, inventory_item_id, action_type, old_value, new_value, 
  change_amount, user_note, timestamp
);

-- System configuration
system_settings (
  setting_key, setting_value, description
);
```

DASHBOARD LAYOUT (5 main cards):
1. **Søk Deler** (Search Parts) - Main search with OEM/car model/supplier support
2. **Lav Beholdning** (Low Stock) - Items ≤ 2 quantity with red highlighting
3. **Bilmodeller** (Car Models) - Browse by vehicle compatibility
4. **Kompatibilitet** (Compatibility) - Parts needing compatibility checks
5. **Siste Aktivitet** (Recent Activity) - Last 10 updated items

KEY FEATURES TO IMPLEMENT:

1. **Excel Data Import with Smart Processing**
   - Parse uploaded Excel file (942 rows)
   - **Intelligent data extraction**:
     * Extract unique categories → auto-populate part_categories table
     * Extract unique suppliers → auto-populate suppliers table
     * Parse "Audi 80 B2" → create car_makes ("Audi") + car_models ("80 B2")
     * Detect and standardize variations ("blic/Rhibo" vs "Blic")
   - Handle Norwegian text encoding
   - Validation and error reporting with suggested fixes
   - **Data quality dashboard** showing duplicates and inconsistencies

2. **Advanced Search System**
   - Primary: OEM part numbers (exact match)
   - Secondary: Car model compatibility search with **smart auto-complete**
   - Tertiary: Supplier (with fuzzy matching), category, part name, storage location
   - **Dropdown suggestions** from lookup tables (categories, suppliers, car models)
   - Auto-suggestions and multi-field search
   - "Find parts for my car" dedicated search with **hierarchical car selection**

3. **Part Detail View with Compatibility**
   - Large +1/-1 quantity buttons (44px+ height)
   - Compatible vehicles list with visual indicators:
     ✅ (polcar_auto), ✏️ (manual_entry), ⏳ (checking)
   - "Sjekk Polcar" button for instant compatibility lookup
   - Manual compatibility entry form with **dropdown car selection**
   - Edit mode with large inputs and **auto-complete for categories/suppliers**

4. **Polcar Integration (Critical Feature)**
   - Simple rate-limited fetch requests (2-3 second delays between requests)
   - Search catalog.polcar.com using: `https://catalog.polcar.com/search?q=${oem_number}`
   - Parse HTML response to extract compatible vehicle data
   - Store results with confidence scoring (1-10)
   - Direct API calls without queue system for simplicity
   - Error handling and retry logic (max 3 attempts)
   - Respect robots.txt and implement proper rate limiting

5. **Lookup Value Management**
   - **Settings page** for managing categories, suppliers, car makes/models
   - **Auto-complete components** for data entry forms
   - **Duplicate detection** and merge functionality
   - **Data standardization** suggestions during import
   - **Smart suggestions** based on existing data patterns

6. **Norwegian Interface Labels**
   ```
   Søk Deler = Search Parts
   Lav Beholdning = Low Stock  
   Kompatible Biler = Compatible Cars
   Sjekk Polcar = Check Polcar
   Legg til bil = Add car
   Automatisk funnet = Auto found
   Manuelt lagt til = Manually added
   Finn deler til min bil = Find parts for my car
   Antall = Quantity
   Lagre = Save
   Avbryt = Cancel
   Kategorier = Categories
   Leverandører = Suppliers
   Bilmerker = Car Makes
   ```

USER WORKFLOWS TO SUPPORT:
- **Customer call workflow**: Search by OEM → see price, stock, compatible cars instantly
- **Stock management**: Quick +1/-1 buttons, bulk updates, low stock monitoring
- **Compatibility building**: Automated Polcar lookups + manual overrides with smart car selection
- **Car-based search**: "Do you have parts for 2010 Audi A4?" → instant results
- **Data quality**: Import Excel → auto-standardize → review suggestions → approve changes

POLCAR SCRAPING IMPLEMENTATION:
- Use fetch API with CORS proxy if needed for client-side requests
- Or implement server-side API route for Polcar requests
- Implement simple rate limiting (track last request time)
- Parse Polcar search results HTML to extract:
  * Compatible car makes/models
  * Year ranges
  * Engine types
  * Body styles
- Store with source tracking and confidence scores
- Handle failures gracefully with retry logic
- Log all attempts for debugging

DESIGN REQUIREMENTS:
- Large clickable areas (minimum 44px buttons)
- High contrast colors (dark text on light backgrounds)
- Professional blue/gray color scheme
- Clear visual hierarchy with generous spacing
- Loading states and confirmation messages
- Error handling with user-friendly Norwegian messages
- Responsive but desktop-optimized

TECHNICAL ARCHITECTURE:
- Frontend: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- Database: Turso (libSQL) with Drizzle ORM ^0.31.x
- API Routes: Next.js API routes for database connections and Polcar scraping
- State Management: React useState/useReducer + Server Actions
- Error Handling: Comprehensive try-catch with user feedback
- Performance: Drizzle indexes on OEM numbers, car models, quantities
- Deployment: Vercel with Turso database (confirmed compatible)

DRIZZLE SETUP:
```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  },
});

// src/db/index.ts
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client, { schema });
```

PHASE 1 DELIVERABLES:
1. Working Next.js 15 app with all 5 dashboard cards
2. Excel import functionality with smart data processing
3. Complete search system including car compatibility
4. Part detail view with quantity management and compatibility
5. Basic Polcar scraping integration via API routes
6. Lookup value management (categories, suppliers, car makes/models)
7. Norwegian interface throughout
8. Responsive design optimized for desktop use
9. Drizzle ORM with Turso database integration

START WITH: Complete working Next.js 15 application that demonstrates all core functionality including Polcar integration and smart data management. Focus on usability for 60+ year old user while maintaining modern, clean design. Ensure proper database relationships and data quality features throughout.
```