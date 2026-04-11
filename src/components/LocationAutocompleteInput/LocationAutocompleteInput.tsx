'use client';

import { ChangeEvent, KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import InputField2 from '@/ui/InputField2/InputField2';
import { Location, useLocations } from '@/lib/locations';
import './LocationAutocompleteInput.scss';
import { LOCATION_CABA_ID, LOCATION_COSTA_ATLANTICA_ID, LOCATION_GB_INTERIOR_ID, LOCATION_GB_NORTE_ID, LOCATION_GB_OESTE_ID, LOCATION_GB_SUR_ID } from '@/app/constants';

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

function getQueryPartitions(query: string) {
  const words = normalizeText(query).split(' ').filter(Boolean);

  if (words.length < 2) {
    return [] as Array<{ state: string; city: string }>;
  }

  const partitions: Array<{ state: string; city: string }> = [];

  for (let index = 1; index < words.length; index += 1) {
    partitions.push({
      state: words.slice(0, index).join(' '),
      city: words.slice(index).join(' '),
    });
  }

  return partitions;
}

function getLocationScore(location: Location, query: string) {
  const normalizedQuery = normalizeText(query);
  const normalizedFullLocation = normalizeText(location.full_location || location.name || '');

  if (!normalizedQuery || !normalizedFullLocation) {
    return 0;
  }

  // Exact location name matches must always rank above longer partial matches.
  if (normalizedFullLocation === normalizedQuery) {
    return 10_000;
  }

  const queryWords = normalizedQuery.split(' ').filter(Boolean);
  const locationWords = normalizedFullLocation.split(' ').filter(Boolean);
  let score = 0;

  if (normalizedFullLocation.includes(normalizedQuery)) {
    score += 200;
    if (normalizedFullLocation.startsWith(normalizedQuery)) {
      score += 80;
    }
  }

  const matchedWords = queryWords.filter((word) => normalizedFullLocation.includes(word)).length;
  score += (matchedWords / queryWords.length) * 100;

  const exactWordMatches = queryWords.filter((word) => locationWords.includes(word)).length;
  score += (exactWordMatches / queryWords.length) * 60;

  const partitions = getQueryPartitions(normalizedQuery);
  for (const partition of partitions) {
    const stateMatch = normalizedFullLocation.includes(partition.state);
    const cityMatch = normalizedFullLocation.includes(partition.city);

    if (stateMatch && cityMatch) {
      score += 180;
      score += partition.state.split(' ').length * 20;
      score += partition.city.split(' ').length * 20;
    } else if (stateMatch || cityMatch) {
      score += 40;
    }
  }

  return score;
}

interface LocationAutocompleteInputProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string, locationId?: number) => void;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export default function LocationAutocompleteInput({
  value,
  placeholder,
  onChange,
  onSubmit,
  onKeyDown,
}: LocationAutocompleteInputProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSelectingRef = useRef(false);
  const hasSelectedRef = useRef(false);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: locations = [] } = useLocations();
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      setIsLoading(false);
      return;
    }

    // setSuggestions([]);
    setOpen(false);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const normalized = normalizeText(value);
    if (normalized.length < 3) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    debounceRef.current = setTimeout(() => {
      // Define type priority: lower is higher priority

      // Prioridad para parent_id específicos
      const parentPriorityList = [
        LOCATION_CABA_ID,
        LOCATION_GB_NORTE_ID,
        LOCATION_GB_OESTE_ID,
        LOCATION_GB_SUR_ID,
        LOCATION_COSTA_ATLANTICA_ID,
        LOCATION_GB_INTERIOR_ID
      ];

      const parentPriority = (parentId?: number) => {
        if (parentId == null) return 99;
        const idx = parentPriorityList.indexOf(parentId);
        return idx === -1 ? 99 : idx;
      };

      const typePriority = (type?: string) => {
        if (type === 'state') return 0;
        if (type === 'location') return 1;
        if (type === 'sub_location') return 2;
        return 3;
      };

      const filtered = locations
        .map((location) => ({
          location,
          score: getLocationScore(location, normalized),
        }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => {
          // 1. Prioridad por parent_id
          const parentDiff = parentPriority(a.location.parent_id) - parentPriority(b.location.parent_id);
          if (parentDiff !== 0) return parentDiff;
          // 2. Prioridad por tipo
          const typeDiff = typePriority(a.location.type) - typePriority(b.location.type);
          if (typeDiff !== 0) return typeDiff;
          // 3. Score de similitud
          return b.score - a.score;
        })
        .map(({ location }) => location)
        .slice(0, 10);
      setSuggestions(filtered);
      setOpen(filtered.length > 0);
      requestAnimationFrame(() => setIsLoading(false));
    }, 2000);
  }, [locations, value]);

  const handleSelect = useCallback((location: Location) => {
    const selectedLabel = location.full_location || location.name;
    isSelectingRef.current = true;
    hasSelectedRef.current = true;
    onChange(selectedLabel);
    onSubmit?.(selectedLabel, location.id);
    setSuggestions([]);
    setOpen(false);
    setIsLoading(false);
  }, [onChange, onSubmit]);

  return (
    <div className="location-autocomplete">
      {open && suggestions.length > 0 && (
        <button
          type="button"
          className="location-autocomplete-overlay"
          aria-label="Cerrar sugerencias"
          onMouseDown={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        />
      )}
      <div className="location-autocomplete-input-wrap">
        <InputField2
          type="text"
          placeholder={placeholder}
          icon={isLoading ? (
            <span className="location-autocomplete-loading-icon" aria-hidden="true" />
          ) : (
            <img src="/icons/lupa.svg" alt="" />
          )}
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            hasSelectedRef.current = false;
            onChange(event.target.value);
          }}
          onIconClick={() => { if (hasSelectedRef.current) onSubmit?.(value); }}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (hasSelectedRef.current) onKeyDown?.(e); }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          autoComplete="off"
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul className="location-autocomplete-suggestions" role="listbox">
          {suggestions.map((location) => (
            <li
              key={location.id}
              className="location-autocomplete-suggestion-item"
              role="option"
              onMouseDown={() => handleSelect(location)}
            >
              <span className="suggestion-main">{location.full_location || location.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}