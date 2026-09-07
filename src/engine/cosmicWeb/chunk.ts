import {
    hashSeed
} from "../hash/hashSeed"


export const COSMIC_CHUNK_SIZE =
    1200


export function getCosmicChunkSeed(
    universeSeed: number,
    chunkX: number,
    chunkY: number
): number {

    const xSeed =
        hashSeed(
            universeSeed,
            chunkX
        )

    return hashSeed(
        xSeed,
        chunkY
    )
}