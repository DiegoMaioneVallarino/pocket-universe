import {
    seededRandom
} from "../hash/seededRandom"

import {
    getCosmicChunkSeed,
    COSMIC_CHUNK_SIZE
} from "./chunk"

import type {
    CosmicVoid
} from "./types"


const VOID_CELL_SIZE =
    260


export function generateChunkVoids(
    universeSeed: number,
    chunkX: number,
    chunkY: number
): CosmicVoid[] {

    const chunkSeed =
        getCosmicChunkSeed(
            universeSeed,
            chunkX,
            chunkY
        )

    const random =
        seededRandom(
            chunkSeed
        )


    const voids: CosmicVoid[] =
        []


    const columns =
        Math.ceil(
            COSMIC_CHUNK_SIZE /
            VOID_CELL_SIZE
        )


    const rows =
        Math.ceil(
            COSMIC_CHUNK_SIZE /
            VOID_CELL_SIZE
        )


    const chunkCenterX =
        chunkX *
        COSMIC_CHUNK_SIZE


    const chunkCenterY =
        chunkY *
        COSMIC_CHUNK_SIZE


    for (
        let row = 0;
        row < rows;
        row++
    ) {

        for (
            let column = 0;
            column < columns;
            column++
        ) {

            const baseX =
                chunkCenterX -
                COSMIC_CHUNK_SIZE / 2 +
                (
                    column +
                    0.5
                ) *
                VOID_CELL_SIZE


            const baseY =
                chunkCenterY -
                COSMIC_CHUNK_SIZE / 2 +
                (
                    row +
                    0.5
                ) *
                VOID_CELL_SIZE


            const jitterX =
                (
                    random() -
                    0.5
                ) *
                VOID_CELL_SIZE *
                0.75


            const jitterY =
                (
                    random() -
                    0.5
                ) *
                VOID_CELL_SIZE *
                0.75


            const x =
                baseX +
                jitterX


            const y =
                baseY +
                jitterY


            const radius =
                60 +
                random() *
                100


            voids.push({
                x,
                y,
                radius
            })
        }
    }


    return voids
}