import React from "react";
import { CURRENCIES } from "../constants/currencies";

interface CurrencySelectProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  label?: string;
  showSymbols?: boolean;
}

const CurrencySelect: React.FC<CurrencySelectProps> = ({
  id,
  name,
  value,
  onChange,
  required = false,
  placeholder = "Select Currency",
  className = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500",
  label,
  showSymbols = true,
}) => {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        id={id}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        className={className}
      >
        <option value="">{placeholder}</option>
        {CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} - {currency.name}{" "}
            {showSymbols && `(${currency.symbol})`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CurrencySelect;
