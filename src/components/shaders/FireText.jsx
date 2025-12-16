"use client";
import React, { useMemo } from "react";
import { Shader } from "react-shaders";
import { cn } from "../../utils/classNames";


// --- SHADER GLSL "UNLEASHED V2" (Ancho completo) ---
const fragmentShader = `
precision mediump float;

// --- Funciones de Ruido ---
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float fbm(vec2 p) {
    float f = 0.0;
    f += 0.5000 * snoise(p); p *= 2.02;
    f += 0.2500 * snoise(p); p *= 2.03;
    f += 0.1250 * snoise(p); p *= 2.01;
    f += 0.0625 * snoise(p*2.0); 
    return f;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    
    // 1. CORRECCIÓN DE ASPECT RATIO
    float aspectRatio = iResolution.x / iResolution.y;
    vec2 correctedUV = uv;
    correctedUV.x *= aspectRatio;

    // 2. Movimiento y Escala
    float time = iTime * u_speed;
    vec2 q = vec2(correctedUV.x, correctedUV.y - time * 0.6) * u_scale;
    
    // 3. Generar Ruido
    vec2 r = vec2(fbm(q), fbm(q + vec2(5.2,1.3)));
    float noiseVal = fbm(q + r * u_turbulence);

    // --- CORRECCIÓN AQUÍ: MÁSCARA MÁS ANCHA ---
    
    // 4. Máscara Horizontal (Plateau en lugar de Pirámide)
    float horizontalDist = abs(uv.x - 0.5); 
    
    // CAMBIO CLAVE:
    // Antes: smoothstep(0.0, 0.5, ...) -> Empezaba a desvanecerse desde el centro exacto.
    // Ahora: smoothstep(0.35, 0.5, ...) -> El fuego se mantiene FUERTE hasta el 70% del ancho.
    // Solo se desvanece en el último 15% de cada lado.
    float horizontalMask = 1.0 - smoothstep(0.35, 0.5, horizontalDist);
    
    // Eliminé el pow(..., 2.0) porque eso "adelgazaba" el fuego.

    // 5. Máscara Vertical
    float verticalMask = smoothstep(1.0, 0.1, uv.y); 

    // 6. Combinar
    float intensity = (noiseVal * 1.4) * horizontalMask * verticalMask;
    intensity = clamp(intensity * u_intensity, 0.0, 1.0);

    // 7. Color
    vec3 black = vec3(0.0);
    vec3 red = vec3(0.8, 0.1, 0.0); 
    vec3 orange = vec3(1.0, 0.5, 0.0); 
    vec3 core = vec3(1.0, 1.0, 0.8); 

    vec3 col = black;
    col = mix(col, red, smoothstep(0.0, 0.4, intensity));
    col = mix(col, orange, smoothstep(0.4, 0.8, intensity));
    col = mix(col, core, smoothstep(0.8, 1.0, intensity));
    
    float alpha = smoothstep(0.05, 0.2, intensity);

    fragColor = vec4(col * alpha, alpha); 
}
`;

export const FireText = ({
    children,
    className,
    speed = 0.8,
    intensity = 1.6,
    turbulence = 1.5,
    scale = 4.0,
    ...props
}) => {
    const uniforms = useMemo(() => ({
        u_speed: { type: '1f', value: speed },
        u_intensity: { type: '1f', value: intensity },
        u_turbulence: { type: '1f', value: turbulence },
        u_scale: { type: '1f', value: scale },
    }), [speed, intensity, turbulence, scale]);

    return (
        <div className={cn("relative inline-block py-6 px-2 overflow-visible", className)} {...props}>
            <div className="absolute inset-x-0 -top-4 -bottom-4 z-0 pointer-events-none mix-blend-screen">
                <Shader
                    fs={fragmentShader}
                    uniforms={uniforms}
                    style={{ width: '100%', height: '100%' }}
                    devicePixelRatio={typeof window !== 'undefined' ? window.devicePixelRatio > 1 ? 1.5 : 1 : 1}
                />
            </div>

            <div className="relative z-10 text-white font-bold tracking-wider select-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                {children}
            </div>
        </div>
    );
};

FireText.displayName = "FireText";
export default FireText;