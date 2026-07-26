import  { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import axios from 'axios';

export const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
  const res = await axios.get(
    `https://atmos-weather-api-ho4c.onrender.com/api/search?q=${encodeURIComponent(query)}`
  );

  setSuggestions(res.data);
} catch (error) {
  console.error('Error fetching suggestions:', error);
  setSuggestions([]);
}
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Find exact match or just pass query text
      const match = suggestions.find(s => s.name.toLowerCase() === query.toLowerCase());
      if (match) {
        onSearch(match);
      } else if (suggestions.length > 0) {
        onSearch(suggestions[0]);
      }
      setShowSuggestions(false);
    }
  };

  const handleSelect = (city) => {
    setQuery(city.name);
    onSearch(city);
    setShowSuggestions(false);
  };

  return (
    <div className="search-container" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="search-form">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          className="glass-input search-input"
          placeholder="Search for a city..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
        />
        <button type="submit" className="search-button">
          Search
        </button>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <ul className="glass suggestions">
          {suggestions.map((city) => (
            <li 
              key={city.id} 
              className="suggestion-item"
              onClick={() => handleSelect(city)}
            >
              <MapPin size={16} className="text-secondary" />
              <div>
                {city.name} 
                {city.admin1 && <span>, {city.admin1}</span>}
                <span>, {city.country}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
