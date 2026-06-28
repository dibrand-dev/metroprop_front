'use client';

import Checkbox from '@/ui/Checkbox/Checkbox';
import InputField2 from '@/ui/InputField2/InputField2';
import { useState } from 'react';

interface LeadsFilterProps {
  allChecked: boolean;
  onCheckAll: (val: boolean) => void;
  onDeleteClick: (delete: boolean) => void;
  setSearch: (val: string | null) => void;
  isDelete?: boolean;
}

export default function LeadsFilter({
  allChecked,
  onCheckAll,
  onDeleteClick,
  setSearch,
  isDelete = false
}: LeadsFilterProps) {
    
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchQuery(val);
        if (val.trim() === '') {
            setSearch(null);
        }
    };
       
    const handleSearch = () => {
        const trimmed = searchQuery.trim();
        if (trimmed) {
          setSearch(trimmed);
        }
    };
    
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearch();
    };

    return (
    <div className="leads-filter">
      <Checkbox
        label=""
        checked={allChecked}
        onChange={onCheckAll}
      />
      {isDelete ? (
        <button
          className=""
          type="button"
          aria-label="Eliminar contacto"
          onClick={() => onDeleteClick(true)}
        >
          <img src="/icons/trash.svg" alt="" />
      </button>
      ): 
      <button
        className=""
        type="button"
        aria-label="Restaurar contacto"
        onClick={() => onDeleteClick(false)}
      >
        <img src="/icons/check.svg" alt="" />
      </button>}
      <InputField2
        placeholder="Email / Teléfono / Nombre"
        value={searchQuery}
        onChange={handleSearchInputChange}
        onKeyDown={handleSearchKeyDown}
        icon={<img src="/icons/search.svg" alt="" width="18" height="18" />}
        iconPosition="right"
        onIconClick={handleSearch}
      />
    </div>
  );
}
