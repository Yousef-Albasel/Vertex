import { useEffect, useRef, useState, memo } from 'react';

const VERTEX_SHADER = [
  'attribute vec2 a_position;',
  'void main() {',
  '  gl_Position = vec4(a_position, 0.0, 1.0);',
  '}'
].join('\n');

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) || 'Unknown compilation error';
    gl.deleteShader(shader);
    return { error: log };
  }
  return { shader };
}

function linkProgram(gl, fragSource) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  if (!vs) return { error: 'Failed to create vertex shader' };
  if (vs.error) return { error: 'Vertex: ' + vs.error };

  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSource);
  if (!fs) { gl.deleteShader(vs.shader); return { error: 'Failed to create fragment shader' }; }
  if (fs.error) { gl.deleteShader(vs.shader); return { error: fs.error }; }

  const prog = gl.createProgram();
  if (!prog) { gl.deleteShader(vs.shader); gl.deleteShader(fs.shader); return { error: 'Failed to create program' }; }

  gl.attachShader(prog, vs.shader);
  gl.attachShader(prog, fs.shader);
  gl.linkProgram(prog);
  gl.deleteShader(vs.shader);
  gl.deleteShader(fs.shader);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(prog) || 'Unknown link error';
    gl.deleteProgram(prog);
    return { error: 'Link: ' + log };
  }
  return { program: prog };
}

export default memo(function ShaderPreview({ shaderSource, isDarkMode }) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    gl: null,
    program: null,
    buffer: null,
    running: false,
    animId: null,
    startTime: 0,
    mouseX: 0.5,
    mouseY: 0.5,
  });
  const [error, setError] = useState(null);

  // Single effect: initialize GL + compile + animate
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { preserveDrawingBuffer: false })
              || canvas.getContext('experimental-webgl');
    if (!gl) {
      setError('WebGL is not supported in this browser');
      return;
    }

    const s = stateRef.current;
    s.gl = gl;
    s.startTime = performance.now();

    // Fullscreen quad buffer
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);
    s.buffer = buf;

    // Render loop
    function frame() {
      if (!s.running) return;
      const p = s.program;
      if (p) {
        const t = (performance.now() - s.startTime) / 1000;
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.useProgram(p);

        const posAttr = gl.getAttribLocation(p, 'a_position');
        gl.enableVertexAttribArray(posAttr);
        gl.bindBuffer(gl.ARRAY_BUFFER, s.buffer);
        gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

        const uTime = gl.getUniformLocation(p, 'u_time');
        const uRes = gl.getUniformLocation(p, 'u_resolution');
        const uMouse = gl.getUniformLocation(p, 'u_mouse');
        if (uTime) gl.uniform1f(uTime, t);
        if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
        if (uMouse) gl.uniform2f(uMouse, s.mouseX, s.mouseY);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      s.animId = requestAnimationFrame(frame);
    }

    s.running = true;
    frame();

    return () => {
      s.running = false;
      if (s.animId) cancelAnimationFrame(s.animId);
      if (s.program) { gl.deleteProgram(s.program); s.program = null; }
      if (s.buffer) { gl.deleteBuffer(s.buffer); s.buffer = null; }
      s.gl = null;
    };
  }, []);

  // Recompile shader when source changes (debounced)
  useEffect(() => {
    const s = stateRef.current;
    const gl = s.gl;
    if (!gl) return;

    const timer = setTimeout(() => {
      if (s.program) {
        gl.deleteProgram(s.program);
        s.program = null;
      }

      const result = linkProgram(gl, shaderSource);
      if (result.error) {
        setError(result.error);
        s.program = null;
      } else {
        setError(null);
        s.program = result.program;
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [shaderSource]);

  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = stateRef.current;
    s.mouseX = (e.clientX - rect.left) / rect.width;
    s.mouseY = 1.0 - (e.clientY - rect.top) / rect.height;
  };

  return (
    <div
      className={`relative rounded-lg overflow-hidden my-3 border ${
        isDarkMode ? 'border-gray-600' : 'border-gray-300'
      }`}
      style={{ background: '#1a1a2e' }}
    >
      <canvas
        ref={canvasRef}
        width={600}
        height={300}
        onMouseMove={handleMouseMove}
        style={{
          display: error ? 'none' : 'block',
          width: '100%',
          height: '300px',
          cursor: 'crosshair'
        }}
      />
      {error && (
        <div
          style={{
            padding: '1rem',
            color: '#f87171',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            borderLeft: '3px solid #dc2626',
            background: 'rgba(220,38,38,0.1)',
          }}
        >
          {error}
        </div>
      )}
      <div
        style={{
          padding: '0.35rem 0.75rem',
          fontSize: '0.7rem',
          color: '#a0a0b0',
          background: 'rgba(0,0,0,0.3)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <span style={{
          width: 8, height: 8, borderRadius: '50%',
          background: error ? '#dc2626' : '#22c55e',
          display: 'inline-block'
        }} />
        {error ? 'Shader Error' : 'GLSL Canvas — Live Preview'}
      </div>
    </div>
  );
});
