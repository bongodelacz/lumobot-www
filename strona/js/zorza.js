/* Zorza (aurora) pod stopką: przeniesiony shader reactbits Aurora (szum simplex, 3 kolory, amplitude, blend),
   odwrócony w pionie, biało-niebieski. Liczy tylko, gdy widać (--reveal > 0). Lider. */
(function(){
  'use strict';
  const box = document.querySelector('.dl-aurora');
  const root = document.documentElement;
  if(!box || root.classList.contains('static') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const canvas = box.querySelector('canvas');
  const gl = canvas.getContext('webgl2', {premultipliedAlpha: true, alpha: true, antialias: true});
  if(!gl) return;
  const VS = `#version 300 es
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }`;
  const FS = `#version 300 es
precision highp float;
uniform float uTime; uniform float uAmplitude; uniform vec3 uColorStops[3]; uniform vec2 uResolution; uniform float uBlend;
out vec4 fragColor;
vec3 permute(vec3 x){ return mod(((x * 34.0) + 1.0) * x, 289.0); }
float snoise(vec2 v){
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m; m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
vec3 ramp(float f){
  if(f < 0.5) return mix(uColorStops[0], uColorStops[1], f / 0.5);
  return mix(uColorStops[1], uColorStops[2], (f - 0.5) / 0.5);
}
void main(){
  vec2 uv = gl_FragCoord.xy / uResolution;
  uv.y = 1.0 - uv.y;                                   // odwrócone: zorza rośnie od dołu
  vec3 rampColor = ramp(uv.x);
  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;
  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);
  vec3 auroraColor = intensity * rampColor;
  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}`;
  const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if(!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
  gl.useProgram(prog);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'position'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(prog, n);
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  gl.uniform3fv(U('uColorStops'), new Float32Array([...hex('#3a6bfc'), ...hex('#e8eeff'), ...hex('#7aa0ff')]));
  gl.uniform1f(U('uAmplitude'), 1.0);
  gl.uniform1f(U('uBlend'), 0.5);
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  function size(){
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = Math.round(box.clientWidth * dpr); canvas.height = Math.round(box.clientHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(U('uResolution'), canvas.width, canvas.height);
  }
  size(); addEventListener('resize', size);
  let running = false;
  const visible = () => parseFloat(getComputedStyle(root).getPropertyValue('--reveal') || '0') > 0.01;
  function frame(t){
    if(!visible()){ running = false; return; }
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(U('uTime'), t * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }
  window.lumoZorza = () => { if(!running && visible()){ running = true; requestAnimationFrame(frame); } };
})();
