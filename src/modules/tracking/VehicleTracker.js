// Vehicle Tracking Module
// Handles real-time GPS tracking of garbage vehicles

class VehicleTracker {
  constructor() {
    this.vehicles = [
      { id: 'VH001', name: 'Truck A', lat: 18.5204, lng: 73.8567, status: 'moving', lastUpdate: new Date() },
      { id: 'VH002', name: 'Truck B', lat: 18.5304, lng: 73.8667, status: 'idle', lastUpdate: new Date() },
      { id: 'VH003', name: 'Truck C', lat: 18.5404, lng: 73.8767, status: 'moving', lastUpdate: new Date() }
    ];
  }

  getVehicles() {
    return this.vehicles;
  }

  getVehicleLocation(vehicleId) {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      return { success: false, message: 'Vehicle not found' };
    }
    return { success: true, location: { lat: vehicle.lat, lng: vehicle.lng }, status: vehicle.status };
  }

  updateLocation(vehicleId, lat, lng) {
    const vehicle = this.vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      return { success: false, message: 'Vehicle not found' };
    }
    
    vehicle.lat = lat;
    vehicle.lng = lng;
    vehicle.lastUpdate = new Date();
    
    console.log(`📍 Vehicle ${vehicle.name} location updated to (${lat}, ${lng})`);
    return { success: true, vehicle };
  }

  // BUG: Location not refreshing in real-time
  // FIX: This should be called every 5 seconds
  startRealTimeTracking(vehicleId, callback) {
    const interval = setInterval(() => {
      // Simulate location change
      const vehicle = this.vehicles.find(v => v.id === vehicleId);
      if (vehicle && vehicle.status === 'moving') {
        vehicle.lat += 0.001;
        vehicle.lng += 0.001;
        vehicle.lastUpdate = new Date();
        callback({ vehicleId, lat: vehicle.lat, lng: vehicle.lng });
      }
    }, 5000);
    
    return interval;
  }
}

module.exports = new VehicleTracker();
