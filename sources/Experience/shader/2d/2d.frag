precision highp float;

uniform sampler2D uImage;
uniform float uTime;
uniform float uSize;
varying vec2 vUv;

#define PI 3.14159

float clampedSine(float x, float y){
    return (sin(x) + 1.)*.5*y;
}

float random(vec2 st){
    return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

float luminence(vec3 rgb){
    return dot(rgb,vec3(.299,.587,.144));
}

float sdBox( in vec2 p, in vec2 b )
{
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}

float sdCircle( vec2 p, float r )
{
    return length(p) - r;
}

//float fmod(vec2 x,vec2 y){
//    return x - y * trunc(x,y);
//}
/**
*
*/


void applyMirror(out vec2 uv){
    uv.x =  1. - uv.x ;
}

void applyVerticalSymmetry(out vec2 uv){
    uv.x = abs(uv.x -.5) +.5;
}

void applyRotation(out vec2 uv,float r){
    uv -= vec2(.5,.5);
    float len = length(uv);
    float angle = atan(uv.y,uv.x);

    uv.x = len * cos(angle + r);
    uv.y =  len * sin(angle + r);

    uv += .5;
}


void applyZoom(out vec2 uv, float z){
    uv -= .5;
    uv *= z;
    uv += .5;
}

void applyFishEye(inout vec2 uv, float z){
    uv -= .5;
    float length =  length(uv);
    uv *= smoothstep(0.,z * .5,1.);
    uv += .5;
}

void applyRepeat(inout vec2 uv, float x, float y){
    uv.x *= x;
    uv.y *= y;
    uv = fract(uv);
}

void applyWave(inout vec2 uv){
    // Nb de fract + uTime
    uv.x += sin(uv.y * 25. + uTime) * 0.05;
}

void applyRows(out vec2 uv){
    uv.x += sin((floor(uv.y*10.)/10.) * 20. + uTime * 50.) * .05;
}

void applyDistord(out vec2 uv,float strength){
    uv -= .5;
    uv.y += abs(uv.x) * strength;
    uv += .5;
}

void applyClamp(out vec2 uv,float lim1,float lim2){
    uv.y = clamp(uv.y,lim1,lim2);
}

void applyPixelisation(out vec2 uv, float s){
    vec2 pix = vec2(s)/vec2(textureSize(uImage,0));
    uv = floor(uv/pix)*pix;
}

void applySpiralRot(out vec2 uv,float strength){
    uv -= vec2(.5,.5);
    float len = length(uv);
    float angle = atan(uv.y,uv.x);
    angle += len * strength;
    uv = vec2(cos(angle), sin(angle)) * length(uv);

    uv += .5;
}

void applyPixelisationRand(out vec2 uv, float p,float s){
//    applyPixelisation(uv,s);
    vec2 pix = vec2(p)/vec2(textureSize(uImage,0));

    uv += vec2(-1. + random(floor(uv/pix)*pix) * 2.) * s ;
}

void applyScan(out vec2 uv){
    uv.x += (random(uv.yy)*2. - 1.) *.05 * smoothstep(.0,1.,sin(uv.y*5. + uTime*5.));
}

void applyGlass(out vec2 uv){
    uv.x += (random(uv.xy)*2. - 1.) *.05 * smoothstep(.0,1.,sin(uv.y*5. + uTime*5.));
}

void applyColorSpliy(inout vec2 uv){
    vec4 col = texture2D(uImage,uv);
    float a = PI * 2. * luminence(col.rgb) + uTime*10.;
    uv += vec2(cos(a),sin(a)) * .05;
}

void applyCRT(out vec2 uv,float s, float dir){
    float crt = sin(abs((uv.y + dir) * 500.));
    uv.x += sign(crt) *s;

}

void applyGrayScale(out vec4 texture){
    texture = vec4(vec3(luminence(texture.rgb)),1.);
}

void applyThreshold(out vec4 texture, float threshold){
    applyGrayScale(texture);
    texture.rgb = vec3(step(texture.rgb, vec3(threshold)));
}

void applyColorThreshold(out vec4 texture, float nbColor){
    texture = ceil(texture*nbColor)/nbColor;
}

void applyRadar(out vec4 texture, out vec2 uv){
    uv -= vec2(.5,.5);
    float len = length(uv);
    len *= 100.;
    len += uTime * 100.;
    len = sin(len);
    len = smoothstep(-1.,-.9,len);
    vec3 color = vec3(1.-len,0,0);
    texture.rgb *= len;
    texture.rgb += color;
    uv += .5;
}

void applyGrid(out vec4 texture,vec2 uv){
    uv *= 100.;
    uv = mod(uv,10.);
    uv = smoothstep(0.,.5,uv);
    float tmp = uv.x * uv.y;
    texture.rgb *= vec3(tmp);
}

//void applySpinRow(out vec4 texture,vec2 uv){
//    texture *= .5+.5* smoothstep(-1,-.9,sin(uv.y*200.+sin(uv.x*40.)*2.));
//}

void applyInvertColors(out vec4 texture,vec2 uv,float radius,vec2 center){
    uv -= .5;
    //Circle
//    float len = length(uv - center);
//    float inObj = 1.- step(radius,len);

    //Box
    float inObj = step(sdBox(uv - center,vec2(radius)),0.);

    vec3 negative = (1. - texture.rgb) * inObj;
    texture.rgb = mix(negative,texture.rgb,1.-inObj);
    uv += .5;
}

void decalageChroma(out vec4 col, vec2 uv,float s, float a){
    vec2 uvR  = vec2(cos(a),sin(a))*s;
    a+=PI;
    vec2 uvG = vec2(cos(a),sin(a))*s;
    a+=PI;
    vec2 uvB= vec2(cos(a),sin(a))*s;
    col.r = texture2D(uImage, uv+uvR).r;
    col.g = texture2D(uImage, uv+uvG).g;
    col.b = texture2D(uImage, uv+uvB).b;
}


void main() {
    vec2 uv = vUv;
//    applyMirror(uv);
//    applyVerticalSymmetry(uv);
//    applyRotation(uv,uTime);
//    applyZoom(uv,1.5);
//    applyFishEye(uv,1.2 + sin(uTime));
//    applyRepeat(uv,4.,4.);
//    applyWave(uv);
//    applyRows(uv);
//    applyDistord(uv,sin(uTime * 2.) );
//    applyClamp(uv,.5 - clampedSine(uTime * 10.,0.5),.5 + clampedSine(uTime*10.,0.5));
//    applyPixelisation(uv,10.);
//    applySpiralRot(uv,sin(uTime * 10.));
//    applyPixelisationRand(uv,2. + clampedSine(uTime + PI,6.),clampedSine(uTime,.2));
//    applyScan(uv);
//    applyGlass(uv);
//    applyCRT(uv,.001 + clampedSine(uTime,0.01),uTime*0.01);
    applyColorSpliy(uv);
    vec4 texture = texture2D(uImage, uv);
//    applyGrayScale(texture);
//    applyThreshold(texture,0.5);
//    applyColorThreshold(texture,4.);
//    applyRadar(texture,uv);
//    applyGrid(texture,uv);
//    applySpinRow(texture,uv);
//    applyInvertColors(texture,uv,0.5,vec2(clampedSine(uTime*10.,0.5)));
    decalageChroma(texture,uv,0.01,sin(uTime));
    gl_FragColor = texture;
}
