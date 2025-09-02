---
title: "NextJS Notes 1"
date: "2025-09-01"
category: "Web Development"
description: "Next.js development notes from JS Mastery channel"
---

# NextJS Notes 1

### Special Next.js pages and features:
Dynamic Routing In React:
```js
<Router>
 <Routes>
  <Route path='/' element={<Home />}/>
  <Route path='posts' element={<Posts />}>
    <Route path='/new' element={<NewPost/>}/>  {}
    <Route path=':postId' element={<Post />} /> {} /*Dynamic*/
  </Route>
</Routes>
</Router>
```

Dynamic Routing in Next.js:
We create a new folder callid [postId], inside this we create a page.js
```js
/*page.js*/
import React from 'react'
const page = () = >{
return (
<div>{postId}</div>
 )
}
```

We can also create a layout.js file inside a route for example posts, the purpose of this is to allow the sharing of react components inside pages, so if we need a 'Navigate to top' button that is shared between posts pages as well as newposts pages. We also can create a loading.js so we can render some kind of a Loading spinner.

### Error Handling
we need  to create an error.js file 
it might look something like this
```js
'use client'
import {useEffect} from 'react';
const Error = ({error,reset}) => {
useEffect(()=>{
console.error(error);
},[error]);
return (
  <div>
    <h2> Something went wrong! </h2>
    <button onClick={()=>reset()}>
  </div>  
 )
}
```
