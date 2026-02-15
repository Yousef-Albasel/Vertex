/**
 * Vertex Shader Renderer
 * Lightweight WebGL runtime for rendering GLSL fragment shaders.
 * Supports side-by-side editable code + live canvas playground.
 */
(function () {
  'use strict';

  var VERTEX_SHADER_SOURCE = [
    'attribute vec2 a_position;',
    'void main() {',
    '  gl_Position = vec4(a_position, 0.0, 1.0);',
    '}'
  ].join('\n');

  function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    if (!shader) return { error: 'Failed to create shader object' };
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      var error = gl.getShaderInfoLog(shader) || 'Unknown compilation error';
      gl.deleteShader(shader);
      return { error: error };
    }
    return { shader: shader };
  }

  function createProgram(gl, vertexSource, fragmentSource) {
    var vertResult = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    if (vertResult.error) return { error: vertResult.error };

    var fragResult = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (fragResult.error) {
      gl.deleteShader(vertResult.shader);
      return { error: fragResult.error };
    }

    var program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vertResult.shader);
      gl.deleteShader(fragResult.shader);
      return { error: 'Failed to create program' };
    }

    gl.attachShader(program, vertResult.shader);
    gl.attachShader(program, fragResult.shader);
    gl.linkProgram(program);
    gl.deleteShader(vertResult.shader);
    gl.deleteShader(fragResult.shader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      var error = gl.getProgramInfoLog(program) || 'Unknown link error';
      gl.deleteProgram(program);
      return { error: error };
    }

    return { program: program };
  }

  function ShaderInstance(container) {
    this.container = container;
    this.canvas = container.querySelector('.shader-canvas');
    this.editor = container.querySelector('.shader-editor');
    this.statusDot = container.querySelector('.shader-status-dot');
    this.statusText = container.querySelector('.shader-status-text');
    this.running = false;
    this.startTime = 0;
    this.animFrameId = null;
    this.mouseX = 0.5;
    this.mouseY = 0.5;
    this.gl = null;
    this.program = null;
    this.buffer = null;
    this.uniforms = {};
    this.compileTimer = null;

    // Get initial shader source
    var scriptEl = container.querySelector('script[type="x-shader/x-fragment"]');
    this.fragmentSource = scriptEl ? scriptEl.textContent.trim() : '';

    this.init();
  }

  ShaderInstance.prototype.init = function () {
    var canvas = this.canvas;
    if (!canvas) return;

    // Set canvas resolution
    var rect = canvas.getBoundingClientRect();
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(rect.width * dpr, 300);
    canvas.height = Math.max(rect.height * dpr, 200);

    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      this.setStatus('error', 'WebGL not supported');
      return;
    }
    this.gl = gl;

    // Fullscreen quad
    this.buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);

    // Compile initial shader
    this.compile(this.fragmentSource);

    // Mouse tracking
    var self = this;
    canvas.addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect();
      self.mouseX = (e.clientX - r.left) / r.width;
      self.mouseY = 1.0 - (e.clientY - r.top) / r.height;
    });

    // Play/pause button
    this.setupControls();

    // Editor: recompile on change (debounced)
    if (this.editor) {
      this.editor.addEventListener('input', function () {
        if (self.compileTimer) clearTimeout(self.compileTimer);
        self.compileTimer = setTimeout(function () {
          self.compile(self.editor.value);
        }, 400);
      });

      // Tab key support in textarea
      this.editor.addEventListener('keydown', function (e) {
        if (e.key === 'Tab') {
          e.preventDefault();
          var start = this.selectionStart;
          var end = this.selectionEnd;
          this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
          this.selectionStart = this.selectionEnd = start + 4;
          // Trigger recompile
          if (self.compileTimer) clearTimeout(self.compileTimer);
          self.compileTimer = setTimeout(function () {
            self.compile(self.editor.value);
          }, 400);
        }
      });
    }

    this.startTime = performance.now();
    this.start();
  };

  ShaderInstance.prototype.compile = function (source) {
    var gl = this.gl;
    if (!gl) return;

    // Delete old program
    if (this.program) {
      gl.deleteProgram(this.program);
      this.program = null;
    }

    var result = createProgram(gl, VERTEX_SHADER_SOURCE, source);
    if (result.error) {
      this.program = null;
      this.setStatus('error', result.error);
      return;
    }

    this.program = result.program;
    gl.useProgram(this.program);

    // Cache uniform locations
    this.uniforms = {
      u_time: gl.getUniformLocation(this.program, 'u_time'),
      u_resolution: gl.getUniformLocation(this.program, 'u_resolution'),
      u_mouse: gl.getUniformLocation(this.program, 'u_mouse')
    };

    this.setStatus('ok', 'Running');
  };

  ShaderInstance.prototype.setStatus = function (type, msg) {
    if (this.statusDot) {
      this.statusDot.style.background = type === 'error' ? '#dc2626' : '#22c55e';
    }
    if (this.statusText) {
      this.statusText.textContent = msg;
      this.statusText.style.color = type === 'error' ? '#f87171' : '#a0a0b0';
    }
  };

  ShaderInstance.prototype.setupControls = function () {
    var self = this;
    var pauseBtn = this.container.querySelector('.shader-pause-btn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', function () {
        if (self.running) {
          self.stop();
          pauseBtn.textContent = '\u25B6';
          pauseBtn.title = 'Play';
        } else {
          self.start();
          pauseBtn.textContent = '\u23F8';
          pauseBtn.title = 'Pause';
        }
      });
    }
  };

  ShaderInstance.prototype.render = function () {
    var gl = this.gl;
    if (!gl || !this.program) return;

    var time = (performance.now() - this.startTime) / 1000.0;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.program);

    var posAttr = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(posAttr);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    if (this.uniforms.u_time !== null)
      gl.uniform1f(this.uniforms.u_time, time);
    if (this.uniforms.u_resolution !== null)
      gl.uniform2f(this.uniforms.u_resolution, this.canvas.width, this.canvas.height);
    if (this.uniforms.u_mouse !== null)
      gl.uniform2f(this.uniforms.u_mouse, this.mouseX, this.mouseY);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  ShaderInstance.prototype.loop = function () {
    if (!this.running) return;
    this.render();
    var self = this;
    this.animFrameId = requestAnimationFrame(function () { self.loop(); });
  };

  ShaderInstance.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    this.loop();
  };

  ShaderInstance.prototype.stop = function () {
    this.running = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  };

  // --- Initialization ---
  function initAllShaders() {
    var containers = document.querySelectorAll('.shader-container');
    if (containers.length === 0) return;

    var instances = [];
    for (var i = 0; i < containers.length; i++) {
      instances.push(new ShaderInstance(containers[i]));
    }

    // IntersectionObserver: pause off-screen shaders
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          for (var j = 0; j < instances.length; j++) {
            if (instances[j].container === entry.target) {
              if (entry.isIntersecting) {
                instances[j].start();
              } else {
                instances[j].stop();
              }
              break;
            }
          }
        });
      }, { threshold: 0.1 });

      for (var k = 0; k < instances.length; k++) {
        observer.observe(instances[k].container);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllShaders);
  } else {
    initAllShaders();
  }
})();
