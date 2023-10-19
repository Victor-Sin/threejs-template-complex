import * as THREE from 'three'
import {MeshBasicMaterial, MeshToonMaterial} from "three";
import glsl from "glslify";

export default class RondoudouMat extends MeshToonMaterial
{
    constructor(params,time)
    {
        super(params);
        this.time = time;
    }



    onBeforeCompile(shader,renderer)
    {
        super.onBeforeCompile(shader,renderer);

        shader.uniforms.uTime = {value : 0};

        const snoise = glsl`#pragma glslify: cnoise4 = require(glsl-noise/classic/4d)`;
        console.log(snoise)

        shader.vertexShader = shader.vertexShader.replace('void main() {', [
            'uniform float uTime;',
            'float clampedSine(float t){',
            'return (sin(t)+1.)*.5;',
            '}',
            'float random(vec2 st){',
            'return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);',
            '}',
            snoise,
            'void main() {',
        ].join('\n'));

        shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', [
            // ...this.chubby(),
            ...this.rotation(),
            ...this.chubbyNoise(),
            '#include <project_vertex>',
        ].join('\n'));
        // this.shader.uniforms.uTime = {value:0};

        this.userData.shader = shader;
    }

    chubby(){
        return [
            'transformed = transformed + normalize(normal) * clampedSine(uTime);'
        ]
    }

    chubbyNoise(){
        return [
            'transformed = transformed + normalize(normal) * cnoise4(vec4(transformed,uTime));'
        ]
    }

    rotation(){
        return [
            'float angle = atan(transformed.z,transformed.x);',
            'float len = length(transformed.xz);',
            'angle += smoothstep(-5.,5.,transformed.y) * sin(uTime) * 1.;',
            'transformed.xz = vec2(cos(angle),sin(angle)) * len;',
        ]
    }

    update()
    {
        if(this.userData && this.userData.shader){
            this.userData.shader.uniforms.uTime.value = this.time.elapsed * 0.001;
        }
    }
}