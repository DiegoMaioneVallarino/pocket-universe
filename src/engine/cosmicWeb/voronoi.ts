import type {
    CosmicVoid
} from "./types"


export type VoronoiSample = {

    nearestDistance: number
    secondNearestDistance: number
    thirdNearestDistance: number

    nearestIndex: number
    secondNearestIndex: number
    thirdNearestIndex: number

    filamentStrength: number
    nodeStrength: number
}


export function sampleVoronoi(
    x: number,
    y: number,
    voids: CosmicVoid[]
): VoronoiSample {

    let nearestDistance =
        Infinity

    let secondNearestDistance =
        Infinity

    let thirdNearestDistance =
        Infinity


    let nearestIndex =
        -1

    let secondNearestIndex =
        -1

    let thirdNearestIndex =
        -1


    for (
        let i = 0;
        i < voids.length;
        i++
    ) {

        const cosmicVoid =
            voids[i]


        const dx =
            x -
            cosmicVoid.x

        const dy =
            y -
            cosmicVoid.y


        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            )


        /*
            Nuevo primer lugar.
        */

        if (
            distance <
            nearestDistance
        ) {

            thirdNearestDistance =
                secondNearestDistance

            thirdNearestIndex =
                secondNearestIndex


            secondNearestDistance =
                nearestDistance

            secondNearestIndex =
                nearestIndex


            nearestDistance =
                distance

            nearestIndex =
                i

            continue
        }


        /*
            Nuevo segundo lugar.
        */

        if (
            distance <
            secondNearestDistance
        ) {

            thirdNearestDistance =
                secondNearestDistance

            thirdNearestIndex =
                secondNearestIndex


            secondNearestDistance =
                distance

            secondNearestIndex =
                i

            continue
        }


        /*
            Nuevo tercer lugar.
        */

        if (
            distance <
            thirdNearestDistance
        ) {

            thirdNearestDistance =
                distance

            thirdNearestIndex =
                i
        }
    }


    /*
        ==============================
        FUERZA DE FILAMENTO
        ==============================

        d1 ≈ d2
    */

    const filamentDenominator =
        nearestDistance +
        secondNearestDistance


    const filamentDifference =
        Math.abs(
            nearestDistance -
            secondNearestDistance
        )


    const filamentStrength =
        filamentDenominator > 0
            ? 1 -
                filamentDifference /
                filamentDenominator
            : 1


    /*
        ==============================
        FUERZA DE NODO
        ==============================

        Queremos detectar:

            d1 ≈ d2 ≈ d3

        Medimos qué tan separado está
        el primero del tercero.
    */

    const nodeDenominator =
        nearestDistance +
        thirdNearestDistance


    const nodeDifference =
        Math.abs(
            nearestDistance -
            thirdNearestDistance
        )


    const nodeStrength =
        nodeDenominator > 0
            ? 1 -
                nodeDifference /
                nodeDenominator
            : 1


    return {
        nearestDistance,
        secondNearestDistance,
        thirdNearestDistance,

        nearestIndex,
        secondNearestIndex,
        thirdNearestIndex,

        filamentStrength,
        nodeStrength
    }
}