import { useState, useRef, useEffect, RefObject } from 'react';
import { locations, Location } from '../locations';

interface LocationDropdownProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  currentLocation?: [number, number] | null;
  includeCurrentLocation?: boolean;
  onValidityChange?: (isValid: boolean) => void;
  customStyles?: React.CSSProperties;
  isUserInCampus?: boolean | null;
}

interface DropdownItem {
  name: string;
  coordinates: [number, number] | [number, number][] | null;
  disabled?: boolean;
  highlightable?: boolean;
}

function LocationDropdown({ 
  label, 
  placeholder, 
  value, 
  onChange,
  includeCurrentLocation = false,
  onValidityChange,
  customStyles,
  isUserInCampus
}: LocationDropdownProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(value);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleLocationChange = (value: string) => {
    if (value === "Current Location" && (isUserInCampus === false || isUserInCampus === null)) {
      return;
    }
    onChange(value);
    setSearchQuery(value);
    setIsDropdownOpen(false);
    setIsSearching(false);
    onValidityChange?.(true);
  };

  const validateInput = (text: string) => {
    const isValid = text === "Current Location" ? isUserInCampus === true : 
      !!text.match("^-?\\d+(\\.\\d*)?, ?\\d+(.?\\d*)$")?.length || locations.some(loc => loc.name === text);
    onValidityChange?.(isValid);
    return isValid;
  };

  const filteredLocations: DropdownItem[] = isSearching ? 
    (includeCurrentLocation ? 
      [{
        name: "Current Location",
        coordinates: null,
        disabled: isUserInCampus === false || isUserInCampus === null
      }, ...locations.map(loc => ({ ...loc, disabled: false }))].filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ) :
      locations.map(loc => ({ ...loc, disabled: false })).filter(location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    ) : 
    (includeCurrentLocation ? 
      [{
        name: "Current Location",
        coordinates: null,
        disabled: isUserInCampus === false || isUserInCampus === null
      }, ...locations.map(loc => ({ ...loc, disabled: false }))] :
      locations.map(loc => ({ ...loc, disabled: false }))
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

  // Set text when value is externally set
  useEffect(() => {
    if (searchQuery != value) {
      setSearchQuery(value);
      validateInput(value);
    }
  }, [value]);

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
            onBlur={() => {
              validateInput(searchQuery);
            }}
            placeholder={placeholder}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '1rem',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              ...customStyles
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
                    cursor: location.disabled ? 'not-allowed' : 'pointer',
                    backgroundColor: value === location.name ? '#f0f0f0' : 'transparent',
                    color: location.disabled ? '#999' : 'inherit',
                    fontStyle: location.disabled ? 'italic' : 'normal',
                    opacity: location.disabled ? 0.7 : 1,
                  }}
                  className={!location.disabled ? "hover:bg-gray-100" : ""}
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
        {value === "Current Location" && isUserInCampus === false && (
          <div style={{ 
            color: '#ff4444', 
            fontSize: '0.875rem', 
            marginTop: '4px',
            fontWeight: '500'
          }}>
            User is not inside Foothill campus
          </div>
        )}
        {value === "Current Location" && isUserInCampus === null && (
          <div style={{ 
            color: '#ff4444', 
            fontSize: '0.875rem', 
            marginTop: '4px',
            fontWeight: '500'
          }}>
            User location not available
          </div>
        )}
      </div>
    </div>
  );
}

interface BottomMenuProps {
  isStepFree: boolean;
  onStepFreeChange: (value: boolean) => void;
  onDestinationChange: (coordinates: [number, number] | [number, number][] | null) => void;
  onDestinationLocationChange: (name: Location | null) => void;
  onStartLocationChange: (name: Location | null) => void;
  startLocation: Location | null;
  onStartPositionChange: (coordinates: [number, number] | [number, number][] | null) => void;
  isMenuExpanded: boolean;
  onIsMenuExpandedChange: (isMenuExpanded: boolean) => void;
  selectedDestination: string;
  onSelectedDestinationChange: (destination: string) => void;
  selectedStart: string;
  onSelectedStartChange: (destination: string) => void;
  isUserInCampus: boolean | null;
  onAutoSelectLot: () => void;
  pickMode: null | "destination" | "start";
  setPickMode: (mode: null | "destination" | "start") => void;
  destinationLocationRef: RefObject<Location | null>
}

