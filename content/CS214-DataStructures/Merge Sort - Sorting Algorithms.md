---
title: "Merge Sort"
description: "A Merge sort algorithm implementation"
date: "2024-02-20"
category: "Algorithms"
image: "/images/algorithms.png"

---

For two input sequences that contain a total of n
elements, we need to move each element’s input
sequence to its output sequence

Merge time is **O(n)**
Total running time: **Θ(nlogn)**

We need to be able to store both initial sequences and
the output sequence

The array cannot be merged in place

Additional space usage is **O(n)**

```c
#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;
void merge(int arr[], int left, int middle, int right);

void mergeSort(int arr[], int left, int right)
{
    if (left >= right)
        return;

    int middle = (left + right) / 2;
    mergeSort(arr, left, middle);
    mergeSort(arr, middle + 1, right);
    merge(arr, left, middle, right);
}

void merge(int arr[], int left, int middle, int right)
{
    int n1 = middle - left + 1;
    int n2 = right - middle;
    int *leftArr = new int[n1];
    int *rightArr = new int[n2];

    // now copy elements into these array

    for (int i = 0; i < n1; i++)
        leftArr[i] = arr[i + left];

    for (int i = 0; i < n2; i++)
        rightArr[i] = arr[i + middle + 1];

    int r = 0, l = 0, k = left; // ptrs for each sub array

    while (l < n1 && r < n2)
    {
        if (leftArr[l] < rightArr[r])
        {
            arr[k] = leftArr[l];
            l++;
        }
        else
        {
            arr[k] = rightArr[r];
            r++;
        }
        k++;
    }

    while (l < n1)
        arr[k] = leftArr[l], k++, l++;
    while (r < n2)
        arr[k] = rightArr[r], k++, r++;

    delete[] leftArr;
    delete[] rightArr;
}
```

