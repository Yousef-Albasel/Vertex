---
title: "P5 Index Buffers"
description: ""
date: "2024-01-01"
category: "OpenGL"
image: "/images/opengl.jpg"

---

#### Index Buffers

------------

When we draw shapes like triangles, using the same vertex positions repeatedly can lead to unnecessary memory duplication. Imagine drawing a triangle; you would have three vertices at the corners, and each vertex has its position information. If you want to draw another triangle to form a square, you'd end up storing the same vertex positions again, leading to redundancy in memory usage.

```cpp
float positions[] = {
                            -0.5f, -0.5f,
                             0.5f,-0.5f, 
                             0.5f, 0.5f,

                              0.5f,0.5f, // redundunt
                             -0.5f, 0.5f,
                             -0.5f, -0.5f, //redundunt
        };
```

Index Buffers it's like having a shared list of vertices, and the index buffer tells the graphics system which vertices to use for each triangle. This approach not only reduces memory consumption but also improves rendering efficiency, especially when dealing with complex 3D models composed of numerous triangles.

so what we gonna do is to get rid of the two redundant vertices and create an array for indices

```c
unsigned int indices[] = {
                      0, 1, 2,
                      2, 3, 0
        };

```

next we create an index buffer of type `GL_ELEMENT_ARRAY_BUFFER` and bind it so we can use this index buffer to draw whatever shapes we want

```c

        // Index Buffer creating
        unsigned int ibo;
        glGenBuffers(1, &ibo); // Generates a buffer and gives back ID
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, ibo); // binding to the buffer we created.
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, 6  * sizeof(unsigned int), indices, GL_STATIC_DRAW);
```

last thing we want to do is to modify the draw method we used, this time we will use a `glDrawElement()` method to draw our shape.

```c
glDrawElements(GL_TRIANGLES,6,GL_UNSIGNED_INT,NULL); // use if you don't have a index buffer
```

![](https://i.postimg.cc/j5Yg9VfM/image.png)

