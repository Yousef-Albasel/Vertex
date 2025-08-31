---
title: "P2 Vertex Buffers"
description: ""
date: "2024-01-01"
category: "OpenGL"
image: "/images/opengl.jpg"

---


---### Vertex Buffers and Drawing a Triangle

as we finally are set up, we can start learning OpenGL and make things happen.

to start with drawing a triangle in **"Moden OpenGL"** we need two things, a **vertex buffer** and a **Shader**

a buffer is nothing but an array, the basic concept that i want to define a bunch of data that represents a triangle, put it in our GPU's vRam, and then define a draw function, and then tell our GPU how to read those data, and display it on screen.

"Have some data, draw me something" or " I want you to select this buffer, and this shader, then draw me a triangle" it's a **state machine**

```c

    float positions[6] = { -0.5f, -0.5f,
                         0.0f, 0.5f,
                         0.5f,-0.5f }; // our data to draw a triangle also a buffer

    // Creating our Vertex Buffer
    unsigned int buffer;
    glGenBuffers(1, &buffer); // Generates a buffer and gives back ID

    // Binding a buffer (selecting)

    glBindBuffer(GL_ARRAY_BUFFER, buffer); // binding to the buffer we created.

    // Put data into the Buffer.
 
    glBufferData(GL_ARRAY_BUFFER, 6 * sizeof(float), positions,GL_STATIC_DRAW);

    // Now we need to tell OpenGL how our data is laid out, is it a 2D Vector or 3D...
    // But it's a problem for future me.
```

- **Positions Array:** This array holds the vertex coordinates of your triangle. Each vertex has two coordinates (x, y), and you have three vertices, making a total of six values.

- **Generate and Bind Vertex Buffer:** `glGenBuffers` is used to create a buffer (in this case, a vertex buffer) and allocate an ID for it. `glBindBuffer` is used to bind the buffer, making it the active buffer.

- **Buffer Data:** `glBufferData` is used to allocate and initialize the data store of the buffer. In this case, it copies the vertex data from the positions array into the buffer. The `GL_STATIC_DRAW` hint indicates that the data is not expected to change frequently.

You can refer to the documentation to know more info about it https://docs.gl/gl4/glBufferData

- **Vertex Layout (Not Implemented Yet):** The code comments mention that it's a task for the future to inform OpenGL about the layout of the data. This typically involves specifying the format of the vertex data, like whether it represents 2D or 3D coordinates and how they are packed in memory.