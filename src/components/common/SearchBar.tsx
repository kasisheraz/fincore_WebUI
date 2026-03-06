import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  defaultValue?: string;
  fullWidth?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  onSearch,
  defaultValue = '',
  fullWidth = true,
}) => {
  const [query, setQuery] = useState(defaultValue);

  const handleSearch = () => {
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <TextField
      size="small"
      fullWidth={fullWidth}
      placeholder={placeholder}
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyPress={handleKeyPress}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: query && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear}>
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;
