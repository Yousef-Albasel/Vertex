---
title: "7 - PL SQL Cursor"
date: "2025-09-02"
category: ""
description: ""
---

# 7   Cursor

A cursor in PL/SQL is a pointer (or handle) to the result set of a SQL query.

- It allows PL/SQL to access rows returned by SQL one by one.
- Without cursors, PL/SQL wouldn’t know how to deal with multi-row results.

## Implicit Cursors:
Created automatically by Oracle when you run a SQL statement.
Used for:
- INSERT, UPDATE, DELETE, MERGE
- SELECT ... INTO ... (must return exactly one row).

Attributes you can check:

- SQL%ROWCOUNT → number of rows affected.
- SQL%FOUND → TRUE if rows were affected.
- SQL%NOTFOUND → TRUE if no rows were affected.
- SQL%ISOPEN → always FALSE (they auto-close).

