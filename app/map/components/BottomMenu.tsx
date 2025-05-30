import { useState } from 'react';

interface BottomMenuProps {
  isStepFree: boolean;
  onStepFreeChange: (value: boolean) => void;
}

export default function BottomMenu({ isStepFree, onStepFreeChange }: BottomMenuProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedOption, setSelectedOption] = useState('');

  const options = [
    { value: '', label: 'Select a destination...' },
    { value: 'library', label: 'Library' },
    { value: 'cafeteria', label: 'Cafeteria' },
    { value: 'parking', label: 'Parking Lot' },
    { value: 'classroom', label: 'Classroom Building' },
  ];

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
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
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
              color: '#333',
              fontSize: '1.5rem',
              fontWeight: '600'
            }}>
              Navigation Menu
            </h2>
            
            <div style={{ marginBottom: '20px' }}>
              <label 
                htmlFor="destination" 
                style={{ 
                  display: 'block',
                  marginBottom: '8px',
                  color: '#333',
                  fontWeight: '500'
                }}
              >
                Select Destination
              </label>
              <select
                id="destination"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  backgroundColor: 'white',
                  color: '#333',
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
          </div>
        )}
      </div>
    </div>
  );
} 