export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', (error) => reject(error))
        image.setAttribute('crossOrigin', 'anonymous') // needed to avoid cross-origin issues on CodeSandbox
        image.src = url
    })

export function getRadianAngle(degreeValue: number) {
    return (degreeValue * Math.PI) / 180
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
    const rotRad = getRadianAngle(rotation)

    return {
        width:
            Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
        height:
            Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    }
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export default async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    rotation = 0,
    flip = { horizontal: false, vertical: false },
    maxDimension = 1080, // New: Downscale updates
    quality = 0.7        // New: Quality control
): Promise<Blob | null> {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        return null
    }

    const rotRad = getRadianAngle(rotation)

    // calculate bounding box of the rotated image
    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
        image.width,
        image.height,
        rotation
    )

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth
    canvas.height = bBoxHeight

    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
    ctx.rotate(rotRad)
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
    ctx.translate(-image.width / 2, -image.height / 2)

    // draw rotated image
    ctx.drawImage(image, 0, 0)

    // --- NEW DOWNSCALING LOGIC ---

    // 1. Calculate the final output size based on maxDimension
    let targetWidth = pixelCrop.width
    let targetHeight = pixelCrop.height

    const aspectRatio = targetWidth / targetHeight

    if (targetWidth > maxDimension || targetHeight > maxDimension) {
        if (targetWidth > targetHeight) {
            targetWidth = maxDimension
            targetHeight = Math.round(maxDimension / aspectRatio)
        } else {
            targetHeight = maxDimension
            targetWidth = Math.round(maxDimension * aspectRatio)
        }
    }

    // 2. Create a new canvas for the final resized crop
    const finalCanvas = document.createElement('canvas')
    finalCanvas.width = targetWidth
    finalCanvas.height = targetHeight
    const finalCtx = finalCanvas.getContext('2d')

    if (!finalCtx) {
        return null
    }

    // 3. Draw the cropped portion from the rotated canvas onto the final canvas, scaling it down
    finalCtx.drawImage(
        canvas,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        targetWidth,
        targetHeight
    )

    // 4. Export as Blob with compression
    return new Promise((resolve, reject) => {
        finalCanvas.toBlob(
            (file) => {
                resolve(file)
            },
            'image/jpeg',
            quality // Apply quality compression
        )
    })
}
