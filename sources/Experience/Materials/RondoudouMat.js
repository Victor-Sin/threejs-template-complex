import * as THREE from 'three'
import {MeshBasicMaterial, MeshToonMaterial} from "three";
import glsl from "glslify";
import {diffuseColor} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";

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

        shader.vertexShader = shader.vertexShader.replace('void main() {', [
            'uniform float uTime;',
            'varying vec3 vPos;',
            'float clampedSine(float t){',
            'return (sin(t)+1.)*.5;',
            '}',
            'float random(vec2 st){',
            'return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);',
            '}',
            snoise,
            'void main() {',
        ].join('\n'));

        shader.fragmentShader = shader.fragmentShader.replace('void main() {', [
            'uniform float uTime;',
            'varying vec3 vPos;',
            'float clampedSine(float t){',
            'return (sin(t)+1.)*.5;',
            '}',
            "vec3 pal( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ){",
            "return a + b*cos( 6.28318*(c*t+d) );",
            "}",
            'float random(vec2 st){',
            'return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);',
            '}',
            snoise,
            'void main() {',
        ].join('\n'));

        shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', [
            // ...this.chubby(),
            // ...this.rotation(),
            // ...this.chubbyNoise(),
            // ...this.chubbyRandom(),
            'vPos = transformed;',
            '#include <project_vertex>',
        ].join('\n'));
        // this.shader.uniforms.uTime = {value:0};

        shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', [
            '#include <map_fragment>',
            ...this.rainbow(),
            // ...this.noiseColor()
        ].join('\n'));

        this.userData.shader = shader;
    }

    chubby(){
        return [
            'transformed = transformed + normalize(normal) * clampedSine(uTime);'
        ]
    }

    chubbyNoise(){
        return [
            'transformed = transformed + normalize(normal) *  cnoise(vec4(transformed,uTime)) * .05;'
        ]
    }

    chubbyRandom(){
        return [
            'transformed = transformed + normalize(normal) * random(uv) * .2  * -abs(sin(uTime));'
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

    rainbow(){
        return [
            'vec3 col = pal( vPos.x + uTime, vec3(0.5,0.5,0.5),vec3(0.5,0.5,0.5),vec3(1.0,1.0,1.0),vec3(0.0,0.33,0.67) );',
            'diffuseColor.rgb *= col;',
            'diffuseColor = ceil(diffuseColor*3.)/3.;'
        ]
    }

    noiseColor(){
        return [
            'float nt = cnoise(vec4(vPos * 3., uTime ));',
            'vec3 col2 = pal(nt, vec3(.5, .5, .5), vec3(.5, .5, .5), vec3(1., 1., 1.), vec3(0., 0.10, 0.20));',
            'diffuseColor.rgb = floor(col2 * 3.) / 3.;',
        ]
    }

    updateDisplacedNormals(){
        return [
            'vec4 mPos = modelMatrix * vec4(transformed,1.);',
            'vec3 tPos = mPos.xyz;',
            'vec4 n = modelMatrix * vec4(normal, 1.);',
            'vec3 mNorm = n.xyz;',
            'vec3 displacedPosition = position + normal * displace(tPos);',
            'float offset = 2./120.;',
            'vec3 tangent = orthogonal(normal);',
            'vec3 bitangent = normalize(cross(normal,tangent));',
            'vec3 neighbour1 = tPos + tangent * offset;',
            'vec3 neighbour2 = tPos + bitangent * offset;',
            'float strength = .5;',
            'vec3 displacedNeighbour1 = neighbour1 + normal * displace(neighbour1) * strength;',
            'vec3 displacedNeighbour2 = neighbour2 + normal * displace(neighbour2) * strength;',
            'vec3 displacedBitangent = displacedNeighbour1 - displacedPosition;',
            'vec3 displacedBitangent = displacedNeighbour2 - displacedPosition;',
            'vec3 displacedNormal = normalize(cross(displacedTangent,displacedBitangent));'
        ]
    }

    update()
    {
        if(this.userData && this.userData.shader){
            this.userData.shader.uniforms.uTime.value = this.time.elapsed * 0.001;
        }
    }
}