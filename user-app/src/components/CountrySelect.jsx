// components/CountrySelect.js
import React from 'react';
import Select from 'react-select';
import ReactCountryFlag from 'react-country-flag';
import { sortedCountries } from '../utils/countryList';

const CountrySelect = ({ value, onChange, error, placeholder = "Select a country..." }) => {
  const options = sortedCountries.map(country => ({
    value: country.code3, // Store Alpha-3 in value
    label: (
      <div className="flex items-center">
        <ReactCountryFlag
          countryCode={country.code} // Use Alpha-2 for flag
          svg
          style={{ 
            width: '1.5em', 
            height: '1.5em', 
            marginRight: '10px',
            borderRadius: '2px'
          }}
        />
        <div>
          <div className="font-medium text-slate-800">{country.name}</div>
          <div className="text-xs text-slate-500">{country.code3}</div>
        </div>
      </div>
    ),
    country
  }));

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div>
      <Select
        options={options}
        value={selectedOption}
        onChange={(option) => onChange(option.value)}
        isSearchable
        placeholder={placeholder}
        className="react-select-container"
        classNamePrefix="react-select"
        
        getOptionLabel={(option) => option.country.name}
        getOptionValue={(option) => option.value}
        
        formatOptionLabel={({ country }) => (
          <div className="flex items-center">
            <ReactCountryFlag
              countryCode={country.code}
              svg
              style={{ 
                width: '1.5em', 
                height: '1.5em', 
                marginRight: '10px',
                borderRadius: '2px'
              }}
            />
            <div>
              <div className="font-medium text-slate-800">{country.name}</div>
              <div className="text-xs text-slate-500">{country.code3}</div>
            </div>
          </div>
        )}
        
        styles={{
          control: (base, state) => ({
            ...base,
            borderColor: error ? '#fca5a5' : state.isFocused ? '#8b5cf6' : '#e2e8f0',
            borderRadius: '1rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: '#f8fafc',
            minHeight: '48px',
            '&:hover': {
              borderColor: error ? '#f87171' : '#c7d2fe',
            },
            boxShadow: state.isFocused 
              ? (error ? '0 0 0 1px #fecaca' : '0 0 0 1px #ddd6fe') 
              : 'none',
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected 
              ? '#ede9fe' 
              : state.isFocused 
                ? '#f5f3ff' 
                : 'white',
            color: '#1e293b',
            padding: '10px 15px',
            cursor: 'pointer',
            '&:active': {
              backgroundColor: '#ede9fe',
            }
          }),
          menu: (base) => ({
            ...base,
            borderRadius: '1rem',
            overflow: 'hidden',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e2e8f0',
          }),
          placeholder: (base) => ({
            ...base,
            color: '#94a3b8',
            fontSize: '0.875rem',
          }),
        }}
        
        theme={(theme) => ({
          ...theme,
          colors: {
            ...theme.colors,
            primary: '#8b5cf6',
            primary25: '#f5f3ff',
            primary50: '#ede9fe',
            primary75: '#ddd6fe',
            danger: '#ef4444',
            dangerLight: '#fecaca',
          },
        })}
      />
      
      {error && (
        <p className="mt-2 text-sm text-red-600 font-light flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default CountrySelect;