# WebGPU Triangle Demo

This is a simple demonstration of WebGPU that renders a red triangle on a canvas.

## Prerequisites

- A browser that supports WebGPU (Chrome Canary with appropriate flags enabled)
- Node.js and npm installed

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser and navigate to `http://localhost:5173`

## Features

- Initializes WebGPU context
- Creates and compiles shaders
- Renders a simple red triangle
- Handles WebGPU support detection and errors

## Browser Support

Currently, WebGPU is supported in:
- Chrome Canary with the `--enable-unsafe-webgpu` flag
- Firefox Nightly with appropriate flags
- Other browsers may require special flags or not support WebGPU yet

## Notes

If you see an error message saying "WebGPU not supported", make sure you're using a compatible browser with the appropriate flags enabled. 