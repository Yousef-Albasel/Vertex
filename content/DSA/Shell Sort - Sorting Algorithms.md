---
title: "Shell Sort"
description: "A Shell Sort algorithm implementation"
date: "2024-02-20"
image: "/images/algorithms.png"

category: "Algorithms"
---
### Shell Sort

- A variation of the insertion sort But faster than **O(n&sup2;)**

- Done by sorting subarrays of equally spaced indices

- Instead of moving to an adjacent location an element moves several
locations away

Start with sub arrays created by looking at data that is far apart and
then reduce the gap size

```c
void shellSort(vector<int> &v, int n)
{
    for (int gap = n / 2; gap > 0; gap /= 2) // deviding gap until it's 1
    {
        for (int i = gap; i < n; i++)
        {
            // Now Implementing Insertion Sort
            int Temp = v[i];
            int j = i;
            for (; j >= gap && Temp < v[j - gap]; j -= gap)
            {
                v[j] = v[j - gap];
            }
            v[j] = Temp;
        }
    }
}
```
