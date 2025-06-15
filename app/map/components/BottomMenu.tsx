import { useState, useRef, useEffect } from 'react';
import { locations } from '../locations';

interface LocationDropdownProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  currentLocation?: [number, number] | null;
  includeCurrentLocation?: boolean;
}

function LocationDropdown({ 
  label, 
  placeholder, 
  value, 
  onChange,
  includeCurrentLocation = false 
}: LocationDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLocationChange = (value: string) => {
    onChange(value);
    setSearchQuery(value);
    setIsDropdownOpen(false);
    setIsSearching(false);
  };

  const filteredLocations = isSearching ? 
    (includeCurrentLocation ? 
      [{
        name: "Current Location",
        coordinates: null
      }, ...locations.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase())
      )] :
      locations.filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ) : 
    (includeCurrentLocation ? 
      [{
        name: "Current Location",
        coordinates: null
      }, ...locations] :
      locations
    );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isDropdownOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isDropdownOpen]);

  return (
    <div style={{ marginBottom: '20px' }}>
      <label 
        htmlFor={label.toLowerCase().replace(/\s+/g, '-')} 
        style={{ 
          display: 'block',
          marginBottom: '8px',
          color: '#333',
          fontWeight: '500'
        }}
      >
        {label}
      </label>
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <div
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: 'white',
            color: '#333',
            fontSize: '1rem',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsDropdownOpen(true);
              setIsSearching(true);
            }}
            placeholder={placeholder}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              backgroundColor: 'transparent',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsDropdownOpen(true);
              setIsSearching(false);
              setSearchQuery(value);
            }}
          />
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease-in-out',
              flexShrink: 0,
              marginLeft: '8px',
            }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
        {isDropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
              marginTop: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: 1001,
              color: 'black',
            }}
          >
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filteredLocations.map((location) => (
                <div
                  key={location.name}
                  onClick={() => handleLocationChange(location.name)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: value === location.name ? '#f0f0f0' : 'transparent',
                  }}
                  className="hover:bg-gray-100"
                >
                  {location.name}
                </div>
              ))}
              {filteredLocations.length === 0 && (
                <div style={{ padding: '8px 12px', color: '#666' }}>
                  No locations found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface BottomMenuProps {
  isStepFree: boolean;
  onStepFreeChange: (value: boolean) => void;
  onDestinationChange: (coordinates: [number, number] | null) => void;
  onStartLocationChange: (coordinates: [number, number] | null) => void;
  onGoClick: () => void;
}

export default function BottomMenu({ 
  isStepFree, 
  onStepFreeChange, 
  onDestinationChange,
  onStartLocationChange,
  onGoClick
}: BottomMenuProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedStart, setSelectedStart] = useState('Current Location');

  const handleDestinationChange = (value: string) => {
    setSelectedDestination(value);
    const location = locations.find(loc => loc.name === value);
    onDestinationChange(location ? location.coordinates : null);
  };

  const handleStartLocationChange = (value: string) => {
    setSelectedStart(value);
    const location = locations.find(loc => loc.name === value);
    onStartLocationChange(location ? location.coordinates : null);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
        transition: 'height 0.3s ease-in-out',
        height: isExpanded ? '50vh' : '60px',
        zIndex: 1000,
      }}
    >
      {/* Arrow button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          position: 'absolute',
          left: '20px',
          top: '10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '5px',
          transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
          transition: 'transform 0.3s ease-in-out',
          color: '#333',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Menu content */}
      <div
        style={{
          padding: '40px 20px 20px 20px',
          height: '100%',
          overflowY: 'auto',
        }}
      >
        {isExpanded && (
          <div>
            <h2 style={{ 
              marginBottom: '20px',
              marginTop: '20px',
              color: '#333',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              Navigation Menu
            </h2>
            
            <LocationDropdown
              label="Select Starting Location"
              placeholder="Search starting locations..."
              value={selectedStart}
              onChange={handleStartLocationChange}
              includeCurrentLocation={true}
            />

            <LocationDropdown
              label="Select Destination"
              placeholder="Search destinations..."
              value={selectedDestination}
              onChange={handleDestinationChange}
            />

            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#333',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={isStepFree}
                  onChange={(e) => onStepFreeChange(e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                  }}
                />
                <span style={{ fontWeight: '500' }}>Step-free route</span>
              </label>
            </div>

            <div style={{ 
              padding: '15px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              color: '#666'
            }}>
              <p>Select a destination from the dropdown above to get directions.</p>
              {isStepFree && (
                <p style={{ marginTop: '8px', color: '#2c5282' }}>
                  Step-free route enabled - will avoid stairs and steps
                </p>
              )}
            </div>

            <button
              onClick={onGoClick}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '20px',
                transition: 'background-color 0.2s ease-in-out',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
            >
              Go
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 