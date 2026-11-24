/* Metallic Paint, port liquid-logo do czystego WebGL2. Kształtem jest tylko tekst 0 zł. */
(function(){
  'use strict';

  const section = document.getElementById('cena');
  if (!section) return;
  const paint = section.querySelector('[data-metallic-paint]');
  const canvas = section.querySelector('.cena-canvas');
  if (!paint || !canvas) return;

  const TEXT = '0 zł';
  const PARAMS = matchMedia('(max-width:600px)').matches
    ? {patternScale:2, refraction:.006, edge:.18, patternBlur:.004, liquid:.015, speed:.3}   /* telefon: mniej rozlewania, litera ł czytelna */
    : {patternScale:2, refraction:.006, edge:.05, patternBlur:.005, liquid:.018, speed:.3};      /* ostre litery i czysty chrom jak we wzorze, bez różowych przebarwień */
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const nextTask = () => new Promise(resolve => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => { channel.port1.close(); resolve(); };
    channel.port2.postMessage(0);
  });
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const staticMode = () => reduced.matches || document.documentElement.classList.contains('static');
  const fontFamily = () => getComputedStyle(document.documentElement).getPropertyValue('--font').trim() || 'system-ui, sans-serif';

  /* Shader 1:1 z demo liquid-logo, z parametrami patternScale, refraction,
     edge, patternBlur, liquid i speed. */
  const VERTEX = `#version 300 es
precision mediump float;
in vec2 a_position;
out vec2 vUv;
void main() {
  vUv = .5 * (a_position + 1.);
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
  const FRAGMENT = `#version 300 es
precision mediump float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D u_image_texture;
uniform float u_time;
uniform float u_ratio;
uniform float u_img_ratio;
uniform float u_patternScale;
uniform float u_refraction;
uniform float u_edge;
uniform float u_patternBlur;
uniform float u_liquid;
#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846
vec3 mod289(vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec2 mod289(vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
vec3 permute(vec3 x) { return mod289(((x*34.)+1.)*x); }
float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1., 0.) : vec2(0., 1.);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0., i1.y, 1.)) + i.x + vec3(0., i1.x, 1.));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.);
    m = m*m;
    m = m*m;
    vec3 x = 2. * fract(p * C.www) - 1.;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130. * dot(m, g);
}
vec2 get_img_uv() {
    vec2 img_uv = vUv;
    img_uv -= .5;
    if (u_ratio > u_img_ratio) img_uv.x = img_uv.x * u_ratio / u_img_ratio;
    else img_uv.y = img_uv.y * u_img_ratio / u_ratio;
    img_uv += .5;
    img_uv.y = 1. - img_uv.y;
    return img_uv;
}
vec2 rotate(vec2 uv, float th) {
    return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}
