import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { createReport } from '../services/api';
import { useToast } from '../components/Toast';
import { Waves, Flame, Activity, Wind, Mountain, Sun, AlertTriangle, MapPin } from 'lucide-react';
import './NewReport.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DISASTER_TYPES = [
  { id: 'FLOOD', icon: <Waves size={24} />, label: 'Flood' },
  { id: 'FIRE', icon: <Flame size={24} />, label: 'Fire' },
  { id: 'EARTHQUAKE', icon: <Activity size={24} />, label: 'Earthquake' },
  { id: 'CYCLONE', icon: <Wind size={24} />, label: 'Cyclone' },
  { id: 'LANDSLIDE', icon: <Mountain size={24} />, label: 'Landslide' },
  { id: 'DROUGHT', icon: <Sun size={24} />, label: 'Drought' },
  { id: 'OTHER', icon: <AlertTriangle size={24} />, label: 'Other' },
];

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

export default function NewReport() {
  const navigate = useNavigate();
  const { success: toastSuccess, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [disasterType, setDisasterType] = useState('');
  const [position, setPosition] = useState(null);

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
        (err) => toastError('Could not get location: ' + err.message)
      );
    } else {
      toastError('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!disasterType) return toastError('Please select a disaster type.');
    if (!position) return toastError('Please select a location on the map.');

    setLoading(true);
    try {
      await createReport({
        title,
        description,
        disasterType,
        latitude: position[0],
        longitude: position[1]
      });
      toastSuccess('Report submitted successfully!');
      navigate('/reports');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-report-page animate-fade-in">
      <div className="glass-card new-report-card">
        <h2 className="new-report-title">File New Disaster Report</h2>
        <form onSubmit={handleSubmit} className="new-report-form">
          <div className="form-group">
            <label className="form-label">Report Title</label>
            <input 
              type="text" 
              className="form-input" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="E.g., Severe flooding in Main St." 
              required 
              minLength={5}
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Disaster Type</label>
            <div className="disaster-grid">
              {DISASTER_TYPES.map(type => (
                <div 
                  key={type.id}
                  className={`disaster-card ${disasterType === type.id ? 'disaster-card--active' : ''}`}
                  onClick={() => setDisasterType(type.id)}
                >
                  <span className="disaster-card__icon">{type.icon}</span>
                  <span className="disaster-card__label">{type.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-textarea" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Provide details about the incident..."
              required
              minLength={10}
            />
            <div className={`char-count ${description.length < 10 ? 'char-count--invalid' : ''}`}>
              {description.length} chars (min 10)
            </div>
          </div>

          <div className="form-group">
            <div className="location-header">
              <label className="form-label">Location</label>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleUseLocation}>
                <MapPin size={16} /> Use My Location
              </button>
            </div>
            <div className="map-container-wrapper">
              <MapContainer 
                center={[20.5937, 78.9629]} 
                zoom={4} 
                style={{ height: '300px', width: '100%', borderRadius: 'var(--radius-md)' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />
                <LocationPicker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
            {position && (
              <p className="location-coords">
                Selected: Lat {position[0].toFixed(4)}, Lng {position[1].toFixed(4)}
              </p>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
