export type CosmicPoint = {
    x: number
    y: number
}


export type CosmicVoid = {
    x: number
    y: number
    radius: number
}


export type CosmicFilament = {
    start: CosmicPoint
    end: CosmicPoint
}


export type UltraClusterRoot = {
    seed: number

    x: number
    y: number

    radius: number
}