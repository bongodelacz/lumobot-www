/* LumoBot: wiązka Laser Flow (React Bits) wije się wężem przez stronę główną.
   Shader Laser Flow jest wzięty 1:1 z komponentu (Copyright (c) 2026 David Haz, licencja MIT + Commons Clause).
   Jedyna zmiana: współrzędne piksela są przeliczane na (odległość od ścieżki, długość wzdłuż ścieżki),
   dzięki czemu prosta wiązka komponentu idzie po zakrętach. Ścieżka schodzi po boku sekcji i na granicy sekcji zawija,
   wiązka spada razem z przewijaniem, a na dole uderza w sekcję LUMO i rozlewa się po niej (rozlanie z komponentu). */
(function(){
  'use strict';
  const main = document.getElementById('tresc'), end = document.querySelector('.dl-waves');
  if(!main || !end || document.documentElement.classList.contains('static')) return;
  const VERTEX = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;
  const FRAGMENT = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 uResolution;
uniform float uDpr;
uniform float uScale;
uniform float uTime;
uniform float uBeamX;
uniform vec4 uSurface;
uniform float uRadius;
uniform vec3 uIntro;
uniform vec4 uPour;
uniform vec2 uRun;
uniform vec4 uLens;
uniform sampler2D uReveal;
uniform vec4 uRevealMap;
uniform vec2 uRevealInfo;
uniform float uAtmosphere;
uniform vec4 uAmount;
uniform vec4 uShape;
uniform vec4 uExtra;
uniform float uTheme;
uniform vec3 uTint[16];
uniform vec3 uPath[48];
uniform int uPathN;
uniform vec2 uView;
uniform float uSpillY;
uniform float uSpillK;
uniform vec3 uCard;
uniform float uImpactX;

#define BEAM uTint[0]
#define LEFT uTint[1]
#define RIGHT uTint[2]
#define CYAN uTint[3]
#define PINK uTint[4]
#define LILAC uTint[5]
#define SKY uTint[6]
#define PURPLE uTint[7]
#define DEEP uTint[8]
#define MIST uTint[9]
#define NAVY uTint[10]
#define WARM uTint[11]
#define EMBER uTint[12]
#define WHITE uTint[13]
#define HAZE uTint[14]
#define LAVENDER uTint[15]

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = m * p;
    a *= 0.5;
  }
  return v;
}

float sq(float x) {
  return x * x;
}

float roundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

vec3 spill(float e, float fall, float strength, float front, float t, out vec3 glow) {
  glow = vec3(0.0);
  if (strength < 0.0005) return vec3(0.0);
  float f = max(fall, 0.0);
  float d = max(e, 0.0);
  float u = d / (6.0 + 0.28 * f);
  float start = smoothstep(-6.0, 12.0, fall);
  float fade = exp(-sq(max(f - 125.0, 0.0) / 40.0));
  float streak = 0.88 + 0.24 * noise(vec2(u * 6.0, f / 22.0 - t * 1.7));
  float bright = pow(strength, 1.5);
  float soft = sqrt(strength);
  float warmth = smoothstep(90.0, 130.0, f);
  vec3 coreK = mix(WHITE, WARM, warmth * exp(-d / 9.0));
  float core = mix(9.0, 2.6, warmth) * exp(-sq(d / (3.5 + 0.04 * f))) * exp(-sq(max(f - 130.0, 0.0) / 38.0));
  float wall = 24.0 * exp(-sq(d / 1.1)) * exp(-sq(max(f - 100.0, 0.0) / 30.0));
  float bandCenter = 0.7 - 0.3 * smoothstep(30.0, 110.0, f);
  float offset = u - bandCenter;
  float decay = (1.05 - bandCenter) / 1.31;
  float profile = offset < 0.0 ? exp(-sq(offset / 0.3)) : exp(-offset / decay);
  profile *= 1.0 - smoothstep(1.0, 1.4, u);
  vec3 bandA = mix(CYAN, PINK, smoothstep(50.0, 75.0, f));
  bandA = mix(bandA, LILAC, smoothstep(100.0, 125.0, f));
  vec3 bandB = mix(SKY, PURPLE, smoothstep(50.0, 75.0, f));
  vec3 fanK = mix(bandA, bandB, smoothstep(0.06, 0.18, offset));
  fanK = mix(fanK, DEEP, smoothstep(0.22, 0.42, offset));
  vec3 thread = WHITE * wall * bright + coreK * core * streak * bright;
  glow += fanK * 4.5 * profile * fade * streak * bright;
  glow += MIST * 0.7 * exp(-max(u - 1.0, 0.0) / 0.9) * smoothstep(0.7, 1.2, u) * fade * soft;
  glow += EMBER * 0.35 * exp(-sq((f - 165.0) / 22.0)) * exp(-d / 25.0) * bright;
  float lag = u * (6.0 + 0.28 * f) * 0.35;
  float reveal = 1.0 - smoothstep(front - 70.0, front + 8.0, f + lag);
  glow *= start * reveal;
  return thread * start * reveal;
}

vec3 easeLight(vec3 light, float amount) {
  return -log(max(1.0 - amount * (1.0 - exp(-light)), vec3(0.0001)));
}

