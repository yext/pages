import type { MapProps, Coordinate } from "../map/types.js";

export interface LocationMapProps extends MapProps {
  children?: React.ReactChild;
  coordinate: Coordinate;
  linkSameTab?: boolean;
  pinUrl?: string;
  onClick?: (id: string) => void;
  onHover?: (hovered: boolean, id: string) => void;
  onFocus?: (focused: boolean, id: string) => void;
}