float get_color_channel(float c1, float c2, float stripe_p, vec3 w, float extra_blur, float b) {
    float ch = c2;
    float border = 0.;
    float blur = u_patternBlur + extra_blur;
    ch = mix(ch, c1, smoothstep(.0, blur, stripe_p));
    border = w[0];
    ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));
    b = smoothstep(.2, .8, b);
    border = w[0] + .4 * (1. - b) * w[1];
    ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));
    border = w[0] + .5 * (1. - b) * w[1];
    ch = mix(ch, c2, smoothstep(border - blur, border + blur, stripe_p));
    border = w[0] + w[1];
    ch = mix(ch, c1, smoothstep(border - blur, border + blur, stripe_p));
    float gradient_t = (stripe_p - w[0] - w[1]) / w[2];
    float gradient = mix(c1, c2, smoothstep(0., 1., gradient_t));
    ch = mix(ch, gradient, smoothstep(border - blur, border + blur, stripe_p));
    return ch;
}
float get_img_frame_alpha(vec2 uv, float img_frame_width) {
    float img_frame_alpha = smoothstep(0., img_frame_width, uv.x) * smoothstep(1., 1. - img_frame_width, uv.x);
    img_frame_alpha *= smoothstep(0., img_frame_width, uv.y) * smoothstep(1., 1. - img_frame_width, uv.y);
    return img_frame_alpha;
}
void main() {
    vec2 uv = vUv;
    uv.y = 1. - uv.y;
    uv.x *= u_ratio;
    float diagonal = uv.x - uv.y;
    float t = .001 * u_time;
    vec2 img_uv = get_img_uv();
    vec4 img = texture(u_image_texture, img_uv);
    vec3 color = vec3(0.);
    float opacity = 1.;
    vec3 color1 = vec3(.98, 0.98, 1.);
    vec3 color2 = vec3(.1, .1, .1 + .1 * smoothstep(.7, 1.3, uv.x + uv.y));
    float edge = img.r;
    vec2 grad_uv = uv;
    grad_uv -= .5;
    float dist = length(grad_uv + vec2(0., .2 * diagonal));
    grad_uv = rotate(grad_uv, (.25 - .2 * diagonal) * PI);
    float bulge = pow(1.8 * dist, 1.2);
    bulge = 1. - bulge;
    bulge *= pow(uv.y, .3);
    float cycle_width = u_patternScale;
    float thin_strip_1_ratio = .12 / cycle_width * (1. - .4 * bulge);
    float thin_strip_2_ratio = .07 / cycle_width * (1. + .4 * bulge);
    float wide_strip_ratio = (1. - thin_strip_1_ratio - thin_strip_2_ratio);
    float thin_strip_1_width = cycle_width * thin_strip_1_ratio;
    float thin_strip_2_width = cycle_width * thin_strip_2_ratio;
    opacity = 1. - smoothstep(.9 - .5 * u_edge, 1. - .5 * u_edge, edge);
    opacity *= get_img_frame_alpha(img_uv, .01);
    float noise = snoise(uv - t);
    edge += (1. - edge) * u_liquid * noise;
    float refr = clamp(1. - bulge, 0., 1.);
    float dir = grad_uv.x;
    dir += diagonal;
    dir -= 2. * noise * diagonal * (smoothstep(0., 1., edge) * smoothstep(1., 0., edge));
    bulge *= clamp(pow(uv.y, .1), .3, 1.);
    dir *= (.1 + (1.1 - edge) * bulge);
    dir *= smoothstep(1., .7, edge);
    dir += .18 * (smoothstep(.1, .2, uv.y) * smoothstep(.4, .2, uv.y));
    dir += .03 * (smoothstep(.1, .2, 1. - uv.y) * smoothstep(.4, .2, 1. - uv.y));
    dir *= (.5 + .5 * pow(uv.y, 2.));
    dir *= cycle_width;
    dir -= t;
    float refr_r = refr;
    refr_r += .03 * bulge * noise;
    float refr_b = 1.3 * refr;
    refr_r += 5. * (smoothstep(-.1, .2, uv.y) * smoothstep(.5, .1, uv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(1., .4, bulge));
    refr_r -= diagonal;
    refr_b += (smoothstep(0., .4, uv.y) * smoothstep(.8, .1, uv.y)) * (smoothstep(.4, .6, bulge) * smoothstep(.8, .4, bulge));
    refr_b -= .2 * edge;
    refr_r *= u_refraction;
    refr_b *= u_refraction;
    vec3 w = vec3(thin_strip_1_width, thin_strip_2_width, wide_strip_ratio);
    w[1] -= .02 * smoothstep(.0, 1., edge + bulge);
    float stripe_r = mod(dir + refr_r, 1.);
    float r = get_color_channel(color1.r, color2.r, stripe_r, w, .02 + .03 * u_refraction * bulge, bulge);
    float stripe_g = mod(dir, 1.);
    float g = get_color_channel(color1.g, color2.g, stripe_g, w, .01 / (1. - diagonal), bulge);
    float stripe_b = mod(dir - refr_b, 1.);
    float b = get_color_channel(color1.b, color2.b, stripe_b, w, .01, bulge);
    color = vec3(r, g, b);
    color = mix(vec3(dot(color, vec3(.299, .587, .114))), color, 0.0);      // czysty chrom, tylko lekki ślad tęczy na krawędziach
    color *= opacity;
    fragColor = vec4(color, opacity);
}`;

  function fallbackMetrics(ctx, width, height){
    const size = clamp(Math.min(width * .31, height * .7), 84, 188);
    ctx.font = `900 ${size}px ${fontFamily()}`;
    return {size, x:width/2, y:height/2 + size*.04};
  }
  function fallback(){
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = paint.getBoundingClientRect();
    const ratio = Math.min(Math.max(window.devicePixelRatio || 1, 1), 1.25);
    const width = Math.max(1, rect.width), height = Math.max(1, rect.height);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0); ctx.clearRect(0,0,width,height);
    const m = fallbackMetrics(ctx,width,height);
    const gradient = ctx.createLinearGradient(0,m.y-m.size*.55,0,m.y+m.size*.55);
    gradient.addColorStop(0,'#f7f8fb'); gradient.addColorStop(.28,'#8b9098'); gradient.addColorStop(.5,'#fff'); gradient.addColorStop(.72,'#a6abb4'); gradient.addColorStop(1,'#555b65');
    ctx.save(); ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.shadowColor='rgba(255,255,255,.16)'; ctx.shadowBlur=16; ctx.fillStyle=gradient; ctx.fillText(TEXT,m.x,m.y); ctx.restore(); paint.classList.add('is-static');
  }

  async function buildTextField(live){
    const width = 512, height = 256, source = document.createElement('canvas');
    source.width=width; source.height=height;
    const ctx=source.getContext('2d',{willReadFrequently:true}); if(!ctx)return null;
    const font=`900 200px ${fontFamily()}`; try{await document.fonts?.load(font,TEXT);}catch(error){}
    ctx.fillStyle='#000'; ctx.fillRect(0,0,width,height); ctx.font=font; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle='#fff'; ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.strokeText(TEXT,width/2,height/2+6); ctx.fillText(TEXT,width/2,height/2+6);
    const pixels=ctx.getImageData(0,0,width,height).data, size=width*height, shape=new Uint8Array(size), boundary=new Uint8Array(size);
    for(let i=0;i<size;i++){const p=i*4;shape[i]=(pixels[p]+pixels[p+1]+pixels[p+2]>60&&pixels[p+3]>0)?1:0;}
    const inside=(x,y)=>x>=0&&x<width&&y>=0&&y<height&&shape[y*width+x]===1;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=y*width+x;if(!shape[i])continue;let edge=false;for(let ny=y-1;ny<=y+1&&!edge;ny++)for(let nx=x-1;nx<=x+1&&!edge;nx++)if(!inside(nx,ny))edge=true;if(edge)boundary[i]=1;}
    let u=new Float32Array(size), next=new Float32Array(size), maxVal=0;
    const iterations=300;
    for(let iter=0;iter<iterations;iter++){
      for(let y=0;y<height;y++)for(let x=0;x<width;x++){const i=y*width+x;if(!shape[i]||boundary[i]){next[i]=0;continue;}const left=x>0&&shape[i-1]?u[i-1]:0,right=x+1<width&&shape[i+1]?u[i+1]:0,up=y>0&&shape[i-width]?u[i-width]:0,down=y+1<height&&shape[i+width]?u[i+width]:0;next[i]=(.01+left+right+up+down)/4;}
      const swap=u;u=next;next=swap;
      if(iter%8===7){await nextTask();if(!live())return null;}
    }
    for(let i=0;i<size;i++)if(u[i]>maxVal)maxVal=u[i];
    const output=new Uint8Array(size*4);
    for(let i=0;i<size;i++){const p=i*4;if(!shape[i]){output[p]=255;output[p+1]=255;output[p+2]=255;output[p+3]=255;}else{const gray=255*(1-Math.pow(maxVal?u[i]/maxVal:0,2));output[p]=gray;output[p+1]=gray;output[p+2]=gray;output[p+3]=255;}}
    return {data:output,width,height,aspect:width/height};
  }

  function compile(gl,type,source){const shader=gl.createShader(type);if(!shader)return null;gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);return null;}return shader;}
  function init(){
    if(staticMode()){fallback();return;}
    const gl=canvas.getContext('webgl2',{antialias:true,alpha:true}); if(!gl){fallback();return;}
    const vertex=compile(gl,gl.VERTEX_SHADER,VERTEX), fragment=compile(gl,gl.FRAGMENT_SHADER,FRAGMENT), program=gl.createProgram(); if(!vertex||!fragment||!program){fallback();return;}
    gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS)){fallback();return;}
    const uniforms={};for(let i=0,n=gl.getProgramParameter(program,gl.ACTIVE_UNIFORMS);i<n;i++){const info=gl.getActiveUniform(program,i);if(info)uniforms[info.name]=gl.getUniformLocation(program,info.name);}gl.useProgram(program);
    const vertices=new Float32Array([-1,-1,1,-1,-1,1,1,1]),buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);const pos=gl.getAttribLocation(program,'a_position');gl.enableVertexAttribArray(pos);gl.vertexAttribPointer(pos,2,gl.FLOAT,false,0,0);
    const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);gl.uniform1i(uniforms.u_image_texture,0);
    const state={width:0,height:0,image:null,visible:false,alive:true,raf:0,last:0,time:0};
    function resize(){const rect=paint.getBoundingClientRect(),ratio=Math.min(Math.max(window.devicePixelRatio||1,1),1.25),width=Math.max(1,Math.round(rect.width*ratio)),height=Math.max(1,Math.round(rect.height*ratio));if(width===state.width&&height===state.height)return;state.width=width;state.height=height;canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
    function draw(){if(!state.image){gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);return;}gl.useProgram(program);gl.uniform1f(uniforms.u_time,state.time);gl.uniform1f(uniforms.u_ratio,state.width/state.height);gl.uniform1f(uniforms.u_img_ratio,state.image.aspect);gl.uniform1f(uniforms.u_patternScale,PARAMS.patternScale);gl.uniform1f(uniforms.u_refraction,PARAMS.refraction);gl.uniform1f(uniforms.u_edge,PARAMS.edge);gl.uniform1f(uniforms.u_patternBlur,PARAMS.patternBlur);gl.uniform1f(uniforms.u_liquid,PARAMS.liquid);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
    function frame(now){state.raf=0;if(!state.alive||!state.visible)return;const delta=state.last?now-state.last:16.7;state.last=now;state.time+=delta*PARAMS.speed;draw();state.raf=requestAnimationFrame(frame);}
    function wake(){if(!state.raf&&state.alive&&state.visible&&!staticMode())state.raf=requestAnimationFrame(frame);}
    const resizeObserver=new ResizeObserver(()=>{resize();draw();});resizeObserver.observe(paint);const visibilityObserver=new IntersectionObserver(entries=>{state.visible=entries.some(entry=>entry.isIntersecting);if(state.visible)wake();},{threshold:.01});visibilityObserver.observe(section);canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();state.alive=false;cancelAnimationFrame(state.raf);});resize();
    let active=true;
    buildTextField(()=>active&&state.alive).then(image=>{if(!image)return;gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,image.width,image.height,0,gl.RGBA,gl.UNSIGNED_BYTE,image.data);state.image=image;paint.classList.add('is-webgl');draw();wake();}).catch(()=>{if(active)fallback();});
    window.addEventListener('resize',resize,{passive:true});
  }
  reduced.addEventListener('change',()=>{if(reduced.matches)fallback();else window.location.reload();});
  init();
})();
