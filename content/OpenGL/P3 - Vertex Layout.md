---
title: "P3 Vertex Layout"
description: ""
date: "2024-01-01"
category: "OpenGL"
image: "/images/opengl.jpg"

---

### Vertex Layout

A vertex is not a position, it can contain more data than just position, but most of the time it's a position, it can be polynomials, tangents,trignometry or other things.

Now that we created a buffer, filled it with data we need to tell OpenGL that we are now trying to create a 2D Layout 

##### glEnableVertexAttribArray(0);
This line enables the generic vertex attribute array with index 0. In OpenGL, a vertex attribute array is a set of attributes associated with a vertex. By enabling it, you're indicating that data for this attribute will be sourced from an array.

##### glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, sizeof(float) * 2, 0);

This function call defines an array of vertex attribute data. Breaking it down:

- 0 specifies that this attribute is associated with index 0, which matches the index enabled with glEnableVertexAttribArray(0).

- 2 indicates that each vertex attribute is composed of two components (in this case, x and y for 2D coordinates).

- GL_FLOAT specifies the type of data in the array (float in this case).

- GL_FALSE indicates whether the data should be normalized. In this case, it's set to false.

- sizeof(float) * 2 is the stride, which specifies the byte offset between consecutive generic vertex attributes. It tells OpenGL the size of each vertex in memory.

- 0 is the pointer offset. It specifies the offset of the first component of the first generic vertex attribute in the array.

```c

    // Now we need to tell OpenGL how our data is laid out, is it a 2D Vector or 3D...

    glEnableVertexAttribArray(0);
    glVertexAttribPointer(0, 2, GL_FLOAT, GL_FALSE, sizeof(float) * 2,0);

```