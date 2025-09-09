---
title: "4   PL SQL loops"
date: "2025-09-01"
category: "oracle"
description: " Loops in PL SQL"
---

# 4 - PL SQL loops
We have 3 types of loop
- basic loop
- for loop
- while loop

```sql
LOOP
   statements
   ....
   EXIT [WHEN condition];
END LOOP;
```

An example:
```sql
DECLARE
  v_grade CHAR(1) := UPPER('&char1');
  appraisal VARCHAR2(10);
  counter number := 2;
BEGIN
LOOP
   counter := counter + 1;
   dbms_output.put_line('Hello World');
   EXIT WHEN (counter = 10);
end loop;
END;
/
```

The next is while loops this is the syntax


```sql
WHILE condition LOOP
   statements
   ....
END LOOP;
```

Finally FOR loops:
```sql
FOR counter IN [REVERSE]
   lower_bound..upper_bound LOOP
   statements...
END LOOP;
```

```sql
DECLARE
BEGIN
  for i in REVERSE 1..10 loop
     dbms_output.put_line(i);
     end loop;
END;
```

