---
title: "Heap"
description: "A Heap algorithm implementation"
date: "2024-02-20"
category: "Algorithms"
image: "/images/algorithms.png"

---

A heap is a nearly complete binary tree with the following two properties:

- **Structural property:** all levels are full, except possibly the last one, which is filled from left to right

- **Max (heap) property:** for any node x Parent(x) ≥ x
- Root of tree is A[1]

- Left child of A[i] = A[2i]

- Right child of A[i] = A[2i + 1]

- Parent of A[i] = A[ ⎣i/2⎦ ]

- Heapsize[A] ≤ length[A]
![[Pasted image 20240601205517.png]]

### Operations on Heap
---
- Maintain/Restore the max-heap property -> **O($log{n}$)**
- Create a max-heap from an unordered array -> O($n.log{n}$)
- Sort an array in place 
- Priority queues


**1 - Max Heapify**
```cpp
  

void MaxHeap::MaxHeapify(int i, int n)

{

    int left = Left(i);

    int right = Right(i);

    int largest = i;

  

    if (left < n && Heap[left] > Heap[largest])

        largest = left;

  

    if (right < n && Heap[right] > Heap[largest])

        largest = right;

  

    if (largest != i)

    {

        std::swap(Heap[i], Heap[largest]);

        MaxHeapify(largest, n);

    }

}
```

**2- Build a Max Heap**

```cpp
void MaxHeap<T>::BuildMaxHeap() {

    for (int i = size / 2 - 1; i >= 0; --i) {

        MaxHeapify(i, size);

    }
}
```

**3- Heap Sort**
- Swap first and last
- Max Heapify
- Discard
```cpp
void MaxHeap<T>::HeapSort() {

    BuildMaxHeap();

    for (int i = size - 1; i > 0; --i) {

        std::swap(Heap[0], Heap[i]);

        MaxHeapify(0, i);

    }

}
```

### Operations on Priority Queues

Max-priority queues support the following operations:

**INSERT(S, x):** inserts element x into set S O($log{n}$)
```c
void insertKey(vector<int>& A, int key, int& heap_size) {
heap_size = heap_size + 1;
if (heap_size >= A.size()) {
	A.push_back(INT_MIN); 
} else {
	A[heap_size] = INT_MIN;
} 
HEAP_INCREASE_KEY(A, heap_size, key); }
```
**EXTRACT-MAX(S):** removes and returns element of S with largest key **O($log{n}$)**
```c
int ExtractMax(A,n){
int mx = A[1]
A[1] = A[n];
maxheapify(A,1,n-1);
return mx;
}
```
**MAXIMUM(S):** returns element of S with largest key **O(1)**
 
**INCREASE-KEY(S, x, k)**: increases value of element x’s key to k (Assume k ≥ x’s current key value) O($log{n}$)

```c
IncreaseKey(int A[], int i, int key){
if key < A[i]
 	cerr << “new key is smaller than current key”;

A[i] = key;

while i > 1 && A[PARENT(i)] < A[i] // This loop is to bubble up the elements larger than the parent, to ensure heap property 
	{
		swap(A[i],A[PARENT(i)])
		i = PARENT(i)
	}
}
```
