import {
    hashSeed
} from "../hash/hashSeed"


function smoothstep(
    value: number
): number {

    return (
        value *
        value *
        (
            3 -
            2 * value
        )
    )
}


function lerp(
    a: number,
    b: number,
    t: number
): number {

    return (
        a +
        (
            b - a
        ) *
        t
    )
}


/*
    Devuelve siempre el mismo valor
    para la misma:

        seed + celda X + celda Y

    Resultado:

        -1 ... 1
*/

function randomGridValue(
    seed: number,
    x: number,
    y: number
): number {

    const xSeed =
        hashSeed(
            seed,
            x
        )

    const xySeed =
        hashSeed(
            xSeed,
            y
        )


    /*
        Lo convertimos en un número
        pseudoaleatorio normalizado.
    */

    const normalized =
        (
            xySeed >>> 0
        ) /
        4294967295


    return (
        normalized * 2 -
        1
    )
}


export function valueNoise2D(
    x: number,
    y: number,
    seed: number
): number {

    const x0 =
        Math.floor(x)

    const y0 =
        Math.floor(y)


    const x1 =
        x0 + 1

    const y1 =
        y0 + 1


    const tx =
        x - x0

    const ty =
        y - y0


    /*
        Valor determinista en
        las cuatro esquinas.
    */

    const v00 =
        randomGridValue(
            seed,
            x0,
            y0
        )

    const v10 =
        randomGridValue(
            seed,
            x1,
            y0
        )

    const v01 =
        randomGridValue(
            seed,
            x0,
            y1
        )

    const v11 =
        randomGridValue(
            seed,
            x1,
            y1
        )


    /*
        Suavizamos las coordenadas
        locales antes de interpolar.
    */

    const sx =
        smoothstep(tx)

    const sy =
        smoothstep(ty)


    const top =
        lerp(
            v00,
            v10,
            sx
        )


    const bottom =
        lerp(
            v01,
            v11,
            sx
        )


    return lerp(
        top,
        bottom,
        sy
    )
}