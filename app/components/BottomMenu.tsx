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
          <style jsx>{`
            input::placeholder {
              color: #9ca3af;
              font-style: italic;
            }
          `}</style>
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
  destinationLocationRef: RefObject<Location | null>;
  onClearRoute?: () => void;
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
  destinationLocationRef,
  onClearRoute
}: BottomMenuProps) {
  const [isDestinationValid, setIsDestinationValid] = useState(false);
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
        backgroundColor: '#ffffff',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
        transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        height: isMenuExpanded ? '50vh' : '60px',
        zIndex: 1000,
        borderTop: '1px solid #e5e7eb',
      }}
    >
      {/* Arrow button */}
      <button
        onClick={() => onIsMenuExpandedChange(!isMenuExpanded)}
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          top: '12px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          cursor: 'pointer',
          padding: '8px',
          width: '40px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease-in-out',
          color: '#64748b',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#f1f5f9';
          e.currentTarget.style.borderColor = '#cbd5e1';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#f8fafc';
          e.currentTarget.style.borderColor = '#e2e8f0';
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transform: isMenuExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.3s ease-in-out',
          }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Menu content */}
      <div
        style={{
          padding: '48px 24px 24px 24px',
          height: '100%',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
        }}
      >
        {isMenuExpanded && (
          <div>
            <h2 style={{ 
              marginBottom: '32px',
              marginTop: '0',
              color: '#1e293b',
              fontSize: '1.75rem',
              fontWeight: '700',
              letterSpacing: '-0.025em',
              borderBottom: '2px solid #f1f5f9',
              paddingBottom: '16px',
            }}>
              Navigation Menu
            </h2>
            
            {/* Starting Location Section */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '16px',
                marginTop: '0',
              }}>
                Starting Location
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '280px' }}>
                  <LocationDropdown
                    label="Select Starting Location From List"
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
                
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Pick Start Button */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      marginBottom: '8px', 
                      color: '#6b7280', 
                      fontWeight: '500',
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>
                      Pick Start On Map
                    </span>
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
                        background: pickMode === "start" ? '#3b82f6' : '#f8fafc',
                        border: pickMode === "start" ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                        borderRadius: '8px',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: pickMode === "start" ? 'white' : '#64748b',
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: pickMode === "start" ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                      }}
                      onMouseOver={(e) => {
                        if (pickMode !== "start") {
                          e.currentTarget.style.backgroundColor = '#f1f5f9';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (pickMode !== "start") {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }
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
                          bottom: '-40px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#1f2937',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          zIndex: 1000,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        Pick start location on map
                      </div>
                    )}
                  </div>

                  {/* Auto Start Button */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      marginBottom: '8px', 
                      color: '#6b7280', 
                      fontWeight: '500',
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>
                      Start From Closest Lot
                    </span>
                    <button
                      onClick={() => {
                        onAutoSelectLot()
                      }}
                      disabled={!isDestinationValid}
                      aria-label="Auto-start from closest lot"
                      onMouseEnter={() => setShowAutoStartTooltip(true)}
                      onMouseLeave={() => setShowAutoStartTooltip(false)}
                      style={{
                        background: !isDestinationValid ? '#f3f4f6' : '#10b981',
                        border: '2px solid',
                        borderColor: !isDestinationValid ? '#d1d5db' : '#10b981',
                        borderRadius: '8px',
                        width: '48px',
                        height: '48px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: !isDestinationValid ? 'not-allowed' : 'pointer',
                        color: 'white',
                        transition: 'all 0.2s ease-in-out',
                        boxShadow: !isDestinationValid ? '0 1px 3px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(16, 185, 129, 0.3)',
                      }}
                      onMouseOver={(e) => {
                        if (isDestinationValid) {
                          e.currentTarget.style.backgroundColor = '#059669';
                          e.currentTarget.style.borderColor = '#059669';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (isDestinationValid) {
                          e.currentTarget.style.backgroundColor = '#10b981';
                          e.currentTarget.style.borderColor = '#10b981';
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
                          bottom: '-40px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#1f2937',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          zIndex: 1000,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        Auto-start from closest lot
                      </div>
                    )}
                  </div>

                  {/* Google Maps Button */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      marginBottom: '8px', 
                      color: '#6b7280', 
                      fontWeight: '500',
                      textAlign: 'center',
                      lineHeight: '1.2'
                    }}>
                      Google Maps to Lot
                    </span>
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
                        backgroundColor: !startLocation?.link ? '#f3f4f6' : '#4285f4',
                        border: '2px solid',
                        borderColor: !startLocation?.link ? '#d1d5db' : '#4285f4',
                        color: 'white',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        cursor: !startLocation?.link ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '48px',
                        height: '48px',
                        boxShadow: !startLocation?.link ? '0 1px 3px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(66, 133, 244, 0.3)',
                      }}
                      onMouseOver={(e) => {
                        if (startLocation?.link) {
                          e.currentTarget.style.backgroundColor = '#3367d6';
                          e.currentTarget.style.borderColor = '#3367d6';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (startLocation?.link) {
                          e.currentTarget.style.backgroundColor = '#4285f4';
                          e.currentTarget.style.borderColor = '#4285f4';
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
                          bottom: '-40px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#1f2937',
                          color: 'white',
                          padding: '8px 12px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          pointerEvents: 'none',
                          zIndex: 1000,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        }}
                      >
                        Open starting location in Google Maps
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Destination Section */}
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '16px',
                marginTop: '0',
              }}>
                Destination
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1', minWidth: '280px' }}>
                  <LocationDropdown
                    label="Select Destination From List"
                    placeholder="Search destinations..."
                    value={selectedDestination}
                    onChange={handleDestinationChange}
                    onValidityChange={setIsDestinationValid}
                  />
                </div>
                
                {/* Pick Destination Button */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '100px' }}>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    marginBottom: '8px', 
                    color: '#6b7280', 
                    fontWeight: '500',
                    textAlign: 'center',
                    lineHeight: '1.2'
                  }}>
                    Pick Destination On Map
                  </span>
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
                      background: pickMode === "destination" ? '#3b82f6' : '#f8fafc',
                      border: pickMode === "destination" ? '2px solid #3b82f6' : '2px solid #e2e8f0',
                      borderRadius: '8px',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: pickMode === "destination" ? 'white' : '#64748b',
                      transition: 'all 0.2s ease-in-out',
                      boxShadow: pickMode === "destination" ? '0 4px 12px rgba(59, 130, 246, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                    }}
                    onMouseOver={(e) => {
                      if (pickMode !== "destination") {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (pickMode !== "destination") {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e2e8f0';
                      }
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
                        bottom: '-40px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: '#1f2937',
                        color: 'white',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        zIndex: 1000,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      }}
                    >
                      Pick destination on map
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Route Options Section */}
            <div style={{ 
              marginBottom: '20px',
              padding: '20px',
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '16px',
                marginTop: '0',
              }}>
                Route Options
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#374151',
                    cursor: 'pointer',
                    padding: '8px 0',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isStepFree}
                    onChange={(e) => onStepFreeChange(e.target.checked)}
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      accentColor: '#3b82f6',
                    }}
                  />
                  <span style={{ 
                    fontWeight: '500',
                    fontSize: '1rem',
                  }}>
                    Stair-free route
                  </span>
                </label>

                {/* Clear All Selections Button */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '8px 0',
                }}>
                  <button
                    onClick={() => {
                      onSelectedStartChange('');
                      onSelectedDestinationChange('');
                      onStartLocationChange(null);
                      onDestinationLocationChange(null);
                      onStartPositionChange(null);
                      onDestinationChange(null);
                      destinationLocationRef.current = null;
                      setPickMode(null);
                      onStepFreeChange(false);
                      onClearRoute?.();
                      window.history.replaceState({}, '', window.location.pathname);
                    }}
                    style={{
                      background: '#ef4444',
                      border: '2px solid #ef4444',
                      color: 'white',
                      borderRadius: '8px',
                      padding: '10px 16px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#dc2626';
                      e.currentTarget.style.borderColor = '#dc2626';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#ef4444';
                      e.currentTarget.style.borderColor = '#ef4444';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.2)';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                    Clear All Selections
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 