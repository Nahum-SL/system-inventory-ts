// COMPONENT
export {
  AreaOptions,
  PersonOptions,
  PositionOptions,
} from "./components/options";
// HOOKS
export {
  catalogKeys,
  useAreas,
  usePeople,
  usePositions,
} from "./hooks/use-catalog-queries";
// TYPES
export type { Area, Person, Position } from "./types";
// VIEWS
export { default as NamedCatalogPage } from "./views/NamedCatalogPage";
export { default as PositionsPage } from "./views/PositionsPage";
export { default as PeoplePage } from "./views/PeoplePage";