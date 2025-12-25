/**
 * Type definitions for the website
 * 
 * Re-exports the shared types from the pipeline's common module.
 * These match the structure in data/products.json.
 */

export type {
  RackUnits,
  MotherboardFormFactor,
  PSUType,
  DriveSize,
  CoolingType,
  Currency,
  AvailabilityStatus,
  DataSource,
  Dimensions,
  Price,
  DriveBay,
  FanMount,
  RadiatorSupport,
  ExpansionSlot,
  FrontIO,
  GPUSupport,
  CPUCoolerSupport,
  PSUSupport,
  StorageBackplane,
  RackCase,
  FilterableFields,
  SortableFields,
} from '../../pipeline/src/common/types';
