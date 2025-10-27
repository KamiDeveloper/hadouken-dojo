import { useState, useEffect, useRef } from 'react'
import ThreeScene from './ThreeScene'

const Art3d = () => {
    return (
        <div id='art-3d-section'>
            {/* Header de la sección */}
            <div className="scene-header">
                <h2>Experiencia y Dedicación</h2>
                <p>Explora nuestra escena competitiva desde todos los ángulos.</p>
            </div>

            {/* Canvas de Three.js - El modelo ya está precargado por useAssetLoader */}
            <ThreeScene />
        </div>
    )
}

export default Art3d