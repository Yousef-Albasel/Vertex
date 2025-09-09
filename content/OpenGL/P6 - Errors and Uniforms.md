---
title: "P6 Errors and Uniforms"
description: ""
date: "2024-01-01"
category: "OpenGL"
image: "/images/opengl.jpg"

---

## Errors in OpenGL

------------

OpenGL doesn't provide a clear error logging so we will create one, without getting in much details here is the code that we created

```c
#define ASSERT(x) if (!(x)) __debugbreak();
#define GLCall(x) GLClearError();\
    x;\
    ASSERT(GLLogCall(#x,__FILE__,__LINE__))

static void GLClearError() {
    while (glGetError() != GL_NO_ERROR) ;
}

static bool GLLogCall(const char* function,const char* file,int line) {
    while (GLenum error = glGetError()) {
        std::cout << "[OPENGL ERROR] (" << error << "):" << function <<
            " " << file << ":" << std::endl;

        return false;
    }
    return true;
}
```
In simple terms, we are defining two macros: one for ASSERT, which will halt the application and mark the error's position with a break point, and another for automatically calling GLClearError, which will display the error line, file name, location, etc. only for the sake of clean code

now each time we want to check if a function call returns an error we can use GLCall(); eg: 

```c
GLCall(glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, nullptr));
```

and that's it, next we cover uniforms in OpenGL.

----

## Uniforms

Uniforms are basically like a variable that gets assigned in a shader then manipulated inside our c++ program so for example if i modify our fragment shader to have a 
`uniform vec4 uColor;` then use it in our shader.
```
void main()
{
	color = u_Color;
};
```
what we can do now is to find the location of that uniform call and update the values in real time inside our render loop 
```c
        GLCall(int location = glGetUniformLocation(shader, "u_Color"));
        ASSERT(location != -1);
        GLCall(glUniform4f(location,0.2f,0.3f,0.4f,1.0f));
    /* Loop until the user closes the window */
        float r = 0.0f;
        float increment = 0.05f;
```


inside render loop:

```c
        GLCall(glUniform4f(location, r,0.4f,0.3f, 1.0f));

        GLCall(glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, nullptr));
        
        if (r > 1.0f)
            increment = -0.05f;
        else if (r <= 0.0f)
            increment = 0.05f;

        r += increment;
```
