import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  Fragment,
} from "react";
import { MapContext } from "./map.js";
import { Marker } from "./marker.js";
import type {
  MapContextType,
  ClustererProps,
  PinStoreType,
  ClustererContextType,
  ClusterTemplateProps,
} from "./types";
import type { Map } from "@yext/components-tsx-maps";
import {
  Unit,
  Projection,
  Coordinate,
  GeoBounds,
} from "@yext/components-tsx-geo";

const defaultClusterTemplate = ({ count }: ClusterTemplateProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 22 22"
    >
      <g fill="none" fillRule="evenodd">
        <circle
          fill="red"
          fillRule="nonzero"
          stroke="white"
          cx="11"
          cy="11"
          r="11"
        />
        <text
          fill="white"
          fontFamily="Arial-BoldMT,Arial"
          fontSize="12"
          fontWeight="bold"
        >
          <tspan x="50%" y="15" textAnchor="middle">
            {count}
          </tspan>
        </text>
      </g>
    </svg>
  );
};

export const ClustererContext = createContext<ClustererContextType | null>(
  null
);

export function useClusterContext() {
  const ctx = useContext(ClustererContext);

  if (!ctx) {
    throw new Error(
      "Attempted to call useClustererContext() outside of <Clusterer>."
    );
  }

  return ctx;
}

export const Clusterer = ({
  clusterRadius = 50,
  children,
  ClusterTemplate = defaultClusterTemplate,
}: ClustererProps) => {
  const { map } = useContext(MapContext) as MapContextType;
  const [pinStore, setPinStore] = useState<PinStoreType[]>([]);
  const [clusters, setClusters] = useState<PinStoreType[][]>();
  const [clusterIds, setClusterIds] = useState<string[]>([]);
  const [clustersToRender, setClustersToRender] = useState<JSX.Element[]>([]);

  // Recalculate the clusters when either the pin store is updated or the map zoom level changes.
  useEffect(() => {
    setClusters(_generateClusters(pinStore, map, clusterRadius));
  }, [pinStore, map.getZoom()]);

  // When the clusters are updated, remove any pins in a cluster of more than 1 pin from the map.
  // Then calculate the geo bounds of all the pins in the cluster and render a single marker
  // at their center.
  useEffect(() => {
    setClustersToRender(() => []);
    setClusterIds(() => []);

    if (clusters?.length === 0) {
      return;
    }

    clusters?.forEach((cluster) => {
      // Add pins back to map if they are in a cluster of 1.
      if (cluster.length === 1) {
        cluster[0].pin.setMap(map);
        return;
      }
      if (cluster.length > 1) {
        // Calculate center of all markers in the cluster.
        // Used to set the coordinate of the marker as well as generate a unique id.
        const clusterCenter: Coordinate = GeoBounds.fit(
          cluster.map((p) => p.pin.getCoordinate())
        ).getCenter(Projection.MERCATOR);
        const id = `cluster-{${clusterCenter._lat},${clusterCenter._lon}}`;

        // Remove all markers in cluster from the map and instead
        // render one cluster marker at their geo center.
        cluster.forEach((p) => p.pin.setMap(null));

        // Add cluster id to clusterIds in order to track what markers are actually clusters.
        setClusterIds((clusterIds) => [...clusterIds, id]);

        // Add cluster marker to array to be rendered.
        setClustersToRender((clustersToRender) => [
          ...clustersToRender,
          <Marker
            coordinate={clusterCenter}
            id={id}
            key={id}
            onClick={() =>
              map.fitCoordinates(
                cluster.map((p) => p.pin.getCoordinate()),
                true,
                Infinity
              )
            }
          >
            <ClusterTemplate count={cluster.length} />
          </Marker>,
        ]);
      }
    });
  }, [clusters]);

  return (
    <ClustererContext.Provider
      value={{
        clusters: clusters ?? [],
        clusterIds,
        setPinStore,
      }}
    >
      <>
        {clustersToRender.map((cluster, idx) => (
          <Fragment key={idx}>{cluster}</Fragment>
        ))}
        {children}
      </>
    </ClustererContext.Provider>
  );
};

/**
 * Generate groups of pins such that each pin is in exactly one cluster, each pin is at most
 * @param clusterRadius pixels from the center of the cluster, and each cluster
 * has at least one pin.
 */
const _generateClusters = (
  pins: PinStoreType[],
  map: Map,
  clusterRadius: number
) => {
  const clusterRadiusRadians =
    (clusterRadius * Math.PI) / 2 ** (map.getZoom() + 7);
  const pinsInRadius = pins.map((_, index) => [index]);
  const pinClusters = [];

  // Calculate the distances of each pin to each other pin
  pins.forEach((pin, index) => {
    for (let otherIndex = index; otherIndex < pins.length; otherIndex++) {
      if (otherIndex != index) {
        const distance = new Coordinate(pin.pin.getCoordinate()).distanceTo(
          new Coordinate(pins[otherIndex].pin.getCoordinate()),
          Unit.RADIAN,
          Projection.MERCATOR
        );

        if (distance <= clusterRadiusRadians) {
          pinsInRadius[index].push(otherIndex);
          pinsInRadius[otherIndex].push(index);
        }
      }
    }
  });

  // Loop until there are no pins left to cluster
  let maxCount = 1;
  while (maxCount) {
    maxCount = 0;
    let chosenIndex;

    // Find the pin with the most other pins within radius
    pinsInRadius.forEach((pinGroup, index) => {
      if (pinGroup.length > maxCount) {
        maxCount = pinGroup.length;
        chosenIndex = index;
      }
    });

    // If there are no more pins within clustering radius of another pin, break
    if (!maxCount) {
      break;
    }

    // Add pins to a new cluster, and remove them from pinsInRadius
    const chosenPins = pinsInRadius[chosenIndex ?? 0];
    const cluster = [];

    pinsInRadius[chosenIndex ?? 0] = [];

    for (const index of chosenPins) {
      const pinGroup = pinsInRadius[index];

      // Add the pin to this cluster and remove it from consideration for other clusters
      cluster.push(pins[index]);
      pinsInRadius[index] = [];
      pinGroup.forEach((otherIndex) =>
        pinsInRadius[otherIndex].splice(
          pinsInRadius[otherIndex].indexOf(index),
          1
        )
      );
    }

    pinClusters.push(cluster);
  }

  return pinClusters;
};
