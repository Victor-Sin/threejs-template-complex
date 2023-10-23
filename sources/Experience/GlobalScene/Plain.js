import * as THREE from 'three'
import Entity from "./Entity";
import {Float32BufferAttribute} from "three";

export default class Plain extends Entity
{
    params
    vertices  = [];
    indices = [];
    uvs = [];
    normals = [];

    constructor(params = {
        width: 10,
        depth: 10,
        widthSegments: 100,
        depthSegments: 100,
    })
    {
        super();
        this.params = params;
        this.width_half = this.params.width /2
        this.depth_half = this.params.depth /2
        this.gridX = Math.floor( this.params.widthSegments );
        this.gridZ = Math.floor( this.params.depthSegments );
        this.gridX1 = this.gridX +1;
        this.gridZ1 =  this.gridZ +1;
        this.segment_width = this.params.width / this.gridX;
        this.segment_depth = this.params.depth / this.gridZ;
        this.setModel()
    }

    calculateX(column) {
        column += .5
        return Math.sin(column*.1)+ Math.sin(column*.1 * 4)/4  + Math.sin(column*.1 * 16)/16  // Par exemple, une plane de -1 à 1 sur l'axe X
    }

    calculateZ(row) {
        row += 0.1
        return  Math.cos(row*.01)   + Math.cos(row*.01 * 4)/4  + Math.cos(row*.01 * 16)/16
    }

    setVertex(){
        for ( let iz = 0; iz < this.gridZ1; iz ++ ) {

            const z = iz * this.segment_depth - this.depth_half;

            for ( let ix = 0; ix < this.gridX1; ix ++ ) {

                const x = ix * this.segment_width - this.width_half;

                this.vertices.push( x, this.calculateX(x) + this.calculateZ(-z), -z );
                console.log(x, this.calculateX(x) + this.calculateZ(-z), -z)


                this.uvs.push( ix / this.gridX );
                this.uvs.push( 1 - ( iz / this.gridZ ) );

            }

        }

        for ( let iz = 0; iz < this.gridZ; iz ++ ) {

            for ( let ix = 0; ix < this.gridX; ix ++ ) {

                const a = ix + this.gridX1 * iz;
                const b = ix + this.gridX1 * ( iz + 1 );
                const c = ( ix + 1 ) + this.gridX1 * ( iz + 1 );
                const d = ( ix + 1 ) + this.gridX1 * iz;

                this.indices.push( a, b, d );
                this.indices.push( b, c, d );

            }

        }

        this.setNormals()

    }

    setModel()
    {
        this.setVertex()
        this.geometry = new THREE.BufferGeometry();
        this.geometry.setIndex(this.indices)
        this.geometry.setAttribute( 'position', new Float32BufferAttribute( this.vertices, 3 ) );
        this.geometry.setAttribute( 'normal', new Float32BufferAttribute( this.normals, 3 ) );
        this.geometry.setAttribute( 'uv', new Float32BufferAttribute( this.uvs, 2 ) );

        this.material = new THREE.MeshToonMaterial({
            color: "#FF0000",
            side: THREE.DoubleSide
        });
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.scene.add(this.mesh);
    }


    setNormals() {
        const numVertices = this.vertices.length / 3;
        const numTriangles = this.indices.length / 3;

        // Initialisation des normales à zéro
        const vertexNormals = new Array(numVertices).fill([0, 0, 0]);

        // Calcul des normales des triangles et accumulation dans les normales des sommets
        for (let i = 0; i < numTriangles; i++) {
            const ai = this.indices[i * 3];
            const bi = this.indices[i * 3 + 1];
            const ci = this.indices[i * 3 + 2];

            const a = [this.vertices[ai * 3], this.vertices[ai * 3 + 1], this.vertices[ai * 3 + 2]];
            const b = [this.vertices[bi * 3], this.vertices[bi * 3 + 1], this.vertices[bi * 3 + 2]];
            const c = [this.vertices[ci * 3], this.vertices[ci * 3 + 1], this.vertices[ci * 3 + 2]];

            const normal = this.computeNormal(a, b, c);

            vertexNormals[ai] = this.add(vertexNormals[ai], normal);
            vertexNormals[bi] = this.add(vertexNormals[bi], normal);
            vertexNormals[ci] = this.add(vertexNormals[ci], normal);
        }

        // Normalisation des normales des sommets
        for (let i = 0; i < numVertices; i++) {
            vertexNormals[i] = this.normalize(vertexNormals[i]);
        }

        this.normals = [].concat(...vertexNormals); // Conversion en tableau à plat
    }

    computeNormal(a, b, c) {
        const ab = this.subtract(b, a);
        const ac = this.subtract(c, a);
        return this.normalize(this.cross(ab, ac));
    }

    add(a, b) {
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
    }

    subtract(a, b) {
        return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    }

// Fonction utilitaire pour normaliser un vecteur
    normalize(v) {
        const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        return [v[0] / length, v[1] / length, v[2] / length];
    }

    cross(a, b) {
        const x = a[1] * b[2] - a[2] * b[1];
        const y = a[2] * b[0] - a[0] * b[2];
        const z = a[0] * b[1] - a[1] * b[0];
        return [x, y, z];
    }

    extractCoord(width,depth){
        return new THREE.Vector3(width, this.calculateX(width) + this.calculateZ(-depth), -depth );
    }

    update()
    {
        // if(this.material){
        //     this.material.update()
        // }
    }
}