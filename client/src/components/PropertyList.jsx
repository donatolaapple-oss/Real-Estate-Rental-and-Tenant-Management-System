import React, { useState, useEffect } from 'react';
import PropertyMap from './PropertyMap';
import axios from 'axios';

const PropertyList = () => {
  const [properties, setProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:5000/api/properties')
      .then(({ data }) => setProperties(data))
      .catch(console.error);
  }, []);

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Properties Grid */}
        <div className="col-lg-8">
          <h2 className="mb-4">🏠 Properties ({properties.length})</h2>
          <div className="row g-4">
            {properties.map(property => (
              <div key={property._id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm border-0 hover-shadow">
                  <img 
                    src={property.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                    className="card-img-top" 
                    alt={property.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{property.title}</h5>
                    <p className="card-text flex-grow-1">{property.address}</p>
                    <div className="text-success fw-bold fs-5 mb-3">
                      ₱{property.price?.toLocaleString()}
                    </div>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-primary flex-fill"
                        onClick={() => {
                          setSelectedProperty(property);
                          setShowMap(true);
                        }}
                      >
                        📍 View Location
                      </button>
                      <button className="btn btn-outline-secondary">Edit</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Sidebar */}
        <div className="col-lg-4">
          {showMap && selectedProperty ? (
            <>
              <button 
                className="btn btn-outline-secondary w-100 mb-3"
                onClick={() => setShowMap(false)}
              >
                ❌ Close Map
              </button>
              <PropertyMap 
                properties={properties}
                selectedProperty={selectedProperty}
                onSelect={setSelectedProperty}
              />
            </>
          ) : (
            <div className="card border-0 shadow-sm h-100 d-flex align-items-center justify-content-center text-center p-4">
              <div>
                <i className="fas fa-map-marker-alt fa-3x text-primary mb-3"></i>
                <h5 className="text-muted">Interactive Property Map</h5>
                <p className="text-muted small">
                  Click "View Location" on any property to see it on the map!<br/>
                  <strong>Red pin</strong> = Selected property
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyList;
