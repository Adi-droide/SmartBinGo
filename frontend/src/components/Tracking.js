import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Tracking() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/vehicles`);
      setVehicles(res.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const trackVehicle = async (vehicleId) => {
    try {
      const res = await axios.get(`${API_URL}/api/vehicles/${vehicleId}/location`);
      setLocation(res.data.location);
      setSelectedVehicle(vehicleId);
    } catch (error) {
      console.error('Error tracking vehicle:', error);
    }
  };

  return (
    <div>
      <h1>Vehicle Tracking</h1>
      
      <h2>Select Vehicle</h2>
      <select onChange={(e) => trackVehicle(e.target.value)}>
        <option value="">Select...</option>
        {vehicles.map(v => (
          <option key={v.id} value={v.id}>{v.name}</option>
        ))}
      </select>
      
      {location && (
        <div>
          <h3>Current Location</h3>
          <p>Latitude: {location.lat}</p>
          <p>Longitude: {location.lng}</p>
          <p>⚠️ Location updates every 5 seconds</p>
        </div>
      )}
    </div>
  );
}

export default Tracking;
