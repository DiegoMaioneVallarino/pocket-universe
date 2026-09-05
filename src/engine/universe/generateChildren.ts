import {
    seededRandom
} from "../hash/seededRandom"

import {
    hashSeed
} from "../hash/hashSeed"

import {
    getNextLevel
} from "./levels"

import type {
    UniverseNode
} from "./types"


const CHILD_COUNT_RANGE = {
    ultraCluster: [8, 16],
    hyperCluster: [12, 16],
    superCluster: [16, 26],
    cluster: [24, 32],
    galaxy: [32, 64],
    solarSystem: [2, 15],
    planet: [0, 12]
} as const


export function generateChildren(
    parent: UniverseNode
): UniverseNode[] {

    const random =
        seededRandom(
            parent.seed
        )


    const nextLevel =
        getNextLevel(
            parent.level
        )


    if (!nextLevel) {
        return []
    }


    const range =
        CHILD_COUNT_RANGE[
            parent.level as keyof typeof CHILD_COUNT_RANGE
        ]


    if (!range) {
        return []
    }


    const min =
        range[0]

    const max =
        range[1]


    const count =
        Math.floor(
            min +
            random() *
            (
                max -
                min +
                1
            )
        )


    const children: UniverseNode[] =
        []


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const childSeed =
            hashSeed(
                parent.seed,
                i
            )


        const angle =
            random() *
            Math.PI *
            2


        const distance =
            4 +
            random() *
            16


        const radius =
            1.5 +
            random() *
            2.5


        const x =
            Math.cos(angle) *
            distance


        const y =
            Math.sin(angle) *
            distance


        children.push({
            seed: childSeed,
            level: nextLevel,
            x,
            y,
            radius
        })
    }


    return children
}