void laserFlow(vec2 frag) {
  vec2 p = frag / uScale;
  float t = uTime;
  float bx = uBeamX / uScale;
  float sl = uSurface.x / uScale;
  float sy = uSurface.y / uScale;
  float sr = uSurface.z / uScale;
  float sb = uSurface.w / uScale;
  float radius = uRadius / uScale;
  float dx = p.x - bx;
  float adx = abs(dx);
  float h = sy - p.y;
  float hp = max(h, 0.0);
  float above = smoothstep(-0.5, 0.5, h);
  float side = smoothstep(-24.0, 24.0, dx);
  vec3 sideK = mix(mix(LAVENDER, LEFT, smoothstep(40.0, 140.0, adx)), RIGHT, side);
  float beamWidth = uShape.x;
  float flare = uShape.y;
  float spread = 250.0 * uShape.z;
  float reachL = max(bx - sl, 1.0);
  float reachR = max(sr - bx, 1.0);
  float reach = dx < 0.0 ? reachL : reachR;
  float layerLen = clamp(0.29 * reach, 20.0, 100.0) * sqrt(uShape.z);
  float run = uRun.x;
  float runMask = 1.0 - smoothstep(run - 34.0, run + 6.0, adx);
  float bead = exp(-sq((adx - run + 16.0) / (18.0 + 0.04 * run))) * uRun.y;
  float flowMask = (1.0 - smoothstep(0.75 * spread, 1.1 * spread, adx)) * runMask;
  float edgeMask = (1.0 - smoothstep(0.8 * spread, 1.25 * spread, adx)) * runMask;
  float bloom = uIntro.y;
  vec2 center = vec2((sl + sr) * 0.5, (sy + sb) * 0.5);
  vec2 halfSize = vec2((sr - sl) * 0.5, (sb - sy) * 0.5);
  float sd = roundBox(p - center, halfSize, radius);
  float outline = max(sd, 0.0);
  float below = max(p.y - sy - radius, 0.0);
  float hug = smoothstep(-0.5, 0.5, sd) * exp(-sq(below / 14.0));
  float hugWide = smoothstep(-0.5, 0.5, sd) * exp(-sq(below / 40.0));

  vec3 col = vec3(0.0);

  float breathe = 1.0 + uExtra.x * (0.12 * sin(t * 1.5708) + 0.08 * (noise(vec2(t * 0.5, 3.0)) - 0.5));

  float front = uIntro.x / uScale;
  float drop = smoothstep(front + 10.0, front - 110.0, p.y);
  float falling = 1.0 - smoothstep(sy - 24.0, sy, front);
  float top = mix(0.3, 1.0, smoothstep(0.0, 320.0 / uScale, p.y));
  float beamCore = 24.0 * exp(-adx / (2.0 * beamWidth));
  float beamHalo = 1.3 * exp(-adx / (6.0 * beamWidth)) + 0.3 * exp(-adx / (22.0 * beamWidth));
  vec3 haloK = mix(BEAM, sideK, exp(-hp / 80.0));
  col += (BEAM * beamCore + haloK * beamHalo) * top * above * drop;
  float head = exp(-sq((p.y - front) / 24.0)) * falling;
  col += mix(WHITE, BEAM, 0.35) * head * (7.0 * exp(-adx / (2.6 * beamWidth)) + 1.0 * exp(-adx / (14.0 * beamWidth)));

  float psi = adx * (outline + 1.0);
  float rise = max(hp - 17.9 * flare, 0.0);
  float skirtAmp = 16.6 * (exp(-sq(rise / (11.8 * flare))) + 0.3 * exp(-rise / (60.0 * flare)));
  float skirtSpread = mix(134.0, 155.0, side) * breathe * flare * flare * mix(0.35, 1.0, min(bloom, 1.0)) * max(bloom, 1.0);
  float skirt = skirtAmp * exp(-psi / skirtSpread) * exp(-sq(adx / (max(layerLen, 60.0 * sqrt(uShape.z)) * 1.48))) * hug;
  col += sideK * skirt * flowMask * min(bloom, 1.0);

  float layer = 12.0 * exp(-adx / layerLen) * exp(-outline / (0.19 * layerLen)) * (1.0 + 0.4 * bead);
  col += sideK * layer * hug * flowMask * min(bloom, 1.0);
  float washMask = smoothstep(sl - 60.0, sl + 6.0, p.x) * (1.0 - smoothstep(sr - 6.0, sr + 45.0, p.x));
  float wash = 1.4 * exp(-adx / 100.0) * exp(-outline / 30.0);
  col += mix(BEAM, sideK, 0.25) * wash * hugWide * washMask * flowMask * min(bloom, 1.0);
  float highWash = 0.7 * exp(-adx / 140.0) * exp(-outline / 60.0);
  col += mix(BEAM, NAVY, 0.5) * highWash * hugWide * washMask * runMask * min(bloom, 1.0);

  float sideSign = dx < 0.0 ? 0.0 : 1.0;
  float along = 0.5 * log((hp + 1.0) / (adx + 1.0));
  float lineScale = 6.0;
  float lp = log(max(psi, 1.0) / (120.0 * flare * flare)) * lineScale;
  float lineIndex = floor(lp) + sideSign * 97.0;
  float wobble = 0.22 * (noise(vec2(lineIndex * 3.7, t * 0.4 + along)) - 0.5);
  float lf = fract(lp + wobble) - 0.5;
  float gradient = lineScale * length(vec2(hp + 1.0, adx)) / max(psi, 1.0) / uScale;
  float halfWidth = max(0.35 * gradient, 0.0001);
  float drawWidth = max(halfWidth, 0.6 * gradient);
  float lineShape = exp(-lf * lf / (drawWidth * drawWidth)) * (halfWidth / drawWidth);
  float lineOn = step(0.3, hash(vec2(lineIndex, 1.3)));
  float lineFlow = smoothstep(0.25, 0.85, noise(vec2(lineIndex * 5.3 + 2.0, along * 3.0 + t * 1.1)));
  float flareArea = 120.0 * flare * flare;
  float lineEnvelope = smoothstep(0.85 * flareArea, 1.4 * flareArea, psi) * (1.0 - smoothstep(3.2 * flareArea, 7.5 * flareArea, psi));
  lineEnvelope *= exp(-adx / (layerLen * 1.5)) * hug * flowMask * (1.0 - smoothstep(35.0 * flare, 80.0 * flare, hp));
  float lineBright = mix(0.35, 1.0, hash(vec2(lineIndex, 4.0)));
  col += mix(sideK, WHITE, 0.6) * lineShape * lineOn * lineFlow * lineEnvelope * lineBright * 2.6 * uAmount.w * min(bloom, 1.0);

  float edgeGlow = 22.8 * exp(-sq(adx / (150.0 * uShape.z))) * edgeMask * (1.0 + 0.9 * bead);
  float onTop = 1.0 - smoothstep(sy + radius, sy + radius + 10.0, p.y);
  float edgeLine = (exp(-sq(max(sd, 0.0) / 0.9)) + 0.12 * exp(-max(sd, 0.0) / 3.0)) * edgeGlow * onTop;
  col += mix(sideK, WHITE, 0.6) * edgeLine * min(bloom, 1.0);

  float pour = uShape.w;
  float baseline = exp(-sq(130.0 / 150.0));
  float strengthR = exp(-sq(reachR / (150.0 * uShape.z))) * (1.0 - smoothstep(0.8 * spread, 1.25 * spread, reachR)) / baseline * pour;
  float strengthL = exp(-sq(reachL / (150.0 * uShape.z))) * (1.0 - smoothstep(0.8 * spread, 1.25 * spread, reachL)) / baseline * pour;
  float fallY = p.y - sy - 0.3 * radius;
  float rightHalf = smoothstep(center.x - 4.0, center.x + 4.0, p.x);
  float haloR = exp(-length(p - vec2(sr - 0.3 * radius, sy + 0.3 * radius)) / 40.0) * sqrt(strengthR);
  float haloL = exp(-length(p - vec2(sl + 0.3 * radius, sy + 0.3 * radius)) / 40.0) * sqrt(strengthL);
  vec3 glowR;
  vec3 glowL;
  col += spill(sd, fallY, strengthR, uPour.y, t, glowR) * rightHalf;
  col += spill(sd, fallY, strengthL, uPour.x, t, glowL) * (1.0 - rightHalf);
  col += easeLight(glowR * rightHalf + NAVY * 0.9 * haloR, uPour.w);
  col += easeLight(glowL * (1.0 - rightHalf) + NAVY * 0.9 * haloL, uPour.z);

  vec2 toLens = frag - uLens.xy;
  float lens = exp(-dot(toLens, toLens) / sq(uLens.z)) * uLens.w;
  col *= 1.0 + 0.35 * lens * hug;
  float fogAmount = uAmount.y * uAtmosphere;
  float near = exp(-adx / 150.0);
  float envelope = near * (0.3 + 0.4 * exp(-hp / 50.0) + 1.2 * exp(-p.y / 120.0));
  if (fogAmount > 0.001 && h > -2.0 && envelope * max(0.25, 6.0 * exp(-adx / 50.0)) > 0.002) {
    vec2 fq = vec2(dx / 1.7, h) / 85.0 + vec2(t * 0.012, -t * 0.03) + uExtra.zw;
    vec2 fw = vec2(fbm(fq * 1.3 + vec2(1.7, 9.2) + t * 0.03), fbm(fq * 1.3 + vec2(8.3, 2.8) - t * 0.025));
    float cloud = fbm(fq + 1.4 * fw);
    float density = smoothstep(0.5, 0.78, cloud);
    float lit = exp(-adx / 50.0);
    float fogMask = smoothstep(-2.0, 20.0, h);
    float reached = smoothstep(front + 80.0, front - 40.0, p.y);
    vec3 fog = (HAZE * 0.45 + BEAM * 6.0 * lit * reached) * density * envelope * fogMask;
    float surfaceLit = exp(-adx / (layerLen * 1.3)) * exp(-outline / 28.0) * hugWide * flowMask * washMask * min(bloom, 1.0);
    fog += sideK * 2.2 * surfaceLit * (smoothstep(0.38, 0.72, cloud) - 0.35) * fogMask;
    float smoke = smoothstep(0.3, 0.75, cloud);
    fog += BEAM * 0.35 * exp(-adx / (22.0 * beamWidth)) * (0.35 + 0.9 * smoke) * fogMask * top * drop;
    col += fog * fogAmount * (1.0 + 1.2 * lens) * mix(1.0, 0.45, uTheme);
  }

  if (uRevealInfo.y > 0.001 && uLens.w > 0.002) {
    vec2 toReveal = frag - uLens.xy;
    float reveal = exp(-dot(toReveal, toReveal) / sq(uRevealInfo.x)) * uLens.w;
    vec2 uv = frag * uRevealMap.xy + uRevealMap.zw;
    float onImage = step(0.0, uv.x) * step(uv.x, 1.0) * step(0.0, uv.y) * step(uv.y, 1.0);
    vec4 ui = texture(uReveal, uv);
    float ink = max(ui.r, max(ui.g, ui.b)) * onImage;
    float lit = clamp(col.b * 0.9, 0.0, 1.0) * (1.0 - smoothstep(0.9, 2.2, col.b));
    float clearance = smoothstep(60.0 * sqrt(beamWidth), 150.0 * sqrt(beamWidth), adx);
    col += mix(BEAM, WHITE, 0.4) * ink * reveal * lit * clearance * uRevealInfo.y * 2.2;
  }

  float haze = col.b;
  float dotGrid = 1.0 - smoothstep(0.16, 0.32, length(fract(frag / 3.0) - 0.5));
  col += BEAM * dotGrid * clamp(haze, 0.0, 1.5) * (1.0 - smoothstep(1.5, 4.0, haze)) * (0.18 + 0.3 * lens) * uExtra.y;
  if (lens > 0.002) {
    vec2 drift = frag - vec2(0.0, t * 14.0);
    vec2 sparkCell = floor(drift / 7.0);
    vec2 sparkPos = (sparkCell + 0.2 + 0.6 * vec2(hash(sparkCell + 5.1), hash(sparkCell + 2.3))) * 7.0;
    float sparkDist = length(drift - sparkPos);
    float sparkOn = step(0.8, hash(sparkCell + 8.8));
    float sparkTwinkle = 0.5 + 0.5 * sin(t * 5.0 + hash(sparkCell + 3.7) * 6.283);
    col += WHITE * exp(-sparkDist * sparkDist / 0.35) * sparkOn * sparkTwinkle * lens * clamp(haze * 1.5, 0.0, 1.0) * 1.6 * uAmount.z;
  }

  float dustAmount = uAmount.z;
  if (dustAmount > 0.001) {
    float dustLp = log(max(psi, 1.0) / (120.0 * flare * flare)) * 2.2;
    vec2 flowCell = vec2(dustLp / 1.1, (along + t * 0.22) / 0.06);
    vec2 cellId = floor(flowCell) + vec2(sideSign * 131.0, 0.0);
    vec2 cellJitter = vec2(hash(cellId + 1.7), hash(cellId + 8.3));
    vec2 particleFlow = (floor(flowCell) + 0.1 + cellJitter * 0.8) * vec2(1.1, 0.06);
    float particlePsi = 120.0 * flare * flare * exp(particleFlow.x / 2.2);
    float particleAlong = particleFlow.y - t * 0.22;
    float particleX = sqrt(particlePsi * exp(-2.0 * particleAlong)) - 1.0;
    float particleH = sqrt(particlePsi * exp(2.0 * particleAlong)) - 1.0;
    float particleDist = length(vec2(adx - particleX, hp - particleH)) * uScale;
    float particleOn = step(0.62, hash(cellId + 3.1));
    float particleTwinkle = 0.5 + 0.5 * sin(t * 5.0 + hash(cellId + 9.2) * 6.283);
    float dustZone = exp(-sq(log(max(psi, 1.0) / (200.0 * flare * flare)) / 0.55)) * hug * flowMask * smoothstep(0.0, 6.0, outline);
    col += WHITE * exp(-particleDist * particleDist / 0.3) * particleOn * particleTwinkle * dustZone * 3.0 * dustAmount * min(bloom, 1.0);

    vec2 glitterCell = vec2(dx / 3.0, (p.y - t * 26.0) / 9.0);
    vec2 glitterId = floor(glitterCell);
    vec2 glitterJitter = vec2(hash(glitterId + 4.4), hash(glitterId + 2.9));
    vec2 glitterPos = (glitterId + 0.15 + glitterJitter * 0.7) * vec2(3.0, 9.0);
    float glitterDist = length(vec2(dx, p.y - t * 26.0) - glitterPos) * uScale;
    float glitterOn = step(0.7, hash(glitterId + 6.6));
    float glitterTwinkle = 0.5 + 0.5 * sin(t * 6.0 + hash(glitterId + 1.1) * 6.283);
    float glitterZone = exp(-adx / (5.0 * beamWidth)) * smoothstep(1.5, 4.0, adx / beamWidth) * above * smoothstep(25.0, 70.0, hp) * top * drop;
    col += WHITE * exp(-glitterDist * glitterDist / 0.25) * glitterOn * glitterTwinkle * glitterZone * 2.2 * dustAmount * uAtmosphere;
  }

  col *= uAmount.x * (1.0 + uIntro.z * 0.9 * exp(-length(vec2(dx, h * 1.6)) / 70.0));
  col *= smoothstep(-0.75, 0.25, sd * uScale);

  vec3 emit = 1.0 - exp(-col * mix(1.0, 0.6, uTheme));
  float peak = max(emit.r, max(emit.g, emit.b));
  if (uTheme > 0.5) {
    float low = min(emit.r, min(emit.g, emit.b));
    float chroma = peak - low;
    vec3 hue = (emit - low) / max(chroma, 0.0001);
    float alpha = clamp(pow(chroma, 1.35) * 1.3, 0.0, 1.0) * 0.9;
    outColor = vec4((hue * 0.82 + 0.06) * alpha, alpha);
  } else {
    outColor = vec4(emit, peak);
  }
}

