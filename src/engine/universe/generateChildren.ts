import {
    seededRandom
} from "../hash/seededRandom"

import {
    hashSeed
} from "../hash/hashSeed"

export type UniverseChild = {
    seed: number

    x: number
    y: number
    radius: number
}


export function generateChildren(
    seed: number,
    count: number
): UniverseChild[] {

    const random =
        seededRandom(seed)

    const children: UniverseChild[] = []


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const angle =
            random() *
            Math.PI *
            2


        const distance =
            4 +
            random() *
            16


        const radius =
            2 +
            random() *
            3


        const x =
            Math.cos(angle) *
            distance

        const y =
            Math.sin(angle) *
            distance

        const childSeed =
    hashSeed(
        seed,
        i
    )

        children.push({
    seed: childSeed,
    x,
    y,
    radius
})

    }


    return children

}