import type {
    UniverseLevel
} from "./types"


function randomInt(
    random: () => number,
    min: number,
    max: number
): number {

    return Math.floor(
        min +
        random() *
        (
            max -
            min +
            1
        )
    )
}


export function getChildCount(
    level: UniverseLevel,
    random: () => number
): number {

    switch (level) {

        case "ultraCluster":
            return randomInt(
                random,
                16,
                32
            )

        case "hyperCluster":
            return randomInt(
                random,
                16,
                32
            )

        case "superCluster":
            return randomInt(
                random,
                16,
                32
            )

        case "cluster":
            return randomInt(
                random,
                32,
                64
            )

        case "galaxy":
            return randomInt(
                random,
                60,
                120
            )

        case "solarSystem":
            return randomInt(
                random,
                2,
                15
            )

        case "planet":
            return randomInt(
                random,
                0,
                12
            )

        case "moon":
            return 0
    }
}