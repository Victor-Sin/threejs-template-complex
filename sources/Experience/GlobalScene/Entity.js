import {Clock} from "three";
import Experience from "../Experience";
import EventEmitter from "../Utils/EventEmitter";

export default class Entity extends EventEmitter{
    constructor() {
        super()
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.renderer = this.experience.renderer.instance
        this.time = this.experience.time
        this.world = this.experience.world
        this.debug = this.experience.debug
        this.camera = this.experience.camera.instance
        this.mouse = this.experience.mouse
        this.environment = this.world.environment;
        this.sizes = this.experience.sizes
    }
}
