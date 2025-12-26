'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import styles from './RangeSlider.module.css';

interface RangeSliderProps {
  /** Minimum possible value */
  min: number;
  /** Maximum possible value */
  max: number;
  /** Current minimum value (null means no min filter) */
  value: [number | null, number | null];
  /** Step increment */
  step: number;
  /** Unit suffix for display (e.g., 'mm', 'kg') */
  unit?: string;
  /** Decimal places for display */
  decimals?: number;
  /** Whether to format as currency */
  isCurrency?: boolean;
  /** Currency symbol */
  currencySymbol?: string;
  /** Callback when value changes */
  onChange: (value: [number | null, number | null]) => void;
  /** Label for accessibility */
  label: string;
  /** Show count of available products */
  availableCount?: number;
  /** Show count of products with null values */
  nullCount?: number;
  /** Whether to include products with null values */
  includeNull?: boolean;
  /** Callback when includeNull changes */
  onIncludeNullChange?: (include: boolean) => void;
  /** Disable the slider */
  disabled?: boolean;
}

export function RangeSlider({
  min,
  max,
  value,
  step,
  unit = '',
  decimals = 0,
  isCurrency = false,
  currencySymbol = '€',
  onChange,
  label,
  availableCount,
  nullCount,
  includeNull = true,
  onIncludeNullChange,
  disabled = false,
}: RangeSliderProps) {
  // Local state for the slider thumbs during dragging
  const [localMin, setLocalMin] = useState<number>(value[0] ?? min);
  const [localMax, setLocalMax] = useState<number>(value[1] ?? max);
  const [isDragging, setIsDragging] = useState(false);

  // Track if user is actively editing
  const minInputRef = useRef<HTMLInputElement>(null);
  const maxInputRef = useRef<HTMLInputElement>(null);

  // Sync local state with prop changes (when not dragging)
  // NOTE: eslint-disable is intentional here. This pattern is safe because:
  // 1. We use functional setState which prevents unnecessary renders
  // 2. The guard condition (isDragging) prevents updates during user interaction
  // 3. We only update if the value actually changed (prev !== next check)
  // This prevents infinite loops while keeping local state in sync with props
  useEffect(() => {
    if (!isDragging) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocalMin((prev) => {
        const next = value[0] ?? min;
        return prev !== next ? next : prev;
      });
      setLocalMax((prev) => {
        const next = value[1] ?? max;
        return prev !== next ? next : prev;
      });
    }
  }, [value, min, max, isDragging]);

  const formatValue = useCallback(
    (val: number): string => {
      const formatted = val.toFixed(decimals);
      if (isCurrency) {
        return `${currencySymbol}${formatted}`;
      }
      return unit ? `${formatted}${unit}` : formatted;
    },
    [decimals, isCurrency, currencySymbol, unit]
  );

  const handleMinChange = useCallback(
    (newMin: number) => {
      const clampedMin = Math.min(Math.max(newMin, min), localMax);
      setLocalMin(clampedMin);
    },
    [min, localMax]
  );

  const handleMaxChange = useCallback(
    (newMax: number) => {
      const clampedMax = Math.max(Math.min(newMax, max), localMin);
      setLocalMax(clampedMax);
    },
    [max, localMin]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    // Only update parent if values have actually changed from defaults
    const newMinValue = localMin === min ? null : localMin;
    const newMaxValue = localMax === max ? null : localMax;
    onChange([newMinValue, newMaxValue]);
  }, [localMin, localMax, min, max, onChange]);

  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDragging(true);
    handleMinChange(parseFloat(e.target.value));
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsDragging(true);
    handleMaxChange(parseFloat(e.target.value));
  };

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      handleMinChange(val);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      handleMaxChange(val);
    }
  };

  const handleInputBlur = () => {
    handleDragEnd();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDragEnd();
    }
  };

  const handleReset = () => {
    setLocalMin(min);
    setLocalMax(max);
    onChange([null, null]);
  };

  const isActive = value[0] !== null || value[1] !== null;

  // Calculate the percentage positions for the track fill
  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  return (
    <div className={`${styles.container} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {isActive && (
          <button
            className={styles.resetButton}
            onClick={handleReset}
            type="button"
            aria-label={`Reset ${label} filter`}
          >
            Reset
          </button>
        )}
      </div>

      <div className={styles.sliderContainer}>
        <div className={styles.track}>
          <div
            className={styles.trackFill}
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMin}
          onChange={handleMinSliderChange}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          className={`${styles.slider} ${styles.sliderMin}`}
          aria-label={`${label} minimum`}
          disabled={disabled}
        />

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localMax}
          onChange={handleMaxSliderChange}
          onMouseUp={handleDragEnd}
          onTouchEnd={handleDragEnd}
          className={`${styles.slider} ${styles.sliderMax}`}
          aria-label={`${label} maximum`}
          disabled={disabled}
        />
      </div>

      <div className={styles.inputRow}>
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Min</label>
          <input
            ref={minInputRef}
            type="number"
            min={min}
            max={max}
            step={step}
            value={localMin}
            onChange={handleMinInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className={styles.numberInput}
            disabled={disabled}
          />
          {unit && <span className={styles.inputUnit}>{unit}</span>}
        </div>

        <span className={styles.inputSeparator}>–</span>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Max</label>
          <input
            ref={maxInputRef}
            type="number"
            min={min}
            max={max}
            step={step}
            value={localMax}
            onChange={handleMaxInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className={styles.numberInput}
            disabled={disabled}
          />
          {unit && <span className={styles.inputUnit}>{unit}</span>}
        </div>
      </div>

      <div className={styles.valueDisplay}>
        <span>{formatValue(localMin)}</span>
        <span> – </span>
        <span>{formatValue(localMax)}</span>
      </div>

      {availableCount !== undefined && (
        <div className={styles.stats}>
          <span className={styles.statCount}>{availableCount} products</span>
          {nullCount !== undefined && nullCount > 0 && onIncludeNullChange && (
            <label className={styles.nullToggle}>
              <input
                type="checkbox"
                checked={includeNull}
                onChange={(e) => onIncludeNullChange(e.target.checked)}
                disabled={disabled}
              />
              <span>Include {nullCount} unspecified</span>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
