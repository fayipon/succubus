'use client';
import {useEffect,useRef} from 'react';
import * as THREE from 'three';

/** Image-space deformation keeps the sign, face and room stationary. */
export default function AnimatedMain({paused}:{paused:boolean}) {
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const element=host.current;if(!element)return;
    let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:false});}catch{return;}
    let disposed=false;
    const textures:THREE.Texture[]=[];
    const scene=new THREE.Scene();
    const camera=new THREE.OrthographicCamera(-1,1,1,-1,0,2);camera.position.z=1;
    const geometry=new THREE.PlaneGeometry(2,2);
    const material=new THREE.ShaderMaterial({uniforms:{original:{value:null},closed:{value:null},time:{value:0},blink:{value:0}},vertexShader:'varying vec2 uvImage; void main(){uvImage=uv;gl_Position=vec4(position,1.0);}',fragmentShader:`
      precision highp float;
      varying vec2 uvImage;
      uniform sampler2D original,closed;
      uniform float time,blink;
      float ellipse(vec2 p,vec2 center,vec2 radius){return 1.0-smoothstep(0.65,1.0,length((p-center)/radius));}
      void main(){
        vec2 p=vec2(uvImage.x,1.0-uvImage.y);
        float hair=ellipse(p,vec2(.300,.570),vec2(.040,.160));
        hair+=ellipse(p,vec2(.100,.440),vec2(.073,.095));
        hair+=ellipse(p,vec2(.261,.273),vec2(.046,.057))*.35;
        vec2 sampleUv=uvImage;
        sampleUv.x+=sin(time*.95+p.y*19.0)*.00165*min(hair,1.0);
        sampleUv.y+=sin(time*.73+p.y*14.0)*.00050*min(hair,1.0);
        float eyes=max(ellipse(p,vec2(.211,.366),vec2(.027,.032)),ellipse(p,vec2(.263,.427),vec2(.025,.035)));
        gl_FragColor=mix(texture2D(original,sampleUv),texture2D(closed,sampleUv),eyes*blink);
      }`});
    scene.add(new THREE.Mesh(geometry,material));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));
    element.appendChild(renderer.domElement);
    const resize=new ResizeObserver(()=>{renderer.setSize(element.clientWidth,element.clientHeight);});resize.observe(element);
    const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
    let loaded=false;
    const frame=(now:number)=>{
      if(!loaded)return;
      const staticFrame=paused||reduce.matches;
      material.uniforms.time.value=staticFrame?0:now/1000;
      const phase=(now/1000)%5.3;
      material.uniforms.blink.value=staticFrame?0:phase<.24?Math.sin(Math.PI*phase/.24):0;
      renderer.render(scene,camera);
    };
    const sync=()=>{renderer.setAnimationLoop(null);frame(performance.now());if(loaded&&!paused&&!reduce.matches&&!document.hidden)renderer.setAnimationLoop(frame);};
    const loader=new THREE.TextureLoader();
    const load=async(url:string)=>{const texture=await loader.loadAsync(url);if(disposed){texture.dispose();return null;}textures.push(texture);return texture;};
    Promise.all([load('./images/main.png'),load('./images/main-blink.png')]).then(([original,closed])=>{if(disposed||!original||!closed)return;material.uniforms.original.value=original;material.uniforms.closed.value=closed;loaded=true;sync();}).catch(()=>{/* The original HTML image remains visible when WebGL/assets fail. */});
    reduce.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
    return()=>{disposed=true;renderer.setAnimationLoop(null);resize.disconnect();reduce.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);geometry.dispose();material.dispose();textures.forEach(texture=>texture.dispose());renderer.dispose();renderer.domElement.remove();};
  },[paused]);
  return <div className="animated-art" ref={host} aria-hidden="true"/>;
}

