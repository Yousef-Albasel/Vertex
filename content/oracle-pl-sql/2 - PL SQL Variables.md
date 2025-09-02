---
title: "2   PL SQL Variables"
date: "2025-09-01"
category: "oracle"
description: "Variables in PL SQL"
---

# 2 - PL SQL Variables

We assign variables similar to how we define the table in SQL, by writing the name of the variable then the type we could also make a default value for it, then re-assign it inside the BEGIN block

```sql
DECLARE
  v_first varchar2(20):= 'Ask Gad';
BEGIN
  dbms_output.put_line('The value of v_first is:'||v_first);
END;
/
```
Or we can assign different variables like 

```sql
DECLARE
  v_first varchar2(20):= 'Ask Gad';
  v_num number;
  v_date date := sysdate+7;
  v_valid BOOLEAN := TRUE;
  v_COMM CONSTANT NUMBER := 200;
BEGIN
  dbms_output.put_line('The value of v_first is:'||v_first ||' And Date is '||v_date);
  
END;
/
```
Or we can load data into variables from actual database

```sql
DECLARE
  v_salary number;
BEGIN
  SELECT salary 
  INTO v_salary 
  FROM employees 
  WHERE employee_id = 100;
  
  v_comm := v_salary*.2;  
END;
/
```

### Bind Variables
v_salary is only accessed within the declare-begin-end block, a bind variable is different

```sql
VARIABLE v_salary number
BEGIN
  SELECT salary 
  INTO v_salary 
  FROM employees 
  WHERE employee_id = 100;
  
  v_comm := v_salary*.2;  
END;
print v_salary;
```