export function hashSeed(
    parentSeed: number,
    index: number
): number {

    let x =
        parentSeed ^
        Math.imul(
            index + 1,
            0x9E3779B1
        )

    x ^= x >>> 16

    x = Math.imul(
        x,
        0x85EBCA6B
    )

    x ^= x >>> 13

    x = Math.imul(
        x,
        0xC2B2AE35
    )

    x ^= x >>> 16

    return x >>> 0
}