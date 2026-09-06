import {
    seededRandom
} from "../hash/seededRandom"

import {
    hashSeed
} from "../hash/hashSeed"

import {
    sampleVoronoi
} from "./voronoi"

import type {
    CosmicVoid,
    CosmicFilament,
    UltraClusterRoot
} from "./types"

import {
    domainWarp
} from "../noise/domainWarp"

export type CosmicWeb = {
    voids: CosmicVoid[]

    /*
        Los conservamos temporalmente
        para visualizar la geometría anterior.

        Más adelante podremos eliminarlos.
    */

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
        ====================================
        1. CENTROS DE VACÍOS COSMOLÓGICOS
        ====================================

        Estos puntos NO representan materia.

        Representan aproximadamente los
        centros de grandes regiones vacías.
    */


    const VOID_COUNT =
        12


    const WORLD_WIDTH =
        1000

    const WORLD_HEIGHT =
        700


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
            WORLD_WIDTH


        const y =
            (
                random() -
                0.5
            ) *
            WORLD_HEIGHT


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
        ====================================
        2. FILAMENTOS VISUALES TEMPORALES
        ====================================

        Por ahora mantenemos las conexiones
        anteriores para comparar visualmente
        el sistema viejo con el nuevo.

        Después desaparecerán.
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
        ====================================
        3. CAMPO VORONOI
        ====================================

        Ya NO vamos a colocar ultraclusters
        recorriendo las líneas anteriores.

        Vamos a tomar muestras del espacio.

        Cada posición pregunta:

            "¿Estoy cerca de una frontera
             entre dos vacíos?"

        Si la respuesta es sí:

            puede existir materia aquí.
    */


    const SAMPLE_SPACING =
        18


    /*
        Cuánto debe parecerse la distancia
        hacia los dos vacíos más cercanos.

        Más alto:
            filamentos más finos.

        Más bajo:
            paredes más gruesas.
    */

    const FILAMENT_THRESHOLD =
        0.94


    let ultraClusterIndex =
        0


    for (
        let y =
            -WORLD_HEIGHT / 2;

        y <=
            WORLD_HEIGHT / 2;

        y +=
            SAMPLE_SPACING
    ) {

        for (
            let x =
                -WORLD_WIDTH / 2;

            x <=
                WORLD_WIDTH / 2;

            x +=
                SAMPLE_SPACING
        ) {

            /*
                Pequeño jitter determinista.

                Evita que la materia revele
                descaradamente la cuadrícula
                de muestreo.
            */

            const sampleX =
                x +
                (
                    random() -
                    0.5
                ) *
                SAMPLE_SPACING *
                0.8


            const sampleY =
                y +
                (
                    random() -
                    0.5
                ) *
                SAMPLE_SPACING *
                0.8


            const warped =
                domainWarp(
                    x,
                    y,
                    seed,
                    0.004,
                    45
                )


            const voronoi =
                sampleVoronoi(
                    warped.x,
                    warped.y,
                    voids
                )


            /*
                Si no estamos suficientemente
                cerca de una frontera:

                esto pertenece al vacío.
            */

            if (
                voronoi.filamentStrength <
                FILAMENT_THRESHOLD
            ) {

                continue
            }


            /*
                Incluso dentro del filamento
                no queremos llenar TODOS
                los samples.

                Queremos densidad irregular.
            */

            const normalizedStrength =
                (
                    voronoi.filamentStrength -
                    FILAMENT_THRESHOLD
                ) /
                (
                    1 -
                    FILAMENT_THRESHOLD
                )

                const nodeStrength =
                voronoi.nodeStrength


            /*
                Cerca de una intersección de tres
                regiones Voronoi queremos mucha
                más densidad de materia.
            */

            const nodeBoost =
                Math.pow(
                    nodeStrength,
                    8
                )


            /*
                Cuanto más cerca estemos del
                centro matemático del filamento,
                mayor probabilidad de materia.
            */

            const spawnProbability =
            Math.min(
                0.95,

                0.12 +
                normalizedStrength *
                0.38 +
                nodeBoost *
                0.45
            )

            if (
                random() >
                spawnProbability
            ) {

                continue
            }


            /*
                Seed independiente del
                ultracluster.

                Sigue siendo completamente
                determinista.
            */

            const rootSeed =
                hashSeed(
                    seed,
                    ultraClusterIndex
                )


            /*
                Los puntos más centrales
                del filamento pueden tener
                estructuras ligeramente
                mayores.
            */

            const radius =
    4 +
    normalizedStrength *
    4 +
    nodeBoost *
    8 +
    random() *
    2

            ultraClusters.push({
                seed:
                    rootSeed,

                x:
                    sampleX,

                y:
                    sampleY,

                radius
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