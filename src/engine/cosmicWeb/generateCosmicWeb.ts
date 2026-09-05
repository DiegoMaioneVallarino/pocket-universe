import {
    seededRandom
} from "../hash/seededRandom"

import {
    hashSeed
} from "../hash/hashSeed"

import type {
    CosmicVoid,
    CosmicFilament,
    UltraClusterRoot
} from "./types"


export type CosmicWeb = {
    voids: CosmicVoid[]
    filaments: CosmicFilament[]
    ultraClusters: UltraClusterRoot[]
}


export function generateCosmicWeb(
    seed: number
): CosmicWeb {

    const random =
        seededRandom(seed)


    const voids: CosmicVoid[] =
        []

    const filaments: CosmicFilament[] =
        []

    const ultraClusters: UltraClusterRoot[] =
        []


    /*
        Primero generamos grandes vacíos.

        Por ahora 9.
        Luego esto también será espacialmente infinito.
    */

    const VOID_COUNT =
        9


    for (
        let i = 0;
        i < VOID_COUNT;
        i++
    ) {

        const x =
            (
                random() -
                0.5
            ) *
            900


        const y =
            (
                random() -
                0.5
            ) *
            600


        const radius =
            70 +
            random() *
            100


        voids.push({
            x,
            y,
            radius
        })

    }


    /*
        Ahora conectamos cada vacío
        con sus vecinos más cercanos.

        Es una primera aproximación
        al cosmic web.
    */

    for (
        let i = 0;
        i < voids.length;
        i++
    ) {

        const current =
            voids[i]


        const neighbors =
            voids
                .map(
                    (
                        other,
                        index
                    ) => {

                        if (
                            index === i
                        ) {
                            return null
                        }


                        const dx =
                            other.x -
                            current.x

                        const dy =
                            other.y -
                            current.y


                        const distance =
                            Math.sqrt(
                                dx * dx +
                                dy * dy
                            )


                        return {
                            void: other,
                            distance
                        }

                    }
                )
                .filter(
                    (
                        item
                    ): item is {
                        void: CosmicVoid
                        distance: number
                    } =>
                        item !== null
                )
                .sort(
                    (a, b) =>
                        a.distance -
                        b.distance
                )


        /*
            Conectamos con 2 vecinos.

            Eso tiende a generar una red
            sin convertirla en telaraña total.
        */

        const selected =
            neighbors.slice(
                0,
                2
            )


        for (
            const neighbor
            of selected
        ) {

            filaments.push({
                start: {
                    x: current.x,
                    y: current.y
                },

                end: {
                    x: neighbor.void.x,
                    y: neighbor.void.y
                }
            })

        }

    }


    /*
        Ahora poblamos los filamentos
        con ultraClusters.
    */

    let ultraClusterIndex =
        0


    for (
        const filament
        of filaments
    ) {

        const count =
            5 +
            Math.floor(
                random() *
                8
            )


        for (
            let i = 0;
            i < count;
            i++
        ) {

            /*
                t indica qué tan lejos estamos
                sobre el segmento.
            */

            const t =
                (
                    i +
                    1
                ) /
                (
                    count +
                    1
                )


            /*
                Interpolación lineal
                sobre el hilo.
            */

            let x =
                filament.start.x +
                (
                    filament.end.x -
                    filament.start.x
                ) *
                t


            let y =
                filament.start.y +
                (
                    filament.end.y -
                    filament.start.y
                ) *
                t


            /*
                Pequeña perturbación transversal
                para que no parezca un collar
                perfectamente recto.
            */

            x +=
                (
                    random() -
                    0.5
                ) *
                20


            y +=
                (
                    random() -
                    0.5
                ) *
                20


            const rootSeed =
                hashSeed(
                    seed,
                    ultraClusterIndex
                )


            ultraClusters.push({
                seed: rootSeed,
                x,
                y,

                radius:
                    8 +
                    random() *
                    8
            })


            ultraClusterIndex++

        }

    }


    return {
        voids,
        filaments,
        ultraClusters
    }
}