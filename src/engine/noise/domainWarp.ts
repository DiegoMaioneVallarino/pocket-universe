import {
    valueNoise2D
} from "./valueNoise"


export type WarpedPoint = {
    x: number
    y: number
}


export function domainWarp(
    x: number,
    y: number,
    seed: number,
    frequency: number,
    strength: number
): WarpedPoint {

    /*
        Dos campos diferentes.

        Uno mueve X.
        Otro mueve Y.

        Usamos offsets distintos para
        evitar que ambos campos sean
        exactamente iguales.
    */

    const warpX =
        valueNoise2D(
            x * frequency,
            y * frequency,
            seed
        )


    const warpY =
        valueNoise2D(
            x * frequency + 137.2,
            y * frequency - 91.7,
            seed + 1009
        )


    return {

        x:
            x +
            warpX *
            strength,

        y:
            y +
            warpY *
            strength
    }
}