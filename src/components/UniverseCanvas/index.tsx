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

        const UNIVERSE_SEED =
            42


        const cosmicWeb =
            generateCosmicWeb(
                UNIVERSE_SEED
            )


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

            const parentFadeStart =
                0.5

            const parentFadeEnd =
                1.1

            const childFadeStart =
                0.8

            const childFadeEnd =
                2.0


            const parentAlpha =
                1 -
                smoothstep(
                    parentFadeStart,
                    parentFadeEnd,
                    localZoom
                )


            /*
                Contracción del padre.
            */

            const parentShrink =
                smoothstep(
                    parentFadeStart,
                    1.4,
                    localZoom
                )


            const parentRadius =
                radius *
                (
                    1 -
                    parentShrink *
                    0.75
                )


            /*
                Dibujamos el nodo actual.
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
                    parentRadius,
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
                radius /
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

                const expansion =
                    smoothstep(
                        childFadeStart,
                        childFadeEnd,
                        localZoom
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


/*
    Ahora dibujamos el nodo REAL.

    Este sí es el que eventualmente
    se descompone en sus propios hijos.
*/

drawUniverseNode(
    {
        ...child,
        x: childX,
        y: childY,
        radius: childRadius
    },
    depth + 1,
    cameraZoom
)
ctx.restore()

            }

        }


        function render() {

            const camera =
                cameraRef.current


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

            ctx.fillStyle =
                "#050505"

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


            /*
                Permitimos un poco más de zoom
                para poder alcanzar los niveles
                recursivos.
            */

            camera.zoom =
                Math.max(
                    0.05,
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