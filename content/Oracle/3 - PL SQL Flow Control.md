---
title: "3   PL SQL Flow Control"
date: "2025-09-01"
category: "Oracle"
description: "If conditions in PL-SQL"
---

# 3 - PL SQL Flow Control
Flow control in PL SQl can be done in 2 ways, one way is using IF, else Statements

```sql
DECLARE
 v_no number:= &number1;
BEGIN
 if v_no > 0
   then
     dbms_output.put_line('You Entered a Positive Number');
 else
     dbms_output.put_line('You Entered a Negative Number');
 end if;
end;
/
```
Another way is defined using `CASE` statements, now let's compare between both ways.
```sql
DECLARE
  v_letter CHAR(1) := UPPER('&char1');
BEGIN
  IF v_letter = 'A' THEN
    DBMS_OUTPUT.PUT_LINE('Excellent');
  ELSIF v_letter = 'B' THEN
    DBMS_OUTPUT.PUT_LINE('Good');
  ELSE
    DBMS_OUTPUT.PUT_LINE('Not Found');
  END IF;
END;
/
``` 
Now to write this using CASE statements
```sql
DECLARE
  v_letter CHAR(1) := UPPER('&char1');
BEGIN
CASE v_grade
when 'A' then DBMS_OUTPUT.put_line('Excellint')
when 'B' then
...
END;
/
``` 
This is the same as using switch statements in normal programming languages.
Also equivilent to
```sql
DECLARE
  v_letter CHAR(1) := UPPER('&char1');
BEGIN
CASE 
when v_grade 'A' then DBMS_OUTPUT.put_line('Excellint')
when v_grade 'B' then
...
END;
/
``` 
also we can edit the variable value inside the begin block

```sql
DECLARE
  v_grade CHAR(1) := UPPER('&char1');
  appraisal VARCHAR2(20);
BEGIN
   appraisal := CASE v_grade
                  WHEN 'A' THEN 'Excellent'
                  WHEN 'B' THEN 'V.Good'
                  WHEN 'C' THEN 'Good'
                  ELSE 'Not Found'
                END;
   DBMS_OUTPUT.PUT_LINE('The appraisal for grade ' || v_grade || ' is ' || appraisal);
END;
/
``` 

Important note must use '' not "" for printing strings