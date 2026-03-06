import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Collapse,
  IconButton,
  Grid,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';

export interface FilterField {
  name: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  options?: { label: string; value: string | number }[];
  placeholder?: string;
}

interface FilterPanelProps {
  fields: FilterField[];
  onFilter: (filters: Record<string, any>) => void;
  onClear: () => void;
  defaultExpanded?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  fields,
  onFilter,
  onClear,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [filters, setFilters] = useState<Record<string, any>>({});

  const handleFilterChange = (name: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApply = () => {
    // Remove empty filters
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);
    
    onFilter(activeFilters);
  };

  const handleClear = () => {
    setFilters({});
    onClear();
  };

  const renderField = (field: FilterField) => {
    switch (field.type) {
      case 'select':
        return (
          <FormControl fullWidth size="small">
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={filters[field.name] || ''}
              label={field.label}
              onChange={(e) => handleFilterChange(field.name, e.target.value)}
            >
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {field.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'date':
        return (
          <TextField
            fullWidth
            size="small"
            type="date"
            label={field.label}
            value={filters[field.name] || ''}
            onChange={(e) => handleFilterChange(field.name, e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'dateRange':
        return (
          <>
            <TextField
              fullWidth
              size="small"
              type="date"
              label={`${field.label} From`}
              value={filters[`${field.name}From`] || ''}
              onChange={(e) => handleFilterChange(`${field.name}From`, e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              size="small"
              type="date"
              label={`${field.label} To`}
              value={filters[`${field.name}To`] || ''}
              onChange={(e) => handleFilterChange(`${field.name}To`, e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </>
        );

      default:
        return (
          <TextField
            fullWidth
            size="small"
            label={field.label}
            placeholder={field.placeholder}
            value={filters[field.name] || ''}
            onChange={(e) => handleFilterChange(field.name, e.target.value)}
          />
        );
    }
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== '' && value !== null && value !== undefined
  );

  return (
    <Paper sx={{ mb: 2 }}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterIcon />
          <Typography variant="subtitle1" fontWeight="medium">
            Filters
            {hasActiveFilters && (
              <Typography component="span" color="primary" ml={1}>
                ({Object.keys(filters).filter((k) => filters[k]).length} active)
              </Typography>
            )}
          </Typography>
        </Box>
        <IconButton
          size="small"
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ p: 2, pt: 0 }}>
          <Grid container spacing={2}>
            {fields.map((field) => (
              <Grid item xs={12} sm={6} md={field.type === 'dateRange' ? 6 : 3} key={field.name}>
                {renderField(field)}
              </Grid>
            ))}
          </Grid>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={handleApply}
            >
              Apply Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              disabled={!hasActiveFilters}
            >
              Clear Filters
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default FilterPanel;
