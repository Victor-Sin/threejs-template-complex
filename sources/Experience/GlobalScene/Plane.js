import * as THREE from 'three'
import Entity from "./Entity";
import vertex from '../shader/2d/2d.vert'
import fragment from '../shader/2d/2d.frag'
export default class Plane extends Entity
{
    #material;
    constructor()
    {
        super();

        // Resource
        this.setModel()
    }

    setModel()
    {
       this.geometry = new THREE.PlaneGeometry(2.5,2.5,100);
        console.log(this.resources.items.myImg)
       this.materialShader = new THREE.ShaderMaterial( {
        uniforms: {
            uTime: { value: this.time.elapsed },
            uImage:{ value: this.resources.items.myImg},
            uSize: {value: new THREE.Vector2(window.innerWidth, window.innerHeight)}
        },
        vertexShader: vertex,
        fragmentShader: fragment,
       });

       this.mesh = new THREE.Mesh( this.geometry, this.materialShader);

       this.scene.add(this.mesh)

    }

    update()
    {
        if(this.mesh){
            this.mesh.lookAt(this.camera.position)
            this.mesh.material.uniforms.uTime.value = this.time.elapsed*0.0001
        }
    }
}