---
title: "P8 Transitions and Projection"
description: ""
date: "2024-01-01"
category: "OpenGL"
image: "/images/opengl.jpg"
---

### Transformations And Projection

In OpenGL, the way we manipulate vertices are using linear transformations, which is simple linear algebra operations like matrix multiplication, addition, Matrix-Vector product, etc..

We mainly have 3 kinds of linear transformations, **translate**, **scale** and **rotate**.

### Translate
To see why we're working with 4-by-1 vectors and subsequently 4-by-4 transformation matrices, let's see how a translation matrix is formed. A translation moves a vector a certain distance in a certain direction.

![](https://open.gl/media/img/c4_translation.png)
![](data:image/png;base64,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)

Without the fourth column and the bottom 1 value a translation wouldn't have been possible.

### Scale
A scale transformation scales each of a vector's components by a (different) scalar. It is commonly used to shrink or stretch a vector as demonstrated below.

![](https://open.gl/media/img/c4_scaling.png)
![](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCF4GRkX9DB7BYe3BNF_2iEchNnVEuvT-qLQ&usqp=CAU)

### Rotation


Objects can be rotated around any given axis, but for now only the X, Y and Z axis are important. You'll see later in this chapter that any rotation axis can be established by rotating around the X, Y and Z axis simultaneously.

The matrices for rotating around the three axes are specified here. The rotation angle is indicated by the theta (θ
![](https://open.gl/media/img/c4_rotation.png)

![](https://i.stack.imgur.com/spoba.png)

To prove these matrices, we will use basic linear algebra and trig identities illustrated below, for simplicity we will prove the rotation around z-axis because it's the easiest.

![](https://cdn.discordapp.com/attachments/956925681059647558/1204505838157566043/IMG_20240206_211344.jpg?ex=65d4fa7a&is=65c2857a&hm=4d26f8dd261b808bb49b34572592c0051210e71739807dd1d50adabb81286afe&)

### Coordinates in OpenGL

All vertices we render initially rendered in a local space (Object Coordinates) that are between [-1.0,1.0], or **NDC** (**Normalized Device Coordinate**).

But as you may notice that space isn't enough for us to make a game or anything, we need to scale down the objects, move them around and rotate them, all of that can be done using a **Model Matrix** in a **World space**, which is relatively a bigger space.

and since we don't have much freedom with our rendered objects, we need some sort of a camera to view them from different angles that's where we create our **View Matrix** and that's we call **View space ( eye coordinates)**

![](https://open.gl/media/img/c4_transformation.png)

Finally we need to create a feel of dimensions, where far objects appear smaller than closer objects. That's where we use **Projection Matrix**, but it's a little complicated so let's first define what a ** View Frustum** is.

#### View Frustum ( Orthographic Projection )

An orthographic projection matrix defines a cube-like frustum box that defines the clipping space where each vertex outside this box is clipped. When creating an orthographic projection matrix we specify the width, height and length of the visible frustum. All the coordinates inside this frustum will end up within the NDC range after transformed by its matrix and thus won't be clipped.

so simply, any object in the colored range will be visible, but won't be so realistic since it doesn't take perspective into account.

![](https://learnwebgl.brown37.net/_images/viewing_frustum.png)

#### View Frustum ( Perspective Projection )

perspective projection tries to mimic and it does so using a perspective projection matrix. The projection matrix maps a given frustum range to clip space, but also manipulates the w value of each vertex coordinate in such a way that the further away a vertex coordinate is from the viewer, the higher this w component becomes.

It also takes FOV into consideration, the bigger FOV, the smaller objects will look, since we are rendering a bigger chunk of space, so objects will looks smaller.


To transform the clipping coordinate into a normalized device coordinate, perspective division has to be performed. A clipping coordinate resulting from a perspective projection has a number different than 1 in the fourth row, also known as w. This number directly reflects the effect of objects further away being smaller than those up front using **Z-Depth testing** and it's also some algorithm that rasteraizor use im not really interested in that atm.
![](https://learnwebgl.brown37.net/_images/side_view_frustum.png)
![](https://i.stack.imgur.com/1qkwc.png)
a lot of math is going behind the scene that my brain won't handle, but if you are some math guru, here https://www.songho.ca/opengl/gl_projectionmatrix.html

### Camera/View space
When we're talking about camera/view space we're talking about all the vertex coordinates as seen from the camera's perspective as the origin of the scene: the view matrix transforms all the world coordinates into view coordinates that are relative to the camera's position and direction. 

To define a camera we need its position in world space, the direction it's looking at (x), a vector pointing to the right(z) and a vector pointing upwards(Y) from the camera. A careful reader may notice that we're actually going to create a coordinate system with 3 perpendicular unit axes with the camera's position as the origin.

![](https://learnopengl.com/img/getting-started/camera_axes.png)


In Practice
Guest Articles
Code repository
Translations
Privacy
About

Camera
In the previous chapter we discussed the view matrix and how we can use the view matrix to move around the scene (we moved backwards a little). OpenGL by itself is not familiar with the concept of a camera, but we can try to simulate one by moving all objects in the scene in the reverse direction, giving the illusion that we are moving.

In this chapter we'll discuss how we can set up a camera in OpenGL. We will discuss a fly style camera that allows you to freely move around in a 3D scene. We'll also discuss keyboard and mouse input and finish with a custom camera class.

Camera/View space
When we're talking about camera/view space we're talking about all the vertex coordinates as seen from the camera's perspective as the origin of the scene: the view matrix transforms all the world coordinates into view coordinates that are relative to the camera's position and direction. To define a camera we need its position in world space, the direction it's looking at, a vector pointing to the right and a vector pointing upwards from the camera. A careful reader may notice that we're actually going to create a coordinate system with 3 perpendicular unit axes with the camera's position as the origin.

#### 1- Camera position

Getting the camera position is easy. The camera position is a vector in world space that points to the camera's position. We set the camera at the same position we've set the camera in the previous chapter:
```C
glm::vec3 cameraPos = glm::vec3(0.0f, 0.0f, 3.0f);  
```
Don't forget that the positive z-axis is going through your screen towards you so if we want the camera to move backwards, we move along the positive z-axis.

#### 2- Camera direction
The next vector required is the camera's direction e.g. at what direction it is pointing at. For now we let the camera point to the origin of our scene: (0,0,0).

Remember that if we subtract two vectors from each other we get a vector that's the difference of these two vectors? Subtracting the camera position vector from the scene's origin vector thus results in the direction vector we want.

For the view matrix's coordinate system we want its z-axis to be positive and because by convention (in OpenGL) the camera points towards the negative z-axis we want to negate the direction vector. If we switch the subtraction order around we now get a vector pointing towards the camera's positive z-axis

```c
glm::vec3 cameraTarget = glm::vec3(0.0f, 0.0f, 0.0f);
glm::vec3 cameraDirection = glm::normalize(cameraPos - cameraTarget);
```

#### 3- Right axis

The next vector that we need is a right vector that represents the positive x-axis of the camera space. To get the right vector we use a little trick by first specifying an up vector that points upwards (in world space). Then we do a cross product on the up vector and the direction vector from step 2. Since the result of a cross product is a vector perpendicular to both vectors, we will get a vector that points in the positive x-axis's direction (if we would switch the cross product order we'd get a vector that points in the negative x-axis):

```c
glm::vec3 up = glm::vec3(0.0f, 1.0f, 0.0f); 
glm::vec3 cameraRight = glm::normalize(glm::cross(up, cameraDirection));
```

#### 4- Up axis 

is just the cross product between right and camera direction again

```c
glm::vec3 cameraUp = glm::cross(cameraDirection, cameraRight);
```

#### 5- Look at function
The glm::LookAt function requires a position, target and up vector respectively. This example creates a view matrix that is the same as the one we created in the previous chapter.

```c
glm::mat4 view;
view = glm::lookAt(glm::vec3(0.0f, 0.0f, 3.0f), 
  		   glm::vec3(0.0f, 0.0f, 0.0f), 
  		   glm::vec3(0.0f, 1.0f, 0.0f));
```