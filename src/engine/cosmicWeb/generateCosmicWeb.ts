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
    COSMIC_CHUNK_SIZE
} from "./chunk"

import {
    valueNoise2D
} from "../noise/valueNoise"

import {
    domainWarp
} from "../noise/domainWarp"

import {
    generateChunkVoids
} from "./generateChunkVoids"

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
    universeSeed: number,
    chunkX: number,
    chunkY: number
): CosmicWeb {

   const random =
    seededRandom(universeSeed)


    

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


  


     
  /*
    ====================================
    SEMILLAS VORONOI DISTRIBUIDAS
    POR TODO EL MUNDO
    ====================================

    En vez de tirar 12 puntos al azar,
    dividimos el universo en celdas.

    Cada celda recibe aproximadamente
    un centro de vacío, con jitter
    pseudoaleatorio.

    Así evitamos que todas las semillas
    se amontonen accidentalmente
    en una sola región.
*/


/*
    ====================================
    VOIDS DEL CHUNK + VECINOS
    ====================================

    Renderizamos solo el chunk central,
    pero el Voronoi conoce también los
    centros de vacío de los 8 chunks
    adyacentes.
*/

const voids: CosmicVoid[] =
    []


for (
    let neighborY = -1;
    neighborY <= 1;
    neighborY++
) {

    for (
        let neighborX = -1;
        neighborX <= 1;
        neighborX++
    ) {

        const neighborVoids =
            generateChunkVoids(
                universeSeed,
                chunkX + neighborX,
                chunkY + neighborY
            )


        voids.push(
            ...neighborVoids
        )
    }
}

const WORLD_WIDTH =
    COSMIC_CHUNK_SIZE

const WORLD_HEIGHT =
    COSMIC_CHUNK_SIZE


const offsetX =
    chunkX *
    COSMIC_CHUNK_SIZE


const offsetY =
    chunkY *
    COSMIC_CHUNK_SIZE



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
        7.5


    /*
        Cuánto debe parecerse la distancia
        hacia los dos vacíos más cercanos.

        Más alto:
            filamentos más finos.

        Más bajo:
            paredes más gruesas.
    */

    const FILAMENT_THRESHOLD =
        0.84


    let ultraClusterIndex =
        0


    for (
        let y =
    offsetY -
    WORLD_HEIGHT / 2;

        y <=
    offsetY +
    WORLD_HEIGHT / 2;
        y += SAMPLE_SPACING
    ) {

        for (
            let x =
    offsetX -
    WORLD_WIDTH / 2;

            x <=
    offsetX +
    WORLD_WIDTH / 2;
            x += SAMPLE_SPACING
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
                    universeSeed,
                    0.0025,
                    45
                )


            const voronoi =
                sampleVoronoi(
                    warped.x,
                    warped.y,
                    voids
                )
                /*
    ====================================
    CAMPO CONTINUO DE DENSIDAD
    ====================================

    Este campo decide qué regiones del
    cosmic web contienen más materia.

    La frecuencia es baja a propósito:
    queremos manchas de densidad grandes,
    no ruido punto por punto.
*/

const densityNoise =
    valueNoise2D(
        sampleX * 0.002,
        sampleY * 0.002,
        universeSeed + 5000
    )


/*
    valueNoise2D devuelve aproximadamente:

        -1 ... 1

    Lo llevamos a:

         0 ... 1
*/

const density =
    (
        densityNoise +
        1
    ) / 2


/*
    Aumentamos el contraste.

    La mayoría de regiones quedan tenues
    y unas pocas se vuelven muy densas.
*/

const concentratedDensity =
    Math.pow(
        density,
        2.5
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

        /*
            Una pequeña densidad base.
        */

        0.03 +

        /*
            El filamento puede estar
            pobre o muy poblado dependiendo
            del campo de densidad.
        */

        normalizedStrength *
        (
            0.12 +
            concentratedDensity *
            0.58
        ) +

        /*
            Las intersecciones siguen siendo
            zonas especialmente importantes.
        */

        nodeBoost *
        (
            0.15 +
            concentratedDensity *
            0.25
        )
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
                    universeSeed,
                    ultraClusterIndex
                )


            /*
                Los puntos más centrales
                del filamento pueden tener
                estructuras ligeramente
                mayores.
            */

      const radius =
    2.5 +

    /*
        Cuanto más densa la región,
        ligeramente mayores pueden ser
        sus estructuras.
    */

    normalizedStrength *
    (
        1.5 +
        concentratedDensity *
        4
    ) +

    /*
        Los nodos Voronoi siguen teniendo
        estructuras especialmente grandes.
    */

    nodeBoost *
    (
        2 +
        concentratedDensity *
        5
    ) +

    random() *
    1.5

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