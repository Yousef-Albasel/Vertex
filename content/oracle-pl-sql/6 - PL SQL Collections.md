---
title: "6   PL SQL Collections"
date: "2025-09-02"
category: "oracle"
description: ""
---

# 6 - PL SQL Collections

- Examining associative arrays
- Introducing nested tables
- Introducing VARRAY

```plsql
DECLARE
v_sal NUMBER;

begin
SELECT salary INTO v_sal FROM employees;
END
```
This will not work  because v_sal is not an array

```plsql
DECLARE
type arr is table of number index by pls_integer;
my_arr arr;
BEGIN
 for i in 101..110 loop
  select salary into v_sal(i) from employees where employee_id = i;
 end loop
END
```

Arrays methods
```plsql
array.first
array.last
array.count
array.prior -- previous index
array.next -- next index

```
