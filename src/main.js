 const canvas = document.getElementById("gpu-canvas");
    canvas.width = 1000;
    canvas.height = 600;

    async function initWebGPU() {
      if (!navigator.gpu) {
        console.error("WebGPU not supported!");
        return;
      }

      const adapter = await navigator.gpu.requestAdapter();
      const device = await adapter.requestDevice();
      const context = canvas.getContext("webgpu");

      const format = navigator.gpu.getPreferredCanvasFormat();
      context.configure({
        device: device,
        format: format,
        alphaMode: "opaque"
      });

      // Equilateral triangle vertices (centered, height ≈ 0.75)
      const vertexData = new Float32Array([
         0.0,   0.5,
        -0.433, -0.25,
         0.433, -0.25
      ]);

      const vertexBuffer = device.createBuffer({
        size: vertexData.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(vertexBuffer, 0, vertexData);

      // Shader with inverse aspect ratio correction
      const shaderModule = device.createShaderModule({
        code: `
          @group(0) @binding(0) var<uniform> inverseAspect: f32;

          @vertex
          fn vs_main(@location(0) pos: vec2<f32>) -> @builtin(position) vec4<f32> {
            return vec4<f32>(pos.x * inverseAspect, pos.y, 0.0, 1.0);
          }

          @fragment
          fn fs_main() -> @location(0) vec4<f32> {
            return vec4<f32>(0.3, 0.8, 0.4, 0.1);
          }
        `
      });

      // Inverse aspect ratio uniform
      const inverseAspect = canvas.height / canvas.width;
      const uniformBuffer = device.createBuffer({
        size: 4,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([inverseAspect]));

      const bindGroupLayout = device.createBindGroupLayout({
        entries: [{
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: {}
        }]
      });

      const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [{
          binding: 0,
          resource: { buffer: uniformBuffer }
        }]
      });

      const pipeline = device.createRenderPipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
        vertex: {
          module: shaderModule,
          entryPoint: "vs_main",
          buffers: [{
            arrayStride: 8,
            attributes: [{
              format: "float32x2",
              offset: 0,
              shaderLocation: 0
            }]
          }]
        },
        fragment: {
          module: shaderModule,
          entryPoint: "fs_main",
          targets: [{ format }]
        },
        primitive: {
          topology: "triangle-list"
        }
      });

      function frame() {
        const commandEncoder = device.createCommandEncoder();
        const textureView = context.getCurrentTexture().createView();

        const renderPass = commandEncoder.beginRenderPass({
          colorAttachments: [{
            view: textureView,
            loadOp: "clear",
            clearValue: { r: 0.1, g: 0.1, b: 0.1, a: 1.0 },
            storeOp: "store"
          }]
        });

        renderPass.setPipeline(pipeline);
        renderPass.setBindGroup(0, bindGroup);
        renderPass.setVertexBuffer(0, vertexBuffer);
        renderPass.draw(3, 1, 0, 0);
        renderPass.end();

        device.queue.submit([commandEncoder.finish()]);
        requestAnimationFrame(frame);
      }

      requestAnimationFrame(frame);
    }

    initWebGPU();