/* wąż: każdy piksel ekranu zamieniamy na (odległość od ścieżki, długość wzdłuż ścieżki),
   więc prosta wiązka Laser Flow układa się wzdłuż zakrętów. Pierwszy i ostatni odcinek ciągną się dalej prosto. */
void main() {
  vec2 q = vec2(gl_FragCoord.x, uView.y * uDpr - gl_FragCoord.y) / uDpr;
  /* najpierw najbliższa odległość, potem miękka średnia po odcinkach blisko niej: zakręty bez skoków */
  float dmin = 1e9;
  for (int i = 0; i < 47; i++) {
    if (i >= uPathN - 1) break;
    vec2 a = uPath[i].xy, b = uPath[i + 1].xy, ab = b - a;
    float h = clamp(dot(q - a, ab) / max(dot(ab, ab), 1e-4), i == 0 ? -1e6 : 0.0, i == uPathN - 2 ? 1e6 : 1.0);
    dmin = min(dmin, length(q - a - ab * h));
  }
  float ws = 0.0, s = 0.0, n = 0.0;
  for (int i = 0; i < 47; i++) {
    if (i >= uPathN - 1) break;
    vec2 a = uPath[i].xy, b = uPath[i + 1].xy, ab = b - a;
    float len = max(length(ab), 1e-3); vec2 tg = ab / len;
    float h = clamp(dot(q - a, tg) / len, i == 0 ? -1e6 : 0.0, i == uPathN - 2 ? 1e6 : 1.0);
    vec2 c = a + ab * h; float d = length(q - c);
    float w = exp(-(d - dmin) / 6.0);
    if (w < 0.002) continue;
    ws += w; s += w * (uPath[i].z + h * (uPath[i + 1].z - uPath[i].z)); n += w * dot(q - c, vec2(tg.y, -tg.x));
  }
  float sy0 = uSpillY;
  bool inCard = uSpillK > 0.001 && q.x > uCard.x - 140.0 && q.x < uCard.y + 140.0 && q.y > sy0 - 460.0 && q.y < sy0 + uCard.z + 420.0;
  if (dmin > 290.0 && !inCard) { outColor = vec4(0.0); return; }
  s /= max(ws, 1e-6); n /= max(ws, 1e-6);
  laserFlow(vec2(uBeamX + n * mix(1.3, 1.0, smoothstep(0.0, 520.0, s)), s));      /* przy początku poświata trochę węższa */
  /* dym i poświata tylko wokół linii; przy rozlaniu także wąski pas wzdłuż krawędzi LUMO */
  float keep = 1.0 - smoothstep(110.0, 230.0, dmin);
  float sy = uView.y > 0.0 ? uSpillY : -1e5;
  float band = uSpillK * smoothstep(sy - 300.0, sy - 90.0, q.y) * step(q.y, sy + 6.0) * exp(-abs(q.x - uImpactX) / (uView.x * 0.55));
  /* dym i światło tylko tam, dokąd wiązka już dotarła: nic nie wyprzedza linii */
  float done = 1.0 - smoothstep(uIntro.x - 30.0, uIntro.x + 50.0, s);
  outColor *= max(keep, band) * max(done, band);
  if (uSpillK > 0.001 && uView.y > 0.0 && q.y > uSpillY + 3.0) outColor = vec4(0.0);      /* pod krawędzią LUMO wiązka nie rysuje nic */
  /* kałuża światła: po uderzeniu światło rozpływa się po krawędzi w obie strony, faluje i gaśnie z odległością */
  if (uSpillK > 0.001) {
    float dy = sy - q.y, ax = abs(q.x - uImpactX);
    if (dy > -3.0 && dy < 230.0) {
      float reach = uView.x * 1.05 * uSpillK;
      float far = exp(-ax / (uView.x * 0.42)) * (1.0 - smoothstep(reach * 0.7, reach, ax));
      float flowN = fbm(vec2(ax / 110.0 - uTime * 0.22, dy / 46.0 + uTime * 0.05));
      float rise = 16.0 + 46.0 * exp(-ax / 300.0) + 20.0 * flowN;
      float sheet = exp(-max(dy, 0.0) / rise) * smoothstep(-3.0, 0.5, dy) * (1.0 - smoothstep(90.0, 220.0, dy));
      float rim = exp(-max(dy, 0.0) / 4.0) * smoothstep(-3.0, 0.5, dy) * (1.0 + 2.2 * exp(-ax / 420.0));
      vec3 pool = mix(NAVY, BEAM, 0.55) * sheet * (0.5 + 0.9 * flowN) * 1.5 + mix(BEAM, WHITE, 0.55) * rim * (0.8 + 0.6 * flowN) * 1.6;
      pool *= far * uSpillK;
      vec3 e2 = 1.0 - exp(-pool);
      outColor.rgb = 1.0 - (1.0 - outColor.rgb) * (1.0 - e2);
      outColor.a = max(outColor.a, max(e2.r, max(e2.g, e2.b)));
    }
  }
}
`;
  const TINTS = [
  [0, 1],
  [-11.5, 0.77],
  [9.5, 0.95],
  [-53.5, 0.79],
  [39.5, 0.77],
  [16, 0.81],
  [-16.3, 0.92],
  [13.3, 0.96],
  [3, 1.01],
  [1, 0.68],
  [1, 1.15],
  [142.5, 0.51],
  [113.6, 0.28],
  [-7.5, 0.13],
  [-2.7, 0.32],
  [7.5, 0.81]
];
  /* kolor zależy od pory dnia: rano pomarańcz, w dzień niebieski, wieczorem róż, w nocy zieleń (?kolor=... wymusza do podglądu) */
  const PORY = {roz: '#ff3d8b', niebieski: '#3a6bfc', pomarancz: '#ff7a1f', zielony: '#1fd6a0'};
  const COLOR = PORY.niebieski;
  const MAXP = 48, BASE_SAT = .78, INTRO_DROP = 1.25;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const toHsv = ([r, g, b]) => { const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
    if(d > 0){ if(mx === r) h = ((g - b) / d) % 6; else if(mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; } return [(h * 60 + 360) % 360, mx > 0 ? d / mx : 0]; };
  const fromHsv = (hue, c) => { const h = (((hue % 360) + 360) % 360) / 60, x = c * (1 - Math.abs((h % 2) - 1)), m = 1 - c;
    const [r, g, b] = h < 1 ? [c, x, 0] : h < 2 ? [x, c, 0] : h < 3 ? [0, c, x] : h < 4 ? [0, x, c] : h < 5 ? [x, 0, c] : [c, 0, x]; return [r + m, g + m, b + m]; };
  const tints = (() => { const hx = COLOR.slice(1), rgb = [0, 2, 4].map(i => parseInt(hx.slice(i, i + 2), 16) / 255), [hue, sat] = toHsv(rgb), k = sat / BASE_SAT, out = new Float32Array(TINTS.length * 3);
    TINTS.forEach(([sh, sc], i) => out.set(fromHsv(hue + sh, clamp(BASE_SAT * sc * k, 0, 1)), i * 3)); return out; })();
  const spring = t => { const w = 8, z = .62, d = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * t) * (Math.cos(d * t) + (z * w / d) * Math.sin(d * t)); };

  const canvas = document.createElement('canvas'); canvas.className = 'wz'; canvas.setAttribute('aria-hidden', 'true'); document.body.appendChild(canvas);
  const gl = canvas.getContext('webgl2', {alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false});
  if(!gl){ canvas.remove(); return; }
  const mk = (ty, s) => { const x = gl.createShader(ty); gl.shaderSource(x, s); gl.compileShader(x); if(!gl.getShaderParameter(x, gl.COMPILE_STATUS)){ console.warn('waz:', gl.getShaderInfoLog(x)); return null; } return x; };
  const vs = mk(gl.VERTEX_SHADER, VERTEX), fs = mk(gl.FRAGMENT_SHADER, FRAGMENT), prog = gl.createProgram();
  if(!vs || !fs){ canvas.remove(); return; }
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog); if(!gl.getProgramParameter(prog, gl.LINK_STATUS)){ canvas.remove(); return; }
  const U = {}; for(let i = 0, n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS); i < n; i++){ const nm = gl.getActiveUniform(prog, i).name.replace(/\[0\]$/, ''); U[nm] = gl.getUniformLocation(prog, nm); }
  const vao = gl.createVertexArray(), buf = gl.createBuffer(); gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW); const loc = gl.getAttribLocation(prog, 'aPosition'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0); gl.bindVertexArray(null);
  const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));

  /* ustawienia z dema komponentu */
  const O = {intensity: 1.8, beamWidth: 2.6, flare: 1.6, spread: 1.5, spill: 0, fog: .11, dust: 1.6, streaks: 1.5, dots: 1, pulse: 1.5, speed: 1.5, seed: 3};
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svgns = 'http://www.w3.org/2000/svg', holder = document.createElementNS(svgns, 'svg'), probe = document.createElementNS(svgns, 'path');
  holder.setAttribute('width', 0); holder.setAttribute('height', 0); holder.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden'; holder.appendChild(probe); document.body.appendChild(holder);

  let Sm = [], total = 1, W = 1, H = 1, ratio = 1, endTop = 0, endX = 0, card = {l: 0, r: 1, h: 1, rad: 0};
  const docTop = e => e.getBoundingClientRect().top + scrollY;
  function build(){
    W = document.documentElement.clientWidth; H = innerHeight; ratio = Math.min(devicePixelRatio || 1, 1) * .6;
    canvas.width = Math.round(W * ratio); canvas.height = Math.round(H * ratio);
    const m = Math.max(70, Math.min(210, (W - 1180) / 2 - 40)), xR = W - m, xL = m, r = 130;      /* bliżej treści, nie przy samej krawędzi ekranu */
    const endY = docTop(end); endTop = endY; const cr = end.getBoundingClientRect(); card = {l: cr.left, r: cr.right, h: cr.height, rad: parseFloat(getComputedStyle(end).borderTopLeftRadius) || 0};
    /* wodospad: zaczyna się po prawej w 3/4 wysokości sekcji z ceną i spada prosto na LUMO */
    const y0 = endY - 330;      /* na każdej stronie, także na głównej, wodospad ma tę samą wysokość: 330 px nad LUMO (decyzja użytkownika) */      /* podstrony bez sekcji z ceną: wodospad ma tę samą wysokość co na stronie głównej (330 px nad LUMO) */
    /* wylewa się zza prawej krawędzi: płynie w lewo, przelewa się po łuku i spada */
    let x = xR, d = `M ${W + 60} ${y0 - 70} L ${xR + 170} ${y0} C ${xR + 60} ${y0 + 38} ${xR} ${y0 + 110} ${xR} ${y0 + 270}`;
    endX = x; d += ` L ${endX} ${endY}`;
    probe.setAttribute('d', d); total = probe.getTotalLength();
    /* próbki co 6 px, potem zostają tylko punkty, gdzie ścieżka skręca: proste odcinki to dwa punkty */
    const raw = []; for(let l = 0; l <= total; l += 6){ const q = probe.getPointAtLength(l); raw.push([q.x, q.y, l]); }
    const qe = probe.getPointAtLength(total); raw.push([qe.x, qe.y, total]);
    Sm = []; let pk = raw[0]; Sm.push(...pk);
    for(let i = 1; i < raw.length - 1; i++){ const a = pk, b = raw[i], c = raw[i + 1];
      const ux = b[0] - a[0], uy = b[1] - a[1], vx = c[0] - b[0], vy = c[1] - b[1];
      const cr = Math.abs(ux * vy - uy * vx) / (Math.hypot(ux, uy) * Math.hypot(vx, vy) + 1e-6);
      if(cr > .012 || b[2] - a[2] > 900){ Sm.push(...b); pk = b; } }
    Sm.push(...raw[raw.length - 1]);
    update();
  }
  const lenAtY = yy => { for(let i = 0; i < Sm.length; i += 3) if(Sm[i + 1] >= yy) return Sm[i + 2]; return total; };

  const pts = new Float32Array(MAXP * 3);
  let shown = 0, want = 0, impactT = -1, time = 0, raf = 0, last = 0, flip = false;
  const ptr = {x: 0, y: 0, inside: false}, lens = {x: 0, y: 0, vx: 0, vy: 0, s: 0, placed: false};
  function update(){
    const atBottom = scrollY + innerHeight >= document.documentElement.scrollHeight - 4;
    want = (atBottom || endTop - scrollY < innerHeight + 260) ? total : Math.min(total - 1, lenAtY(scrollY + innerHeight * .72));      /* gdy widać krawędź LUMO, wiązka od razu do niej dolatuje i się rozlewa */
    wake();
  }
  function render(){
    const y0 = scrollY - 320, y1 = scrollY + H + 320, cnt = Sm.length / 3; let i0 = -1, i1 = -1;
    for(let k = 0; k < cnt - 1; k++){ const ya = Sm[k * 3 + 1], yb = Sm[k * 3 + 4]; if(Math.max(ya, yb) >= y0 && Math.min(ya, yb) <= y1){ if(i0 < 0) i0 = k; i1 = k + 1; } }
    if(i0 < 0){ i0 = cnt - 2; i1 = cnt - 1; }
    let n = 0; const put = k => { pts[n * 3] = Sm[k * 3]; pts[n * 3 + 1] = Sm[k * 3 + 1] - scrollY; pts[n * 3 + 2] = Sm[k * 3 + 2]; n++; };
    const stp = Math.max(1, Math.ceil((i1 - i0 + 1) / MAXP));
    let lk = -1; for(let k = i0; k <= i1 && n < MAXP - 1; k += stp){ put(k); lk = k; } if(lk !== i1) put(i1);
    /* rysujemy tylko prostokąt wokół widocznej części ścieżki (i pas rozlania) zamiast całego ekranu */
    let bx0 = 1e9, bx1 = -1e9, by0 = 1e9, by1 = -1e9;
    for(let k = 0; k < n; k++){ const x = pts[k * 3], y = pts[k * 3 + 1]; bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y); }
    bx0 -= 295; bx1 += 295; by0 -= 295; by1 += 295;
    bx0 = Math.max(0, bx0); bx1 = Math.min(W, bx1); by0 = Math.max(0, by0); by1 = Math.min(H, by1);
    /* stan wiązki jak w komponencie: front spada wzdłuż ścieżki, po uderzeniu w LUMO rusza rozlanie (bloom, pour, run) */
    const scale = 1, bx = 0, sy = total;      /* skala jak w demie komponentu: cienki rdzeń, miękka poświata */
    const sf = {left: card.l - endX, top: sy, right: card.r - endX, bottom: sy + card.h};
    const hit = shown >= total - .5;
    if(hit && impactT < 0) impactT = time / O.speed;
    if(!hit) impactT = -1;
    const tau = hit ? time / O.speed - impactT : 0;
    const settled = still || tau > 4;
    const front = hit ? sy + .3 * H : shown;
    const bloom = !hit ? 0 : settled ? 1 : spring(tau), flash = !hit || settled ? 0 : Math.exp(-tau / .35) * (1 - Math.exp(-tau / .05));
    const runRange = O.spread * 250 * 1.3 + 80, runFront = !hit ? -40 : settled ? 1e5 : runRange * (1 - Math.exp(-1.15 * tau));
    const bead = !hit || settled ? 0 : Math.exp(-1.15 * tau) * (1 - Math.exp(-tau / .08));
    const pour = reach => { if(!hit) return [-reach, 0]; if(settled) return [1000, 1]; const tg = Math.min(reach, runRange * .97), arr = -Math.log(1 - tg / runRange) / 1.15, el = tau - arr;
      const e = clamp((el + .15) / .8, 0, 1), fill = e * e * e * (e * (e * 6 - 15) + 10); if(el <= 0) return [runFront - tg, fill]; return [1.15 * (runRange - tg) * el + 260 * el * el, fill]; };
    const [fL, gL] = pour((bx - sf.left) / scale), [fR, gR] = pour((sf.right - bx) / scale);
    const atmo = !hit ? .3 + .7 * clamp(shown / 800, 0, 1) : settled ? 1 : .3 + .7 * (1 - Math.exp(-1.3 * tau));
    if(hit){ const ct = endTop - scrollY; bx0 = Math.min(bx0, Math.max(0, card.l - 150)); bx1 = Math.max(bx1, Math.min(W, card.r + 150)); by0 = Math.max(0, Math.min(by0, ct - 470)); by1 = Math.min(H, Math.max(by1, ct + card.h + 420)); }
    /* soczewka pod kursorem jak w komponencie: pozycję kursora przeliczamy na współrzędne wzdłuż wiązki */
    let lx = 0, ly = 0;
    if(lens.s > .002){ let best = 1e9;
      for(let k = 0; k < n - 1; k++){ const ax = pts[k * 3], ay = pts[k * 3 + 1], dx = pts[k * 3 + 3] - ax, dy = pts[k * 3 + 4] - ay, len = Math.hypot(dx, dy) || 1e-3, tx = dx / len, ty = dy / len;
        let h = ((lens.x - ax) * tx + (lens.y - ay) * ty) / len; h = Math.max(k === 0 ? -1e6 : 0, Math.min(k === n - 2 ? 1e6 : 1, h));
        const cx = ax + dx * h, cy = ay + dy * h, dd = Math.hypot(lens.x - cx, lens.y - cy);
        if(dd < best){ best = dd; ly = pts[k * 3 + 2] + h * (pts[k * 3 + 5] - pts[k * 3 + 2]); lx = (lens.x - cx) * ty - (lens.y - cy) * tx; } } }
    gl.viewport(0, 0, canvas.width, canvas.height); gl.disable(gl.SCISSOR_TEST); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    if(bx1 <= bx0 || by1 <= by0) return;
    gl.enable(gl.SCISSOR_TEST); gl.scissor(Math.floor(bx0 * ratio), Math.floor((H - by1) * ratio), Math.ceil((bx1 - bx0) * ratio), Math.ceil((by1 - by0) * ratio)); gl.useProgram(prog);
    gl.uniform2f(U.uResolution, W, H); gl.uniform2f(U.uView, W, H); gl.uniform1f(U.uDpr, ratio); gl.uniform1f(U.uScale, scale); gl.uniform1f(U.uTime, time); gl.uniform1f(U.uBeamX, bx);
    gl.uniform4f(U.uSurface, sf.left, sf.top, sf.right, sf.bottom); gl.uniform1f(U.uRadius, card.rad); gl.uniform3f(U.uIntro, front, bloom, flash); gl.uniform4f(U.uPour, fL, fR, gL, gR);
    gl.uniform2f(U.uRun, runFront, bead); gl.uniform4f(U.uLens, lx, ly, 95 * scale, lens.s);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(U.uReveal, 0); gl.uniform4f(U.uRevealMap, 1, 1, 0, 0); gl.uniform2f(U.uRevealInfo, 1, 0);
    gl.uniform1f(U.uAtmosphere, atmo); gl.uniform4f(U.uAmount, O.intensity, O.fog, O.dust, O.streaks); gl.uniform4f(U.uShape, O.beamWidth, O.flare, O.spread, O.spill);
    gl.uniform4f(U.uExtra, O.pulse, O.dots, 34.34 + O.seed * 7.31, 11.58 + O.seed * 3.17); gl.uniform1f(U.uTheme, 0); gl.uniform3fv(U.uTint, tints);
    gl.uniform3fv(U.uPath, pts); gl.uniform1i(U.uPathN, n); gl.uniform1f(U.uSpillY, endTop - scrollY); gl.uniform1f(U.uSpillK, !hit ? 0 : settled ? 1 : 1 - Math.exp(-3.2 * tau)); gl.uniform1f(U.uImpactX, endX); gl.uniform3f(U.uCard, card.l, card.r, card.h);
    gl.bindVertexArray(vao); gl.drawArrays(gl.TRIANGLES, 0, 3); gl.bindVertexArray(null);
  }
  function frame(now){
    raf = 0; if(document.hidden){ last = 0; return; }
    const dt = last ? Math.min(.05, (now - last) / 1000) : 1 / 60; last = now;
    if(!still) time += dt * O.speed;
    shown += (want - shown) * Math.min(1, dt * (want >= total ? 14 : 6)); if(Math.abs(want - shown) < .5) shown = want;
    const on = ptr.inside && !still;
    if(on && !lens.placed){ lens.x = ptr.x; lens.y = ptr.y; lens.vx = lens.vy = 0; lens.placed = true; }
    lens.vx += (120 * (ptr.x - lens.x) - 19 * lens.vx) * dt; lens.vy += (120 * (ptr.y - lens.y) - 19 * lens.vy) * dt; lens.x += lens.vx * dt; lens.y += lens.vy * dt;
    const goal = on ? 1 : 0; lens.s += (goal - lens.s) * (1 - Math.exp(-dt / (goal > lens.s ? .3 : .55))); if(lens.s < .001 && !on) lens.placed = false;
    flip = !flip; if(flip || still || scrolling) render();                    /* rysowanie co drugą klatkę: połowa pracy dla karty graficznej */
    if(!still) raf = requestAnimationFrame(frame);
  }
  function wake(){ if(!raf) raf = requestAnimationFrame(frame); }
  let scrolling = false, scT = 0;
  addEventListener('scroll', () => { scrolling = true; clearTimeout(scT); scT = setTimeout(() => { scrolling = false; }, 160); update(); }, {passive: true});
  addEventListener('pointermove', e => { ptr.x = e.clientX; ptr.y = e.clientY; ptr.inside = true; }, {passive: true});
  document.documentElement.addEventListener('pointerleave', () => { ptr.inside = false; });
  let rt = 0; const rebuild = () => { clearTimeout(rt); rt = setTimeout(build, 120); };
  addEventListener('resize', rebuild);
  if('ResizeObserver' in window) new ResizeObserver(rebuild).observe(main);
  document.addEventListener('visibilitychange', () => { last = 0; if(!document.hidden) wake(); });
  if(document.readyState === 'complete') build(); else addEventListener('load', build);
  setTimeout(build, 1500);
})();
