import {
    useEffect,
    useRef
} from "react"

import {
    generateChildren
} from "../../engine/universe/generateChildren"

import type {
    UniverseNode
} from "../../engine/universe/types"

import {
    generateCosmicWeb
} from "../../engine/cosmicWeb/generateCosmicWeb"

import {
    COSMIC_CHUNK_SIZE,
    getCosmicChunkSeed
} from "../../engine/cosmicWeb/chunk"

type Camera = {
    x: number
    y: number
    zoom: number
}




export default function UniverseCanvas() {

    const canvasRef =
        useRef<HTMLCanvasElement | null>(null)

    const cameraRef =
        useRef<Camera>({
            x: 0,
            y: 0,
            zoom: 1
        })

    const draggingRef =
        useRef(false)

    const lastMouseRef =
        useRef({
            x: 0,
            y: 0
        })


    useEffect(() => {

        const canvasElement =
            canvasRef.current

        if (!canvasElement) return

        const canvas: HTMLCanvasElement =
            canvasElement


        const context =
            canvas.getContext("2d")

        if (!context) return

        const ctx: CanvasRenderingContext2D =
            context


            const childrenCache =
    new Map<
        string,
        UniverseNode[]
    >()
const cosmicChunkCache =
    new Map<
        string,
        ReturnType<typeof generateCosmicWeb>
    >()
        const UNIVERSE_SEED =
            42


       
        function resizeCanvas() {

            canvas.width =
                window.innerWidth

            canvas.height =
                window.innerHeight

        }


        function smoothstep(
            edge0: number,
            edge1: number,
            value: number
        ) {

            const t =
                Math.max(
                    0,
                    Math.min(
                        1,
                        (
                            value -
                            edge0
                        ) /
                        (
                            edge1 -
                            edge0
                        )
                    )
                )

            return (
                t *
                t *
                (
                    3 -
                    2 * t
                )
            )
        }

    function getCachedChildren(
    node: UniverseNode
): UniverseNode[] {

    const key =
        `${node.level}:${node.seed}`

    const cached =
        childrenCache.get(key)

    if (cached) {
        return cached
    }

    const children =
        generateChildren(node)

    childrenCache.set(
        key,
        children
    )

    return children
}
function getCosmicChunk(
    chunkX: number,
    chunkY: number
) {

    const key =
        `${chunkX}:${chunkY}`


    const cached =
        cosmicChunkCache.get(
            key
        )

    if (cached) {
        return cached
    }


    const cosmicWeb =
    generateCosmicWeb(
        UNIVERSE_SEED,
        chunkX,
        chunkY
    )

    cosmicChunkCache.set(
        key,
        cosmicWeb
    )


    return cosmicWeb
}

function getSectorLuminosity(
    camera: Camera
): number {

    /*
        Chunk en el que se encuentra
        actualmente el centro de cámara.
    */

    const centerChunkX =
        Math.floor(
            camera.x /
            COSMIC_CHUNK_SIZE
        )

    const centerChunkY =
        Math.floor(
            camera.y /
            COSMIC_CHUNK_SIZE
        )


    let luminosity =
        0

    let samples =
        0


    /*
        Consultamos el chunk central
        y sus 8 vecinos.

        Así la luminosidad no cambia
        bruscamente al cruzar una frontera.
    */

    for (
        let chunkOffsetY = -1;
        chunkOffsetY <= 1;
        chunkOffsetY++
    ) {

        for (
            let chunkOffsetX = -1;
            chunkOffsetX <= 1;
            chunkOffsetX++
        ) {

            const cosmicWeb =
                getCosmicChunk(
                    centerChunkX +
                        chunkOffsetX,

                    centerChunkY +
                        chunkOffsetY
                )


            for (
                const root
                of cosmicWeb.ultraClusters
            ) {

                const dx =
                    root.x -
                    camera.x

                const dy =
                    root.y -
                    camera.y


                const distance =
                    Math.sqrt(
                        dx * dx +
                        dy * dy
                    )


                /*
                    Radio dentro del cual una
                    estructura contribuye al
                    brillo ambiental.
                */

                const influenceRadius =
                    500


                if (
                    distance >
                    influenceRadius
                ) {
                    continue
                }


                /*
                    1 en el centro.

                    0 cuando llegamos al
                    límite de influencia.
                */

                const distanceFactor =
                    1 -
                    distance /
                    influenceRadius


                /*
                    Estructuras grandes aportan
                    ligeramente más luz.
                */

                const massFactor =
                    Math.min(
                        1.5,
                        root.radius /
                        8
                    )


                luminosity +=
                    distanceFactor *
                    distanceFactor *
                    massFactor


                samples++
            }
        }
    }


    if (
        samples === 0
    ) {
        return 0
    }


    /*
        Normalizamos aproximadamente.

        Queremos un valor manejable:
        0 ... 1
    */

    const normalized =
        luminosity /
        18


    return Math.max(
        0,
        Math.min(
            1,
            normalized
        )
    )
}


function isNodeVisible(
    x: number,
    y: number,
    radius: number,
    camera: Camera
): boolean {

    const screenX =
        (
            x -
            camera.x
        ) *
        camera.zoom +
        canvas.width / 2


    const screenY =
        (
            y -
            camera.y
        ) *
        camera.zoom +
        canvas.height / 2


    const screenRadius =
        radius *
        camera.zoom


    /*
        Margen adicional para que los
        objetos no aparezcan de golpe
        justo en el borde.
    */

    const margin =
    100


    return (
        screenX + screenRadius + margin >= 0 &&
        screenX - screenRadius - margin <= canvas.width &&
        screenY + screenRadius + margin >= 0 &&
        screenY - screenRadius - margin <= canvas.height
    )
}
  function drawUniverseNode(
    node: UniverseNode,
    depth: number,
    cameraZoom: number
){

            /*
                Cada nivel necesita más zoom
                que el anterior para abrirse.
            */

                const {
                    seed,
                    x,
                    y,
                    radius
                } = node

                const camera =
                    cameraRef.current
               

                if (
                    !isNodeVisible(
                        x,
                        y,
                        radius,
                        camera
                    )
                ) {
                    return
                }
                                
                /*
                Tamaño aparente REAL del nodo
                en la pantalla.
            */
                const NODE_RADIUS_SCALE =
    0.45

            const screenRadius =
                radius *
                cameraZoom


            /*
                Nivel de detalle basado en
                tamaño visual, NO en depth.
            */

            const REFERENCE_RADIUS_PIXELS =
                20


            const localZoom =
                screenRadius /
                REFERENCE_RADIUS_PIXELS
            /*
                Kinestética base.
            */

            

            const childFadeStart =
                0.6

            const childFadeEnd =
                2.0
          const MIN_PARENT_ALPHA =
    0.04


/*
    =====================================
    RADIO BASE DEL FATHER
    =====================================

    ESTE radio también será la referencia
    espacial de los hijos.

    Nunca lo modificamos con la expansión
    tardía.
*/

const baseParentRadius =
    radius *
    NODE_RADIUS_SCALE


/*
    Radio actual del father en píxeles
    de pantalla.
*/

const visibleParentRadiusPixels =
    baseParentRadius *
    cameraZoom


/*
    =====================================
    FADE DEL FATHER
    =====================================
*/

const PARENT_FADE_START_PIXELS =
    0.1

const PARENT_FADE_END_PIXELS =
    8


const parentFade =
    smoothstep(
        PARENT_FADE_START_PIXELS,
        PARENT_FADE_END_PIXELS,
        visibleParentRadiusPixels
    )


const parentAlpha =
    1 -
    parentFade *
    (
        1 -
        MIN_PARENT_ALPHA
    )


/*
    =====================================
    EXPANSIÓN TARDÍA DEL FATHER
    =====================================

    Empieza cuando ya cruzamos
    PARENT_FADE_END_PIXELS.

    Esto SOLO modifica cómo dibujamos
    el father.

    NO modifica la posición de los hijos.
*/

const FATHER_EXPANSION_END_PIXELS =
    25


const fatherExpansionProgress =
    smoothstep(
        PARENT_FADE_END_PIXELS,
        FATHER_EXPANSION_END_PIXELS,
        visibleParentRadiusPixels
    )


const FATHER_MAX_EXPANSION =
    1.5


const expandedParentRadius =
    baseParentRadius *
    (
        1 +
        fatherExpansionProgress *
        (
            FATHER_MAX_EXPANSION -
            1
        )
    )


/*
    =====================================
    SEGUNDO CÍRCULO
    =====================================
*/

const SECOND_CIRCLE_SCALE =
    1.25


const secondCircleRadius =
    expandedParentRadius *
    SECOND_CIRCLE_SCALE


/*
    30% menos alpha que el principal.
*/

const secondCircleAlpha =
    parentAlpha *
    0.70 *
    fatherExpansionProgress


/*
    =====================================
    DIBUJAMOS CÍRCULO EXTERIOR
    =====================================
*/

if (
    secondCircleAlpha >
    0.001
) {

    ctx.globalAlpha =
        secondCircleAlpha

    ctx.fillStyle =
        "white"

    ctx.beginPath()

    ctx.arc(
        x,
        y,
        secondCircleRadius,
        0,
        Math.PI * 2
    )

    ctx.fill()
}


/*
    =====================================
    DIBUJAMOS FATHER PRINCIPAL
    =====================================
*/

if (
    parentAlpha >
    0.001
) {

    ctx.globalAlpha =
        parentAlpha

    ctx.fillStyle =
        "white"

    ctx.beginPath()

    ctx.arc(
        x,
        y,
        expandedParentRadius,
        0,
        Math.PI * 2
    )

    ctx.fill()
}
            


            /*
                Profundidad máxima temporal.

                depth 0 = padre
                depth 1 = hijos
                depth 2 = nietos
                depth 3 = bisnietos
            */

            


            /*
                Si estamos demasiado lejos,
                no generamos descendientes.
            */

            if (
                localZoom <
                childFadeStart
            ) {

                return

            }

            
            /*
                Generamos hijos deterministas
                usando la seed de este nodo.
            */

            const children =
            getCachedChildren(
                node
            )

            /*
            A mayor cantidad de hijos,
            más pequeños y transparentes
            los representamos.

            Esto evita que niveles como
            galaxy / solarSystem formen
            nubes blancas sólidas.
        */

        const childCount =
            children.length


        const densityScale =
            Math.max(
                0.25,
                Math.min(
                    1,
                    20 / childCount
                )
            )


        const densityAlpha =
            Math.max(
                0.18,
                Math.min(
                    1,
                    24 / childCount
                )
            )

            
            /*
                generateChildren trabaja
                aproximadamente en una escala
                cuyo padre original tenía radio 20.
            */



           const sizeScale =
    baseParentRadius /
    20


            for (
                const child
                of children
            ) {

                const distance =
                    Math.sqrt(
                        child.x *
                        child.x +
                        child.y *
                        child.y
                    )


                const delay =
                    Math.min(
                        distance /
                        25,
                        1
                    )


                /*
                    Cada hijo aparece ligeramente
                    distinto según su distancia.
                */

                const childAlpha =
                    smoothstep(
                        childFadeStart +
                            delay *
                            0.15,

                        childFadeEnd +
                            delay *
                            0.35,

                        localZoom
                    )


                /*
                    Expansión desde el centro.
                */

                /*
    La expansión espacial empieza temprano,
    pero desacelera conforme los hijos llegan
    a su posición definitiva.

    Esto evita el efecto "palomita".
*/

            const expansionProgress =
                smoothstep(
                    0.25,
                    1.8,
                    localZoom
                )


            const expansion =
                Math.sqrt(
                    expansionProgress
                )


                const childX =
                    x +
                    child.x *
                    sizeScale *
                    expansion


                const childY =
                    y +
                    child.y *
                    sizeScale *
                    expansion


                const childRadius =
    child.radius *
    sizeScale *
    densityScale


                /*
                    Guardamos el estado para que
                    el alpha del hijo no contamine
                    al resto.
                */

               ctx.save()


/*
    El hijo nace con su luz interna
    desde el primer instante.
*/

/*
    Nivel al que pertenece este hijo.
*/
const childNode: UniverseNode = {
    ...child,

    x:
        childX,

    y:
        childY,

    radius:
        childRadius
}
const childScreenRadius =
    childRadius *
    cameraZoom


const nextLocalZoom =
    childScreenRadius /
    REFERENCE_RADIUS_PIXELS

/*
    El núcleo existe desde que nace el hijo,
    PERO desaparece cuando ese hijo comienza
    a descomponerse.
*/

const coreFade =
    1 -
    smoothstep(
        0.5,
        1.1,
        nextLocalZoom
    )


const MIN_CORE_RADIUS_PIXELS =
    0.75


const coreRadius =
    Math.max(
        childRadius * 0.22,
        MIN_CORE_RADIUS_PIXELS /
        cameraZoom
    )

/*
    Luz auxiliar del hijo.
*/

ctx.globalAlpha =
    childAlpha *
    coreFade *
    densityAlpha

ctx.fillStyle =
    "white"

ctx.beginPath()

ctx.arc(
    childX,
    childY,
    coreRadius,
    0,
    Math.PI * 2
)

ctx.fill()

ctx.restore()

/*
    Ahora dibujamos el nodo REAL.

    Este sí es el que eventualmente
    se descompone en sus propios hijos.
*/
ctx.save()

ctx.globalAlpha *=
    childAlpha


drawUniverseNode(
    childNode,
    depth + 1,
    cameraZoom
)


ctx.restore()

            }

        }


        function render() {

            const camera =
                cameraRef.current
            const sectorLuminosity =
            getSectorLuminosity(
                camera
            )


        const backgroundZoomFade =
            1 -
            smoothstep(
                0.15,
                500,
                camera.zoom
            )


        const backgroundLuminosity =
            sectorLuminosity *
            backgroundZoomFade

            /*
                Limpiamos canvas.
            */

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            )


            /*
                Fondo.
            */

            /*
    Fondo mínimo.

    Nunca usamos negro absoluto.
*/

const minimumBackground =
    3


/*
    Cuánto puede iluminar una
    región extremadamente densa.
*/

const maximumExtraBrightness =
    22


const backgroundValue =
    Math.floor(
        minimumBackground +
        backgroundLuminosity *
        maximumExtraBrightness
    )


ctx.fillStyle =
    `rgb(
        ${backgroundValue},
        ${backgroundValue},
        ${backgroundValue + 2}
    )`
            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            )


            ctx.save()


            /*
                Centro de pantalla.
            */

            ctx.translate(
                canvas.width /
                2,

                canvas.height /
                2
            )


            /*
                Zoom.
            */

            ctx.scale(
                camera.zoom,
                camera.zoom
            )


            /*
                Cámara.
            */

            ctx.translate(
                -camera.x,
                -camera.y
            )


            /*
                TODO EL UNIVERSO
                comienza aquí.
            */

/*
    =============================
    COSMIC WEB
    =============================
*/






/*
    =============================
    ULTRACLUSTERS
    =============================
*/


ctx.globalAlpha =
    1


/*
    Tamaño del mundo visible actualmente.

    Cuanto más alejamos la cámara,
    mayor región del universo cabe
    dentro de la pantalla.
*/

const halfWorldWidth =
    canvas.width /
    (
        2 *
        camera.zoom
    )


const halfWorldHeight =
    canvas.height /
    (
        2 *
        camera.zoom
    )


/*
    Calculamos qué chunks intersectan
    la región visible.

    El +1 / -1 genera un pequeño margen
    para evitar popping en los bordes.
*/

const minChunkX =
    Math.floor(
        (
            camera.x -
            halfWorldWidth
        ) /
        COSMIC_CHUNK_SIZE
    ) -
    1


const maxChunkX =
    Math.floor(
        (
            camera.x +
            halfWorldWidth
        ) /
        COSMIC_CHUNK_SIZE
    ) +
    1


const minChunkY =
    Math.floor(
        (
            camera.y -
            halfWorldHeight
        ) /
        COSMIC_CHUNK_SIZE
    ) -
    1


const maxChunkY =
    Math.floor(
        (
            camera.y +
            halfWorldHeight
        ) /
        COSMIC_CHUNK_SIZE
    ) +
    1


/*
    Recorremos SOLAMENTE los chunks
    que pueden aparecer en pantalla.
*/

for (
    let chunkY =
        minChunkY;

    chunkY <=
        maxChunkY;

    chunkY++
) {

    for (
        let chunkX =
            minChunkX;

        chunkX <=
            maxChunkX;

        chunkX++
    ) {

        const cosmicWeb =
            getCosmicChunk(
                chunkX,
                chunkY
            )


        /*
            Cada chunk contiene sus propios
            ultraclusters deterministas.
        */

        for (
            const root
            of cosmicWeb.ultraClusters
        ) {
           

            drawUniverseNode(
                {
                    seed:
                        root.seed,

                    level:
                        "ultraCluster",

                    x:
                        root.x,

                    y:
                        root.y,

                    radius:
                        root.radius
                },

                0,

                camera.zoom
            )
        }
    }
}


ctx.globalAlpha =
    1

            ctx.restore()


            requestAnimationFrame(
                render
            )

        }


        function handleMouseDown(
            event: MouseEvent
        ) {

            draggingRef.current =
                true

            lastMouseRef.current = {
                x: event.clientX,
                y: event.clientY
            }

        }


        function handleMouseMove(
            event: MouseEvent
        ) {

            if (
                !draggingRef.current
            ) return


            const camera =
                cameraRef.current


            const dx =
                event.clientX -
                lastMouseRef.current.x

            const dy =
                event.clientY -
                lastMouseRef.current.y


            camera.x -=
                dx /
                camera.zoom

            camera.y -=
                dy /
                camera.zoom


            lastMouseRef.current = {
                x: event.clientX,
                y: event.clientY
            }

        }


        function handleMouseUp() {

            draggingRef.current =
                false

        }


        function handleWheel(
            event: WheelEvent
        ) {

            event.preventDefault()


            const camera =
                cameraRef.current


            /*
                Mouse respecto al centro.
            */

            const mouseX =
                event.clientX -
                canvas.width /
                2

            const mouseY =
                event.clientY -
                canvas.height /
                2


            /*
                Coordenada del universo
                debajo del mouse ANTES
                del zoom.
            */

            const worldX =
                camera.x +
                mouseX /
                camera.zoom

            const worldY =
                camera.y +
                mouseY /
                camera.zoom


            const zoomFactor =
                event.deltaY <
                0
                    ? 1.1
                    : 0.9


            camera.zoom *=
                zoomFactor
console.log(
    "ZOOM:",
    camera.zoom
)

            /*
                Permitimos un poco más de zoom
                para poder alcanzar los niveles
                recursivos.
            */

            camera.zoom =
                Math.max(
                    0.15,
                    Math.min(
                        camera.zoom,
                         10_000_000
                    )
                )


            /*
                Mantenemos exactamente
                el punto bajo el mouse.
            */

            camera.x =
                worldX -
                mouseX /
                camera.zoom

            camera.y =
                worldY -
                mouseY /
                camera.zoom

        }


        resizeCanvas()


        window.addEventListener(
            "resize",
            resizeCanvas
        )


        canvas.addEventListener(
            "mousedown",
            handleMouseDown
        )


        window.addEventListener(
            "mousemove",
            handleMouseMove
        )


        window.addEventListener(
            "mouseup",
            handleMouseUp
        )


        canvas.addEventListener(
            "wheel",
            handleWheel,
            {
                passive: false
            }
        )


        const animationId =
            requestAnimationFrame(
                render
            )


        return () => {

            cancelAnimationFrame(
                animationId
            )


            window.removeEventListener(
                "resize",
                resizeCanvas
            )


            canvas.removeEventListener(
                "mousedown",
                handleMouseDown
            )


            window.removeEventListener(
                "mousemove",
                handleMouseMove
            )


            window.removeEventListener(
                "mouseup",
                handleMouseUp
            )


            canvas.removeEventListener(
                "wheel",
                handleWheel
            )

        }

    }, [])


    return (
        <canvas
            ref={canvasRef}
            style={{
                display: "block",
                width: "100vw",
                height: "100vh",
                cursor: "grab"
            }}
        />
    )

}