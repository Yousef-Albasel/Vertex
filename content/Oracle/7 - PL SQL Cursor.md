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

- **SQL%ROWCOUNT** → number of rows affected.
- **SQL%FOUND** → TRUE if rows were affected.
- **SQL%NOTFOUND** → TRUE if no rows were affected.
- **SQL%ISOPEN** → always> 
## Explicit Cursor
- Declare
- Open
- Fetch
- Close

### Explicit Cursor Attributes
- **%ISOPEN**
    - Checks if the cursor is read
- **%FOUND**
    - Checks if data is found
- **%NOTFOUND**
    - Checks if data is not f
- **%ROWCOUNT**
    - returns number of data returned


## FOR UPDATE
This keyword locks the records a cursor is selecting until you finish working on the query.

```plsql
DECLARE 
cursor c_emp is
       SELECT * FROM Employee WHERE Department_id = 30 FOR UPDATE
BEGIN
     for v_emp in c_emp
     LOOP
     dbms_output.putline(...)
     END LOOP
END                       
```
Now if someone is trying to update this row the cursor is pointing at he can't as its locked for waiting until you rollback or you can define it so it gives him an error or wait for some time.

## FOR UPDATE nowait

Gives you an error immedieatly if resource is busy.

## Current of (VERY IMPORTANT)
Imagine a case where you have a table EMP that has 2 duplicate employees with same name and same salary
when you write a sql cursor loop
```sql
DECLARE
cursor c_emp is
select * from EMP for update;
BEGIN
FOR row in c_emp 
LOOP
update EMP set salary = salary + 1000
    where name = row.name;
END LOOP;
END

```
This code will give you a problem because it loops and uses update statments which loops again to find a row that matches the name from your cursor, making it n^2 complexity in addition to it will increase the salary twice for duplicate names to fix this we use where current
```plsql
CURSOR c_emp IS
  SELECT * FROM emp FOR UPDATE;

FOR row IN c_emp LOOP
  UPDATE emp
  SET salary = salary + 1000
  WHERE CURRENT OF c_emp;
END LOOP;
END
```