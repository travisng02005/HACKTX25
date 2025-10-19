# Toyota Vehicle Database

## Current Implementation: JSON File

The vehicle database is currently implemented as a JSON file for simplicity and performance in a frontend-only application.

### File Structure
```
src/data/
├── toyotaVehicles.json      # Main vehicle data
├── vehicleDatabase.js       # Database service layer (optional)
└── README.md               # This file
```

### Data Schema
```json
{
  "ModelName": {
    "category": "SUV|Sedan|Truck|Hatchback|Minivan",
    "basePrice": 35000,
    "trims": [
      {
        "name": "Trim Name",
        "price": 35000,
        "mpg": "27/35",
        "features": ["Feature 1", "Feature 2"]
      }
    ]
  }
}
```

### Usage in Components
```jsx
// Direct JSON import (current approach)
import toyotaVehicles from './data/toyotaVehicles.json'

// Or use the service layer
import { vehicleDB } from './data/vehicleDatabase.js'

// Get all models
const models = Object.keys(toyotaVehicles)
// OR
const models = vehicleDB.getAllModels()

// Get trims for a model
const trims = toyotaVehicles[selectedModel]?.trims || []
// OR
const trims = vehicleDB.getTrimsForModel(selectedModel)
```

## Future Migration to Real Database

### Option 1: SQLite with Backend
```bash
# Backend setup
npm install express sqlite3
# Create API endpoints for vehicle data
# Update frontend to use fetch() calls
```

### Option 2: Firebase/Supabase
```bash
npm install firebase
# Or
npm install @supabase/supabase-js
```

### Option 3: PostgreSQL/MySQL
```bash
# Full backend with database
npm install express pg
# Create proper REST API
```

### Migration Strategy
1. Keep JSON file as fallback
2. Add database service layer (already created)
3. Update service methods to use API calls
4. Components don't need to change (using service layer)

### Benefits of Current JSON Approach
- ✅ **No Backend Required**: Pure frontend solution
- ✅ **Fast Loading**: Bundled with app, no network calls
- ✅ **Version Control**: Easy to track data changes
- ✅ **Simple Deployment**: No database setup needed
- ✅ **Perfect for Hackathons**: Quick and reliable

### When to Migrate to Real Database
- Vehicle data changes frequently (monthly updates)
- Need user-generated content (reviews, ratings)
- Multiple admin users editing data
- Data size exceeds 1MB (performance)
- Need advanced querying/filtering
- Real-time inventory tracking

### Current Data Stats
- **10 Models**: RAV4, Camry, Corolla, Highlander, Prius, Sienna, Tacoma, Tundra, 4Runner, Corolla Cross
- **63 Total Trims**: Comprehensive coverage including hybrids
- **File Size**: ~8KB (very lightweight)
- **Load Time**: Instant (bundled with app)

## Maintenance

### Adding New Models
1. Edit `toyotaVehicles.json`
2. Add new model with proper schema
3. Test in development
4. Commit changes

### Adding New Trims
1. Find the model in `toyotaVehicles.json`
2. Add new trim to `trims` array
3. Include price, mpg, and features
4. Test dropdown functionality

### Pricing Updates
1. Update `price` field for affected trims
2. Verify payment calculations still work
3. Test with different APR scenarios