export default function BottomMenu({ 
  isStepFree, 
  onStepFreeChange, 
  onDestinationChange,
  onDestinationLocationChange,
  onStartLocationChange,
  startLocation,
  onStartPositionChange,
  isMenuExpanded,
  onIsMenuExpandedChange,
  selectedDestination,
  onSelectedDestinationChange,
  selectedStart,
  onSelectedStartChange,
  isUserInCampus,
  onAutoSelectLot,
  pickMode,
  setPickMode,
  destinationLocationRef
}: BottomMenuProps) {
  const [isDestinationValid, setIsDestinationValid] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showAutoStartTooltip, setShowAutoStartTooltip] = useState(false);
  const [showPickStartTooltip, setShowPickStartTooltip] = useState(false);
  const [showPickDestinationTooltip, setShowPickDestinationTooltip] = useState(false);

  const handleDestinationChange = (value: string) => {
    onSelectedDestinationChange(value);
    const location = locations.find(loc => loc.name === value);
    onDestinationChange(location ? location.coordinates : null);
    onDestinationLocationChange(location ?? null);
    destinationLocationRef.current = location ?? null
  };
  
  const handleStartLocationChange = (value: string) => {
    onSelectedStartChange(value);
    const location = locations.find(loc => loc.name === value);
    onStartPositionChange(location ? location.coordinates : null);
    onStartLocationChange(location ? location : null);
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
        height: isMenuExpanded ? '50vh' : '60px',
        zIndex: 1000,
      }}
    >
      {/* Arrow button */}
      <button
        onClick={() => onIsMenuExpandedChange(!isMenuExpanded)}
        style={{
          position: 'absolute',
          left: '20px',
          top: '10px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '5px',
          transform: isMenuExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
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
        {isMenuExpanded && (
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
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <LocationDropdown
                  label="Select Starting Location"
                  placeholder="Search starting locations..."
                  value={selectedStart}
                  onChange={handleStartLocationChange}
                  includeCurrentLocation={true}
                  onValidityChange={() => {}}
                  customStyles={selectedStart === "Current Location" && (isUserInCampus === false || isUserInCampus === null) ? {
                    color: '#999',
                    fontStyle: 'italic'
                  } : undefined}
                  isUserInCampus={isUserInCampus}
                />
              </div>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 70 }}>
                <span style={{ fontSize: '0.8rem', marginBottom: 2, color: '#333', fontWeight: 500 }}>Pick Start Location</span>
                <button
                  aria-label="Pick start location on map"
                  onClick={() => {
                    if(pickMode == "start") {
                      setPickMode(null)
                    } else {
                      setPickMode("start")
                    }
                  }}
                  onMouseEnter={() => setShowPickStartTooltip(true)}
                  onMouseLeave={() => setShowPickStartTooltip(false)}
                  style={{
                    marginLeft: 0,
                    background: pickMode === "start" ? '#4285F4' : '#eee',
                    border: 'none',
                    borderRadius: '4px',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: pickMode === "start" ? 'white' : '#333',
                    outline: pickMode === "start" ? '2px solid #4285F4' : 'none',
                    boxShadow: pickMode === "start" ? '0 0 0 2px #90caf9' : 'none',
                    transition: 'background 0.2s, color 0.2s, outline 0.2s',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="2" x2="12" y2="6" />
                    <line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="6" y2="12" />
                    <line x1="18" y1="12" x2="22" y2="12" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
                {showPickStartTooltip && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 1000,
                    }}
                  >
                    Pick start
                    <br />
                    location on map
                  </div>
                )}
              </div>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 50 }}>
                <span style={{ fontSize: '0.8rem', marginBottom: 2, color: '#333', fontWeight: 500 }}>Auto Start</span>
                <button
                  onClick={() => {
                    onAutoSelectLot()
                  }}
                  disabled={!isDestinationValid}
                  aria-label="Auto-start from closest lot"
                  onMouseEnter={() => setShowAutoStartTooltip(true)}
                  onMouseLeave={() => setShowAutoStartTooltip(false)}
                  style={{
                    marginLeft: 0,
                    background: !isDestinationValid ? '#cccccc' : '#4CAF50',
                    border: 'none',
                    borderRadius: '4px',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: !isDestinationValid ? 'not-allowed' : 'pointer',
                    color: 'white',
                    transition: 'background-color 0.2s ease-in-out',
                  }}
                  onMouseOver={(e) => {
                    if (isDestinationValid) {
                      e.currentTarget.style.backgroundColor = '#45a049';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (isDestinationValid) {
                      e.currentTarget.style.backgroundColor = '#4CAF50';
                    }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </button>
                {showAutoStartTooltip && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 1000,
                    }}
                  >
                    Auto-start from
                    <br />
                    closest lot
                  </div>
                )}
              </div>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 70 }}>
                <span style={{ fontSize: '0.8rem', marginBottom: 2, color: '#333', fontWeight: 500 }}>Google Maps</span>
                <button
                  onClick={() => {
                    if (startLocation?.link) {
                      window.open(startLocation.link, '_blank');
                    }
                  }}
                  disabled={!startLocation?.link}
                  aria-label="Open starting location in google maps"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  style={{
                    marginLeft: 0,
                    backgroundColor: !startLocation?.link ? '#cccccc' : '#4285F4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: !startLocation?.link ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s ease-in-out',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 36,
                    height: 36,
                  }}
                  onMouseOver={(e) => {
                    if (startLocation?.link) {
                      e.currentTarget.style.backgroundColor = '#3367d6';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (startLocation?.link) {
                      e.currentTarget.style.backgroundColor = '#4285F4';
                    }
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </button>
                {showTooltip && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 1000,
                    }}
                  >
                    Open starting
                    <br />
                    location in
                    <br />
                    google maps
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <LocationDropdown
                  label="Select Destination"
                  placeholder="Search destinations..."
                  value={selectedDestination}
                  onChange={handleDestinationChange}
                  onValidityChange={setIsDestinationValid}
                />
              </div>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 90 }}>
                <span style={{ fontSize: '0.8rem', marginBottom: 2, color: '#333', fontWeight: 500 }}>Pick Destination</span>
                <button
                  aria-label="Pick destination on map"
                  onClick={() => {
                    if(pickMode == "destination") {
                      setPickMode(null)
                    } else {
                      setPickMode("destination")
                    }
                  }}
                  onMouseEnter={() => setShowPickDestinationTooltip(true)}
                  onMouseLeave={() => setShowPickDestinationTooltip(false)}
                  style={{
                    marginLeft: 0,
                    background: pickMode === "destination" ? '#4285F4' : '#eee',
                    border: 'none',
                    borderRadius: '4px',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: pickMode === "destination" ? 'white' : '#333',
                    outline: pickMode === "destination" ? '2px solid #4285F4' : 'none',
                    boxShadow: pickMode === "destination" ? '0 0 0 2px #90caf9' : 'none',
                    transition: 'background 0.2s, color 0.2s, outline 0.2s',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="2" x2="12" y2="6" />
                    <line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="6" y2="12" />
                    <line x1="18" y1="12" x2="22" y2="12" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
                {showPickDestinationTooltip && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-30px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 1000,
                    }}
                  >
                    Pick destination
                    <br />
                    on map
                  </div>
                )}
              </div>
            </div>

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
                <span style={{ fontWeight: '500' }}>Stair-free route</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 