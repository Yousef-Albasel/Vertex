---
title: "P1 Getting Started with OpenGL"
description: "Introduction to the graphics api"
date: "2024-01-01"
category: "OpenGL"
image: "/images/opengl.jpg"

---

Welcome to my **OpenGL** adventure! 🚀 In this blog series, I'll be sharing my journey in world of **OpenGL** , starting from scratch and following **Cherno's** playlist and this site https://learnopengl.com/ .

it might take some time to master these concepts, but I'm committed to giving it my all.

**OpenGL**, or **Open Graphics Library,** is a powerful and cross-platform API (Application Programming Interface) used for rendering **2D** and **3D** graphics. It's widely employed in various fields, including video game development, simulations, virtual reality, and computer-aided design.

------------


The first thing we need to do before we start creating stunning graphics is to create an OpenGL context and an application window to draw in. However, those operations are specific per operating system and OpenGL purposefully tries to abstract itself from these operations. This means we have to create a window, define a context, and handle user input all by ourselves.

so for doing that we will use the [GLFW](https://www.glfw.org/download "GLFW") 32-bit Binaries

for simplicity, we will build using visual studio, all we need to do to get started is the `glfw3.lib` and `glfw3.h` header. 

so, after creating our project in visual studio we can start editing the configuration so the program knows where our headers are.

![](https://i.postimg.cc/JzdZMhZx/image.png)

after including our headers directory, next we need to tell the linker where our static library is.
`${SolutionDir}` **is a macro for where our .sln file is.**

![](https://i.postimg.cc/9Xp4cMj9/image.png)

Next we need to add the dependencies to the linker. Initially we only need to add the `glfw3.lib` but that raises a lot of errors because some more static libs are needed for the code to compile correctly, after resolving all the errors here are all the dependencies i needed to run the code "It should all be pre-installed in your device" 
`glfw3.lib;opengl32.lib;User32.lib;Gdi32.lib;Shell32.lib`

![](https://i.postimg.cc/3wKV5njm/image.png)

doing that , we are good to go to start creating our first triangle.
Here is the code we used to do so: 

```c
#include <GLFW/glfw3.h>

int main(void)
{
    GLFWwindow* window;

    /* Initialize the library */
    if (!glfwInit())
        return -1;

    /* Create a windowed mode window and its OpenGL context */
    window = glfwCreateWindow(640, 480, "Hello World", NULL, NULL);
    if (!window)
    {
        glfwTerminate();
        return -1;
    }

    /* Make the window's context current */
    glfwMakeContextCurrent(window);

    /* Loop until the user closes the window */
    while (!glfwWindowShouldClose(window))
    {
        /* Render here */
        glClear(GL_COLOR_BUFFER_BIT);

        glBegin(GL_TRIANGLES);
        glVertex2f(-0.5f, -0.5f);
        glVertex2f(0.0f, 0.5f);
        glVertex2f(0.5f,-0.5f);
        glEnd();

        /* Swap front and back buffers */
        glfwSwapBuffers(window);

        /* Poll for and process events */
        glfwPollEvents();
    }

    glfwTerminate();
    return 0;
}
```
![](https://i.postimg.cc/K8KrKLZw/image.png)

------------


It's very straight forward and easy to understand, we don't need to know more than that for now, if it compiles, we succeeded to use the Legacy openGL in our project, but next we need to install the Modern OpenGL to keep going.
