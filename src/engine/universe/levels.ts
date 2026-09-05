import type {
    UniverseLevel
} from "./types"


export const LEVEL_ORDER: UniverseLevel[] = [
    "ultraCluster",
    "hyperCluster",
    "superCluster",
    "cluster",
    "galaxy",
    "solarSystem",
    "planet",
    "moon"
]


export function getNextLevel(
    level: UniverseLevel
): UniverseLevel | null {

    const index =
        LEVEL_ORDER.indexOf(level)


    if (
        index === -1 ||
        index === LEVEL_ORDER.length - 1
    ) {
        return null
    }


    return LEVEL_ORDER[
        index + 1
    ]
}