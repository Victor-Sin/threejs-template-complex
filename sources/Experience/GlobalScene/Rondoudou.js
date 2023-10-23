import * as THREE from 'three'
import Experience from '../Experience.js'
import Entity from "./Entity";
import RondoudouMat from "../Materials/RondoudouMat";

export default class Rondoudou extends Entity
{
    #material;
    constructor()
    {
        super();

        // Resource
        this.resource = this.resources.items.rondoudou
        this.tex = this.resources.items.rondoudouTexture;
        this.tex.flipY = false;
        this.tex.wrapS = THREE.RepeatWrapping;
        this.tex.wrapT = THREE.RepeatWrapping;
        this.material= new RondoudouMat({
            map: this.tex
        },this.time);
        this.setModel()
        const coord = this.world.plain.extractCoord(0,0).toArray();
        this.model.position.set(...coord)
    }

    setModel()
    {
        this.model = this.resource.scene
        this.scene.add(this.model)

        this.model.position.set(0,-.5,0);

        this.model.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.material = this.material
                child.castShadow = true
            }
        })
    }

    update()
    {
        if(this.material){
            this.material.update()
        }
    }
}