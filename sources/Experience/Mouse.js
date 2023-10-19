import * as THREE from "three";
import Entity from "./GlobalScene/Entity";

export default class Mouse extends Entity{
    static instance = null
    raycast;
    position;
    eventsMouse;
    intersection;
    objectsList;

    constructor() {
        super();
        if(Mouse.instance){
            return Mouse.instance;
        }
        this.position = new THREE.Vector2();
        this.eventsMouse = [];
        this.intersection = null;
        this.objectsList = [];
        this.initRaycast()
        this.initMouseEvent();
        Mouse.instance = this;
    }

    initRaycast() {
        this.raycast = new THREE.Raycaster();
    }

    initMouseEvent(){
        window.removeEventListener("mousemove", this.mouseMoveHandler.bind(this))
       window.addEventListener("mousemove", this.mouseMoveHandler.bind(this))
    }

    mouseMoveHandler(event){
        this.raycastEvent(event)
        this.eventsMouse.forEach(eltFunct => {
            eltFunct(event);
        })
    }


    raycastEvent(event){
        this.position.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.position.y = -(event.clientY / window.innerHeight) * 2 + 1;
        if(this.raycast){
            this.raycast.setFromCamera(this.position, this.camera);
            this.updateIntersections()
        }
    }

    addNewEvent(event){
        this.eventsMouse.push(event);
        this.initMouseEvent()
    }

    addObjectsList(object){
        this.objectsList.push(object);
    }

    updateIntersections(){
        const intersections = this.raycast.intersectObjects(this.objectsList);
        if(intersections.length > 0){
           this.intersection = intersections[0]
        }
        else{
            this.intersection = null;
        }
    }
}