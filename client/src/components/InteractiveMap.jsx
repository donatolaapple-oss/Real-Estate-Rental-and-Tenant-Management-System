import StayScoutMap from "./StayScoutMap";

/** Pins + optional sentiment heatmap (alias for StayScout map stack). */
export default function InteractiveMap(props) {
  return <StayScoutMap {...props} />;
}
