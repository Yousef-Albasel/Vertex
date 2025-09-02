---
title: "Data Fetching in Nextjs"
date: "2025-09-01"
category: "Web Development"
description: ""
---

# Data Fetching in Nextjs

- Server Side Rendering (SSR)
```js
async function Page({params}) {
 const res = await fetch(
 'https://../posts/${params.id},
 {cache:'no-store'} <-- server side, refetches every time.
 );
const data = await res.json();
return ( use data here)
}
```
- Static Site Generation (SSG)
by default, next js caches the data it fetches.
```js
async function Page({params}) {
 const res = await fetch(
 'https://../posts/${params.id},
 );
return ( use data here)
}
```
- Incremental Static Generation (ISG)
```js
async function Page({params}) {
 const res = await fetch(
 'https://../posts/${params.id},
 {next: {revalidate:10} } /*<-- Combines the benefits from SSR and SSG, you can specify certain
 data to be statically fetched and build time and
revalidated each time interval*/  );
return ( use data here)
}
``` 

To make API routes, we depend on api folder, and we create route.js to implement RestfulAPIs
```js
export async function GET(request){
const users = [
{id:1,name:'john}
];
return new Response(JSON.stringify(users))
}
```
```js
export async function HEAD(request){
}
```
```js
export async function POST(request){
}
```
```js
export async function PUT(request){
}
```
```js
export async function DELETE(request){
}
```

