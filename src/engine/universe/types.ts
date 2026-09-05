export type UniverseLevel =
    | "ultraCluster"
    | "hyperCluster"
    | "superCluster"
    | "cluster"
    | "galaxy"
    | "solarSystem"
    | "planet"
    | "moon"


export type UniverseNode = {
    seed: number

    level: UniverseLevel

    x: number
    y: number

    radius: number
}