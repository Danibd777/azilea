// "Membrane" physics applied to the hero photograph itself: the linen surface is a
// spring mesh, the pointer presses into it and ripples travel outward. No dots, no
// lines – the photo is drawn on the mesh with WebGL and only bends and catches light.
(() => {
  const hero = document.getElementById('top');
  const img = document.getElementById('heroImg');
  if (!hero || !img) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'hero__gl';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true });
  if (!gl) return; // keep the plain photo

  // physics, as in the Membrane spec
  const SPRING = 0.025, DAMPING = 0.93, SPREAD = 0.18;
  const HOVER_RADIUS = 140, HOVER_FORCE = 15;
  const PRESS_RADIUS = 210, PRESS_FORCE = 30;
  const WARP = 0.32;    // how much of the simulated displacement bends the photo
  const LIGHT = 0.011;  // how strongly folds catch light / fall into shade

  /* ---------- GL setup ---------- */
  const vs = `
    attribute vec2 a_pos; attribute vec2 a_uv; attribute float a_shade;
    varying vec2 v_uv; varying float v_shade;
    void main() { v_uv = a_uv; v_shade = a_shade; gl_Position = vec4(a_pos, 0.0, 1.0); }`;
  const fs = `
    precision mediump float;
    uniform sampler2D u_tex; varying vec2 v_uv; varying float v_shade;
    void main() { vec4 c = texture2D(u_tex, v_uv); gl_FragColor = vec4(c.rgb * v_shade, 1.0); }`;
  const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  const loc = {
    pos: gl.getAttribLocation(prog, 'a_pos'),
    uv: gl.getAttribLocation(prog, 'a_uv'),
    shade: gl.getAttribLocation(prog, 'a_shade'),
  };
  const posBuf = gl.createBuffer(), uvBuf = gl.createBuffer(), shadeBuf = gl.createBuffer(), idxBuf = gl.createBuffer();
  const tex = gl.createTexture();

  let W = 0, H = 0, cols = 60, rows = 34, verts = [], posArr, shadeArr, indexCount = 0;
  let texReady = false;
  const mouse = { x: -9999, y: -9999, inside: false, pressing: false };
  let visible = true;

  function objectPosition() {
    return window.matchMedia('(max-width: 767px)').matches ? [0.52, 0.70] : [0.54, 0.60];
  }

  function build() {
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    if (!W || !H) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);

    if (W < H) { cols = 30; rows = 54; } else { cols = 60; rows = 34; }

    // object-fit: cover mapping
    const iw = img.naturalWidth || 16, ih = img.naturalHeight || 9;
    const A = W / H, I = iw / ih;
    const [px, py] = objectPosition();
    let u0 = 0, ur = 1, v0 = 0, vr = 1;
    if (A > I) { vr = I / A; v0 = (1 - vr) * py; } else { ur = A / I; u0 = (1 - ur) * px; }

    verts = [];
    const uv = new Float32Array(cols * rows * 2);
    for (let row = 0; row < rows; row++) {
      for (let c = 0; c < cols; c++) {
        const s = c / (cols - 1), t = row / (rows - 1);
        const x = s * W, y = t * H;
        const edge = c === 0 || row === 0 || c === cols - 1 || row === rows - 1;
        verts.push({ c, r: row, restX: x, restY: y, x, y, vx: 0, vy: 0, z: 0, vz: 0, edge });
        const k = (row * cols + c) * 2;
        uv[k] = u0 + s * ur;
        uv[k + 1] = v0 + t * vr;
      }
    }
    posArr = new Float32Array(cols * rows * 2);
    shadeArr = new Float32Array(cols * rows).fill(1);

    const idx = new Uint16Array((cols - 1) * (rows - 1) * 6);
    let n = 0;
    for (let row = 0; row < rows - 1; row++) {
      for (let c = 0; c < cols - 1; c++) {
        const a = row * cols + c, b = a + 1, d = a + cols, e = d + 1;
        idx[n++] = a; idx[n++] = d; idx[n++] = b;
        idx[n++] = b; idx[n++] = d; idx[n++] = e;
      }
    }
    indexCount = n;

    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf); gl.bufferData(gl.ARRAY_BUFFER, uv, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf); gl.bufferData(gl.ARRAY_BUFFER, posArr.byteLength, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, shadeBuf); gl.bufferData(gl.ARRAY_BUFFER, shadeArr.byteLength, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
  }

  function uploadTexture() {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    texReady = true;
    build();
  }

  const at = (c, r) => verts[r * cols + c];

  function step(t) {
    const radius = mouse.pressing ? PRESS_RADIUS : HOVER_RADIUS;
    const strength = mouse.pressing ? PRESS_FORCE : HOVER_FORCE;
    for (const v of verts) {
      if (v.edge) continue; // pinned border: the photo never tears away from the frame
      const breathe = Math.sin(t * 0.6 + v.c * 0.15 + v.r * 0.12) * 2;
      v.vz += (breathe - v.z) * 0.002;
      if (mouse.inside) {
        const dx = v.x - mouse.x, dy = v.y - mouse.y, dist = Math.hypot(dx, dy);
        if (dist < radius && dist > 0.001) {
          const f = (1 - dist / radius) * strength;
          v.vz += f * 0.4;
          v.vx += (dx / dist) * f * 0.12;
          v.vy += (dy / dist) * f * 0.12;
        }
      }
      v.vx += (v.restX - v.x) * SPRING;
      v.vy += (v.restY - v.y) * SPRING;
      v.vz -= v.z * SPRING * 1.5;
      v.vx *= DAMPING; v.vy *= DAMPING; v.vz *= DAMPING;
      v.x += v.vx; v.y += v.vy; v.z += v.vz;
    }
    for (let r = 1; r < rows - 1; r++) {
      for (let c = 1; c < cols - 1; c++) {
        const v = at(c, r);
        v.vz += (at(c - 1, r).z + at(c + 1, r).z + at(c, r - 1).z + at(c, r + 1).z - 4 * v.z) * SPREAD;
      }
    }
  }

  function draw() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const v = at(c, r);
        const i = r * cols + c;
        const x = v.restX + (v.x - v.restX) * WARP;
        const y = v.restY + ((v.y - v.restY) - v.z * 0.3) * WARP;
        posArr[i * 2] = (x / W) * 2 - 1;
        posArr[i * 2 + 1] = 1 - (y / H) * 2;
        // light from the upper right: slopes facing it brighten, the others soften into shade
        const zl = c > 0 ? at(c - 1, r).z : v.z, zr = c < cols - 1 ? at(c + 1, r).z : v.z;
        const zu = r > 0 ? at(c, r - 1).z : v.z, zd = r < rows - 1 ? at(c, r + 1).z : v.z;
        const s = 1 + ((zr - zl) * 0.6 - (zd - zu) * 0.8) * LIGHT;
        shadeArr[i] = Math.max(0.88, Math.min(1.1, s));
      }
    }
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, posArr);
    gl.enableVertexAttribArray(loc.pos); gl.vertexAttribPointer(loc.pos, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    gl.enableVertexAttribArray(loc.uv); gl.vertexAttribPointer(loc.uv, 2, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, shadeBuf); gl.bufferSubData(gl.ARRAY_BUFFER, 0, shadeArr);
    gl.enableVertexAttribArray(loc.shade); gl.vertexAttribPointer(loc.shade, 1, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
  }

  function loop(ms) {
    if (texReady && visible && !document.hidden && verts.length) { step(ms / 1000); draw(); }
    requestAnimationFrame(loop);
  }

  /* ---------- input ---------- */
  function setPointer(x, y) {
    const r = canvas.getBoundingClientRect();
    mouse.x = x - r.left; mouse.y = y - r.top; mouse.inside = true;
  }
  const leave = () => { mouse.inside = false; mouse.pressing = false; mouse.x = mouse.y = -9999; };
  hero.addEventListener('mousemove', (e) => setPointer(e.clientX, e.clientY));
  hero.addEventListener('mouseleave', leave);
  hero.addEventListener('mousedown', () => { mouse.pressing = true; });
  window.addEventListener('mouseup', () => { mouse.pressing = false; });
  hero.addEventListener('touchstart', (e) => { const t = e.touches[0]; if (t) { setPointer(t.clientX, t.clientY); mouse.pressing = true; } }, { passive: true });
  hero.addEventListener('touchmove', (e) => { const t = e.touches[0]; if (t) setPointer(t.clientX, t.clientY); }, { passive: true });
  hero.addEventListener('touchend', leave, { passive: true });

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);
  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 150); });

  /* ---------- swap the <img> for the living canvas ---------- */
  img.parentElement.appendChild(canvas);
  hero.classList.add('has-gl');
  window.azileaHeroVisual = canvas; // hero.js animates this instead of the <img>
  const ready = () => uploadTexture();
  if (img.complete && img.naturalWidth) ready();
  else img.addEventListener('load', ready, { once: true });
  // srcset may swap to a bigger file later – keep the texture in step
  img.addEventListener('load', () => { if (texReady) uploadTexture(); });
  requestAnimationFrame(loop);
})();
