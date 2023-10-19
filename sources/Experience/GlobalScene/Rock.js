import * as THREE from 'three'
import Experience from '../Experience.js'
import Entity from "./Entity";

export default class Rock extends Entity
{
    #material;
    constructor()
    {
        super();

        // Resource
        this.resource = this.resources.items.rock
        this.#material = new THREE.MeshMatcapMaterial(
            {matcap: this.resources.items.matcap}
        )

        this.setModel()
    }

    setModel()
    {
        this.model = this.resource.scene
        this.model.scale.set(.25,.25,.25)
        this.scene.add(this.model)

        this.model.traverse((child) =>
        {
            if(child instanceof THREE.Mesh)
            {
                child.material = this.#material
                child.castShadow = true
            }
        })
    }

    update()
    {
    }
}