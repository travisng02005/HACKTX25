// Vehicle Database Service
// This module provides an abstraction layer for vehicle data
// Currently uses JSON file, but can be easily migrated to a real database

import toyotaVehiclesData from './toyotaVehicles.json'

class VehicleDatabase {
  constructor() {
    this.data = toyotaVehiclesData
  }

  // Get all available models
  getAllModels() {
    return Object.keys(this.data)
  }

  // Get model details including trims
  getModel(modelName) {
    return this.data[modelName] || null
  }

  // Get trims for a specific model
  getTrimsForModel(modelName) {
    const model = this.getModel(modelName)
    return model ? model.trims : []
  }

  // Get specific trim details
  getTrim(modelName, trimName) {
    const model = this.getModel(modelName)
    if (!model) return null
    
    return model.trims.find(trim => trim.name === trimName) || null
  }

  // Search vehicles by category
  getVehiclesByCategory(category) {
    return Object.entries(this.data)
      .filter(([_, vehicle]) => vehicle.category === category)
      .reduce((acc, [model, details]) => {
        acc[model] = details
        return acc
      }, {})
  }

  // Get vehicles within price range
  getVehiclesInPriceRange(minPrice, maxPrice) {
    const result = {}
    
    Object.entries(this.data).forEach(([model, vehicle]) => {
      const affordableTrims = vehicle.trims.filter(
        trim => trim.price >= minPrice && trim.price <= maxPrice
      )
      
      if (affordableTrims.length > 0) {
        result[model] = {
          ...vehicle,
          trims: affordableTrims
        }
      }
    })
    
    return result
  }

  // Future: Add methods for database operations
  // async addVehicle(modelData) { /* API call */ }
  // async updateTrim(modelName, trimName, updates) { /* API call */ }
  // async deleteTrim(modelName, trimName) { /* API call */ }
}

// Export singleton instance
export const vehicleDB = new VehicleDatabase()

// For direct access to raw data (backward compatibility)
export default toyotaVehiclesData