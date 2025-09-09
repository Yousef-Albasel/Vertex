---
title: "5   PL SQL Composite Data Types"
date: "2025-09-01"
category: "oracle"
description: ""
---

# 5 - PL SQL Composite Data Types

A composite datatype is a data structure that can have multiple different variables and datatypes inside it.

So `%rowtype` we can say it is used to capture entire row of the table inside a variable with the same column names and dtypes.

```sql
DECLARE
   v_employee employees%ROWTYPE; 
BEGIN
   SELECT * 
   INTO v_employee
   FROM employees
   WHERE employee_id = 100;

   DBMS_OUTPUT.PUT_LINE('Name: ' || v_employee.first_name || ' ' || v_employee.last_name);
END;
```
This way you make sure that whatever changes happen to the database, you will always have the right results.

In a case where you need to select specific columns, you need to make sure to specify where you put those columns inside the variable


```sql
DECLARE
   v_employee employees%ROWTYPE; 
BEGIN
   SELECT first_name,salary
   INTO v_employee.first_name,
        v_employee.salary
   FROM employees
   WHERE employee_id = 100;

   DBMS_OUTPUT.PUT_LINE('Name: ' || v_employee.first_name || ' ' || v_employee.last_name);
END;
```

## Structs in PL SQL (User Defined Records)
```sql
DECLARE
 type dept_type is record(
                        d_name varchar(30),
                        m_id departments.department_id%TYPE
                         );
var1 dept_type;
BEGIN
 SELECT department_name.department_id INTO var1.d_name, var1.m_id 
FROM departments
WHERE department_id = 20;
dbms_output.put_line(var1.d_name);
END
```
That's how we define a custom data type.