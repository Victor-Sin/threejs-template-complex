import * as THREE from 'three'
import Experience from './Experience.js'
import Rock from "./GlobalScene/Rock";
import Plane from "./GlobalScene/Plane"
import Rondoudou from "./GlobalScene/Rondoudou";
import Plain from "./GlobalScene/Plain";


export default class World
{
    constructor(_options)
    {
        this.experience = new Experience()
        this.config = this.experience.config
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        
        this.resources.on('groupEnd', (_group) =>
        {
            if(_group.name === 'base')
            {
                this.setDummy()
                // this.rock = new Rock();
                // this.plane = new Plane();
                this.light = new THREE.DirectionalLight( 0xffffff, 0.5 );
                this.pLight = new THREE.PointLight( 0xffffff, 10 );
                this.pLight.position.set(2.5,7.5,5.5)
                this.plain = new Plain();
                this.rondoudou = new Rondoudou();
                this.scene.add(this.pLight)
                this.scene.add(this.light)
                // this.setEnv()
            }
        })
    }

    setEnv(){
        this.resources.items.env.mapping = THREE.EquirectangularReflectionMapping
        this.scene.environment = this.resources.items.env
        this.scene.background = this.resources.items.env
    }

    setDummy()
    {
        // this.resources.items.lennaTexture.encoding = THREE.sRGBEncoding

        // const cube = new THREE.Mesh(
        //     new THREE.BoxGeometry(1, 1, 1),
        //     new THREE.MeshBasicMaterial({ map: this.resources.items.lennaTexture })
        // )
        // this.scene.add(cube)
    }

    resize()
    {
    }

    update()
    {
        if(this.plane){
            this.plane.update()
        }
        if(this.rondoudou){
            this.rondoudou.update()
        }
    }

    destroy()
    {
    }
}